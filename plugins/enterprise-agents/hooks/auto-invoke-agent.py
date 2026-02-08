#!/usr/bin/env python3
"""
Auto-Invoke Agent Hook for Enterprise Agents Plugin

Analyzes user prompts and suggests or automatically invokes appropriate agents.
Runs on PreUserPrompt event to detect intent before Claude processes the message.
"""

import json
import re
import sys
from typing import Dict, List, Optional, Tuple


# Agent detection patterns
# Format: (agent, mode, keywords, confidence_threshold)
AGENT_PATTERNS = [
    # HR Agent
    ("hr", "policy", ["policy", "policies", "handbook", "rules", "guidelines", "regulations"], 0.7),
    ("hr", "benefits", ["benefits", "insurance", "401k", "pto", "vacation", "medical", "dental", "health insurance"], 0.8),
    ("hr", "engagement", ["engagement", "satisfaction", "morale", "survey", "retention", "culture"], 0.7),
    ("hr", "onboarding", ["onboarding", "onboard", "new hire", "first day", "orientation"], 0.9),
    ("hr", "exit-interview", ["exit", "leaving", "resignation", "offboarding", "offboard", "quit"], 0.8),

    # Marketing Agent
    ("marketing", "blog", ["blog", "article", "write about", "post about", "content about"], 0.8),
    ("marketing", "social", ["social media", "tweet", "linkedin post", "facebook", "instagram", "social content"], 0.9),
    ("marketing", "campaign", ["campaign", "marketing campaign", "promotion", "launch"], 0.8),
    ("marketing", "press-release", ["press release", "media release", "announcement", "press"], 0.9),
    ("marketing", "newsletter", ["newsletter", "email campaign", "email marketing"], 0.9),

    # Recruitment Agent
    ("recruitment", "jd", ["job description", "jd", "hiring for", "recruit for", "position for", "role description"], 0.9),
    ("recruitment", "screening", ["screening", "candidate screening", "qualify candidates", "evaluation criteria"], 0.8),
    ("recruitment", "interview", ["interview questions", "interview guide", "ask candidates", "interview"], 0.8),
    ("recruitment", "comparison", ["compare candidates", "candidate comparison", "which candidate", "vs"], 0.7),
    ("recruitment", "offer", ["offer letter", "job offer", "employment offer", "compensation offer"], 0.9),

    # Presales Agent
    ("presales", "proposal", ["proposal", "sales proposal", "solution proposal"], 0.8),
    ("presales", "competitor", ["competitor", "competition", "vs", "compare to", "competitive analysis"], 0.7),
    ("presales", "rfp", ["rfp", "rfq", "rfi", "request for proposal", "bid"], 0.9),
    ("presales", "pitch-deck", ["pitch deck", "sales deck", "presentation", "pitch"], 0.8),
    ("presales", "win-loss", ["win-loss", "why we lost", "why we won", "deal analysis"], 0.9),

    # IT Operations Agent
    ("it-ops", "incident", ["incident", "outage", "downtime", "production issue", "site down"], 0.8),
    ("it-ops", "monitoring", ["monitoring", "alerting", "observability", "metrics", "apm"], 0.7),
    ("it-ops", "automation", ["automation", "automate", "script", "automated"], 0.6),
    ("it-ops", "documentation", ["runbook", "playbook", "documentation", "operating procedures"], 0.7),

    # Learning & Development Agent
    ("learning", "skill-gap", ["skill gap", "skills assessment", "competency", "skills needed"], 0.8),
    ("learning", "learning-path", ["learning path", "career path", "development plan", "training plan"], 0.9),
    ("learning", "training", ["training", "course", "curriculum", "workshop", "education"], 0.6),
    ("learning", "assessment", ["assessment", "test", "evaluation", "quiz", "certification"], 0.7),

    # LinkedIn Agent
    ("linkedin", None, ["linkedin", "professional post", "thought leadership", "linkedin content"], 0.9),

    # Sustainability Agent
    ("sustainability", "carbon-footprint", ["carbon footprint", "carbon emissions", "co2", "carbon"], 0.9),
    ("sustainability", "green-it", ["green it", "green technology", "sustainable it", "eco-friendly"], 0.8),
    ("sustainability", "sustainability-report", ["sustainability report", "esg report", "environmental report"], 0.9),
    ("sustainability", "energy-optimization", ["energy optimization", "power consumption", "energy efficiency"], 0.8),
    ("sustainability", "esg-compliance", ["esg", "esg compliance", "environmental compliance"], 0.9),

    # Accessibility Agent
    ("accessibility", "wcag-audit", ["wcag", "accessibility audit", "a11y audit", "compliance audit"], 0.9),
    ("accessibility", "remediation-plan", ["remediation", "accessibility fixes", "a11y fixes"], 0.8),
    ("accessibility", "alt-text", ["alt text", "image description", "alternative text"], 0.9),
    ("accessibility", "aria-review", ["aria", "aria review", "screen reader"], 0.9),
    ("accessibility", "compliance-report", ["accessibility compliance", "a11y compliance", "ada compliance"], 0.9),

    # Cloud Operations Agent
    ("cloud-ops", "cost-optimization", ["cost optimization", "reduce costs", "cloud costs", "finops"], 0.8),
    ("cloud-ops", "incident-response", ["cloud incident", "aws outage", "azure issue", "gcp problem"], 0.8),
    ("cloud-ops", "capacity-planning", ["capacity planning", "scaling", "capacity", "load planning"], 0.8),
    ("cloud-ops", "architecture-review", ["architecture review", "cloud architecture", "design review"], 0.8),
    ("cloud-ops", "migration-assessment", ["cloud migration", "migrate to cloud", "move to cloud"], 0.9),
]

# Workflow patterns
WORKFLOW_PATTERNS = [
    ("recruitment-pipeline", ["hire", "hiring process", "recruitment process", "end to end hiring"]),
    ("content-campaign", ["content campaign", "marketing campaign", "content launch", "multi-channel"]),
    ("hire-to-onboard", ["hire and onboard", "onboarding process", "new hire process"]),
    ("proposal-development", ["rfp response", "proposal development", "comprehensive proposal"]),
    ("product-launch", ["product launch", "feature launch", "launch campaign"]),
    ("incident-postmortem", ["postmortem", "post-mortem", "incident review", "rca"]),
    ("accessibility-compliance", ["accessibility compliance", "wcag compliance", "a11y project"]),
]


def detect_agent(text: str) -> Optional[Tuple[str, Optional[str], float]]:
    """
    Detect which agent should handle the user's query.

    Returns: (agent_name, mode, confidence_score) or None
    """
    text_lower = text.lower()

    best_match = None
    best_confidence = 0.0

    for agent, mode, keywords, threshold in AGENT_PATTERNS:
        # Count keyword matches
        matches = sum(1 for keyword in keywords if keyword in text_lower)

        if matches > 0:
            # Calculate confidence: (matches / total_keywords) weighted by keyword specificity
            confidence = min(matches / len(keywords) * 1.5, 1.0)

            # Boost confidence for exact phrase matches
            for keyword in keywords:
                if keyword in text_lower and len(keyword.split()) > 1:
                    confidence = min(confidence * 1.2, 1.0)

            if confidence >= threshold and confidence > best_confidence:
                best_match = (agent, mode, confidence)
                best_confidence = confidence

    return best_match


def detect_workflow(text: str) -> Optional[Tuple[str, float]]:
    """
    Detect if user query matches a workflow pattern.

    Returns: (workflow_name, confidence_score) or None
    """
    text_lower = text.lower()

    for workflow_name, keywords in WORKFLOW_PATTERNS:
        for keyword in keywords:
            if keyword in text_lower:
                # Higher confidence for multi-word exact matches
                confidence = 0.9 if len(keyword.split()) > 1 else 0.7
                return (workflow_name, confidence)

    return None


def extract_topic(text: str) -> str:
    """Extract the main topic from the user's query."""
    # Remove common question prefixes
    patterns_to_remove = [
        r"^(can you |could you |please |help me |i need to |i want to |how do i |how to )",
        r"(create|generate|write|make|develop|design|build)\s+(a|an|the)\s+",
    ]

    cleaned = text
    for pattern in patterns_to_remove:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    return cleaned.strip()


def main():
    """Main hook execution."""
    # Read context from stdin (Claude Code passes context as JSON)
    try:
        context = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        # If no context provided, allow the prompt to proceed
        print(json.dumps({"action": "allow"}))
        return 0

    user_prompt = context.get("prompt", "")

    if not user_prompt or len(user_prompt.strip()) < 10:
        # Prompt too short to analyze
        print(json.dumps({"action": "allow"}))
        return 0

    # Check if user is already invoking a command
    if user_prompt.strip().startswith("/"):
        # User is explicitly using a command, don't interfere
        print(json.dumps({"action": "allow"}))
        return 0

    # Detect workflow
    workflow_match = detect_workflow(user_prompt)
    if workflow_match:
        workflow_name, confidence = workflow_match
        topic = extract_topic(user_prompt)

        suggestion = f"""
💡 Auto-detection: This looks like a multi-step process!

Detected workflow: **{workflow_name}**
Confidence: {confidence * 100:.0f}%

Would you like me to:
1. Run the full workflow: `/workflow {workflow_name} "{topic}"`
2. Just answer your question normally

The workflow will automatically coordinate multiple agents and handle the entire process.
"""

        result = {
            "action": "augment",
            "message": suggestion.strip(),
            "metadata": {
                "detected": "workflow",
                "workflow": workflow_name,
                "confidence": confidence
            }
        }
        print(json.dumps(result))
        return 0

    # Detect agent
    agent_match = detect_agent(user_prompt)
    if agent_match:
        agent, mode, confidence = agent_match
        topic = extract_topic(user_prompt)

        # For high-confidence matches, suggest the agent
        if confidence >= 0.8:
            mode_str = f" --mode {mode}" if mode else ""
            suggestion = f"""
💡 Auto-detection: This looks like a job for the **{agent.upper()} agent**!
Confidence: {confidence * 100:.0f}%
{f"Mode: {mode}" if mode else ""}

Would you like me to:
1. Invoke: `/{agent}{mode_str} "{topic}"`
2. Just answer your question normally

Enterprise agents provide structured, comprehensive output with document export.
"""

            result = {
                "action": "augment",
                "message": suggestion.strip(),
                "metadata": {
                    "detected": "agent",
                    "agent": agent,
                    "mode": mode,
                    "confidence": confidence
                }
            }
            print(json.dumps(result))
            return 0

    # No strong match, allow normal processing
    print(json.dumps({"action": "allow"}))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        # On error, allow the prompt to proceed
        print(json.dumps({"action": "allow", "error": str(e)}), file=sys.stderr)
        sys.exit(0)
