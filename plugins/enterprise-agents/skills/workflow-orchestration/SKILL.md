---
name: Workflow Orchestration
description: Expertise in chaining multiple enterprise agents together to handle complex, multi-step business processes
version: 1.0.0
---

# Workflow Orchestration Skill

Expertise in chaining multiple enterprise agents together to handle complex, multi-step business processes.

## When to Use This Skill

Automatically invoked when:
- User request involves multiple agent domains (e.g., "hire and onboard a new engineer")
- Task has clear sequential dependencies (e.g., "create RFP response and sales follow-up")
- Complex process needs coordination (e.g., "launch new product from content to sales")

Manually invoke when:
- Designing multi-agent workflows
- Automating business processes
- Creating templates for common scenarios
- Optimizing agent execution order

## Core Concepts

### 1. Workflow Patterns

**Sequential** - One agent output feeds into next agent input
```
[Marketing: Blog] → [LinkedIn: Thought Leadership] → [Presales: Sales Deck]
```

**Parallel** - Multiple agents run simultaneously, results merged
```
[HR: Policy] ⎤
[IT-Ops: Setup] ⎥ → [Merged Onboarding Package]
[Learning: Path] ⎦
```

**Conditional** - Agent selection based on previous output
```
[Recruitment: JD] → IF senior role → [Learning: Leadership Track]
                   → IF junior role → [Learning: Fundamentals]
```

**Iterative** - Agent output refined through multiple passes
```
[Marketing: Draft] → [Review] → [Marketing: Refine] → [Review] → [Final]
```

### 2. Context Passing

**What to pass between agents:**
- Core topic/subject
- Key decisions or parameters from previous step
- Constraints or requirements
- Brand/company context
- Output format preferences

**What NOT to pass:**
- Entire previous output (summarize key points)
- Redundant context
- Intermediate working data
- Agent-internal metadata

**Example:**
```typescript
// Recruitment agent output
{
  position: "Senior Data Engineer",
  keySkills: ["Python", "Spark", "Airflow"],
  seniorityLevel: "Senior",
  teamSize: 5
}

// Passed to HR agent for onboarding
{
  topic: "Create onboarding plan",
  context: "Senior Data Engineer joining 5-person data team, technical focus: Python/Spark/Airflow",
  mode: "onboarding"
}
```

### 3. Workflow State Management

**Track throughout workflow:**
- Original user intent
- Current step in workflow
- Outputs from previous agents
- Decisions made
- Any errors or warnings

**State object structure:**
```typescript
interface WorkflowState {
  workflowId: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  steps: WorkflowStep[];
  currentStepIndex: number;
  originalQuery: string;
  context: Record<string, any>;
  outputs: Record<string, any>;
  errors: string[];
}
```

## Pre-Built Workflow Templates

### 1. Recruitment Pipeline

**Purpose:** End-to-end hiring process
**Agents:** Recruitment → HR → IT-Ops → Learning

```bash
/workflow recruitment-pipeline "Senior Software Engineer"

Steps:
1. /recruitment --mode jd
   → Generate job description
2. /recruitment --mode screening
   → Create screening criteria
3. /recruitment --mode interview
   → Develop interview questions
4. /recruitment --mode offer
   → Draft offer letter (once candidate selected)
5. /hr --mode onboarding
   → Create onboarding plan
6. /it-ops --mode automation
   → Provision IT resources
7. /learning --mode learning-path
   → Build role-specific learning path

Output: Complete hiring package with all documents
```

### 2. Content Marketing Campaign

**Purpose:** Multi-channel content launch
**Agents:** Marketing → LinkedIn → Presales → Sustainability

```bash
/workflow content-campaign "AI-Powered Cloud Optimization"

Steps:
1. /marketing --mode blog
   → Create thought leadership blog post
2. /marketing --mode social
   → Generate 3x LinkedIn posts, 5x tweets (parallel)
3. /linkedin --context "CTO perspective"
   → Executive thought leadership post
4. /presales --mode pitch-deck
   → Sales enablement deck from blog
5. /marketing --mode newsletter
   → Customer newsletter section
6. /sustainability --mode green-it
   → Sustainability angle (if relevant to topic)

Output: Multi-channel content package
```

### 3. Hire-to-Productive Workflow

**Purpose:** New hire → fully productive team member
**Agents:** Recruitment → HR → IT-Ops → Learning → Marketing (internal)

```bash
/workflow hire-to-onboard "Jane Doe - Senior DevOps Engineer"

Steps:
1. /recruitment --mode offer
   → Finalize offer letter
2. [Wait for offer acceptance]
3. /hr --mode onboarding
   → Create 30-60-90 day plan
4. /it-ops --mode automation
   → Provision: laptop, accounts, VPN, tools
5. /learning --mode learning-path
   → Role-specific training plan
6. /it-ops --mode documentation
   → Team runbooks and playbooks
7. /marketing --mode newsletter
   → Welcome announcement for team newsletter

Output: Complete onboarding package + IT setup checklist
```

### 4. Proposal Development

**Purpose:** RFP response → sales follow-up
**Agents:** Presales → Cloud-Ops → Sustainability → Accessibility

```bash
/workflow proposal-development "Healthcare EHR Migration RFP"

Steps:
1. /presales --mode rfp
   → Primary RFP response
2. /cloud-ops --mode architecture-review
   → Technical architecture for proposal
3. /cloud-ops --mode cost-optimization
   → Pricing and cost analysis
4. /sustainability --mode carbon-footprint
   → Sustainability/green IT section
5. /accessibility --mode compliance-report
   → Accessibility compliance (HIPAA, ADA)
6. /presales --mode pitch-deck
   → Executive presentation
7. /marketing --mode case-study
   → Relevant customer success stories

Output: Comprehensive proposal package
```

### 5. Product Launch Workflow

**Purpose:** Launch new product/feature
**Agents:** Marketing → Presales → HR → Learning

```bash
/workflow product-launch "New AI Assistant Feature"

Steps:
1. /marketing --mode blog
   → Launch announcement blog
2. /marketing --mode press-release
   → Press release
3. /marketing --mode social
   → Social media content (parallel)
4. /presales --mode pitch-deck
   → Sales pitch deck
5. /presales --mode competitor
   → Competitive positioning
6. /hr --mode policy
   → Internal usage guidelines
7. /learning --mode training
   → Employee training materials

Output: Launch package (internal + external)
```

### 6. Incident Response → Learning

**Purpose:** Post-incident learning and improvement
**Agents:** IT-Ops → Cloud-Ops → Learning → Sustainability

```bash
/workflow incident-postmortem "Production Database Outage - Dec 5"

Steps:
1. /it-ops --mode incident
   → Incident retrospective and RCA
2. /cloud-ops --mode architecture-review
   → Architecture improvements
3. /it-ops --mode automation
   → Automation to prevent recurrence
4. /learning --mode training
   → Training for on-call engineers
5. /sustainability --mode carbon-footprint
   → Energy impact analysis (if major outage)
6. /it-ops --mode documentation
   → Update runbooks

Output: Postmortem report + prevention plan
```

### 7. Accessibility Compliance Project

**Purpose:** Audit → remediate → verify
**Agents:** Accessibility → Cloud-Ops → Learning → Marketing

```bash
/workflow accessibility-compliance "Corporate Website WCAG 2.1 AA"

Steps:
1. /accessibility --mode wcag-audit
   → Full WCAG audit
2. /accessibility --mode remediation-plan
   → Prioritized remediation backlog
3. /cloud-ops --mode architecture-review
   → Infrastructure changes needed
4. /learning --mode training
   → Developer accessibility training
5. /accessibility --mode aria-review
   → ARIA implementation review
6. /marketing --mode blog
   → "Our Commitment to Accessibility" post

Output: Compliance roadmap + training plan
```

## Workflow Design Best Practices

### 1. Start with User Intent

**Ask:**
- What is the end goal?
- Who benefits from the workflow?
- What decisions need to be made along the way?
- What constraints exist (time, budget, compliance)?

**Example user intent:** "I want to hire a developer"

**Bad workflow:** Recruitment JD → Done (too narrow)
**Good workflow:** JD → Screening → Interview → Offer → Onboarding → IT Setup → Training (complete process)

### 2. Minimize Dependencies

**Prefer parallel over sequential when possible**

Sequential (slow):
```
Agent A (5 min) → Agent B (5 min) → Agent C (5 min) = 15 minutes
```

Parallel (fast):
```
Agent A (5 min) ⎤
Agent B (5 min) ⎥ = 5 minutes
Agent C (5 min) ⎦
```

**Example:** Marketing campaign content
- Blog, social posts, newsletter can be generated in parallel
- Pitch deck depends on blog (sequential)

### 3. Handle Failures Gracefully

**Failure scenarios:**
- Agent timeout
- API rate limit
- Invalid input
- Empty output
- User cancellation

**Strategies:**
- **Retry with backoff** - Network issues, rate limits
- **Skip and continue** - Non-critical step
- **Prompt for manual input** - Invalid/empty output
- **Rollback** - Critical failure, undo previous steps
- **Checkpoint** - Save state, allow resume later

### 4. Provide Progress Visibility

**Show user:**
- Current step (3 of 7)
- Step name ("Generating interview questions...")
- Estimated time ("~2 minutes remaining")
- Completed steps with checkmarks
- Any warnings or issues

**Example output:**
```
Workflow: Recruitment Pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 1. Job description generated
✅ 2. Screening criteria created
⏳ 3. Developing interview questions... (30s)
⏸️  4. Offer letter (pending)
⏸️  5. Onboarding plan (pending)
⏸️  6. IT provisioning (pending)
⏸️  7. Learning path (pending)
```

### 5. Allow Customization

**User should be able to:**
- Skip optional steps
- Provide custom inputs for any step
- Pause and resume workflow
- Export intermediate outputs
- Re-run individual steps

**Example:**
```bash
# Full workflow
/workflow recruitment-pipeline "Senior Engineer"

# Skip steps 2-3, only generate JD and offer template
/workflow recruitment-pipeline "Senior Engineer" --steps 1,4

# Provide custom context for step 5
/workflow recruitment-pipeline "Senior Engineer" --step-5-context "Remote, starts in 2 months"
```

## Context Management Strategies

### When to Pass Full Output
- Next agent directly processes previous output
- Refinement/review workflows
- Example: Marketing blog → Presales pitch deck (reuse content)

### When to Pass Summary
- Context for decision-making, not direct processing
- Parallel agent coordination
- Example: Recruitment JD → HR onboarding (just needs role summary)

### When to Pass Parameters Only
- Agents are loosely related
- Just need to maintain topic consistency
- Example: Marketing campaign → Sustainability messaging (topic only)

## Workflow Metadata

**Track for every workflow execution:**
```json
{
  "workflowName": "content-campaign",
  "executionId": "wf-2026-02-08-abc123",
  "startTime": "2026-02-08T10:00:00Z",
  "endTime": "2026-02-08T10:12:34Z",
  "duration": "12m 34s",
  "status": "completed",
  "stepsExecuted": 7,
  "stepsFailed": 0,
  "stepsSkipped": 0,
  "totalCost": "$2.45",
  "outputs": {
    "blog": "agents/marketing-agent/output/marketing-blog-xyz.json",
    "social": "agents/marketing-agent/output/marketing-social-xyz.json",
    "linkedin": "agents/linkedin-content-generator/output/linkedin-xyz.json"
  }
}
```

## Error Handling Patterns

### Validation Error
```
❌ Step 3 failed: Invalid input format

Options:
1. Retry with corrected input
2. Skip this step
3. Cancel workflow
4. Edit workflow and resume
```

### Timeout Error
```
⏱️  Step 4 exceeded timeout (5 min)

This may be due to:
- Complex query requiring more time
- API rate limiting
- Network issues

Options:
1. Retry with extended timeout (+5 min)
2. Simplify query and retry
3. Skip this step
4. Cancel workflow
```

### Dependency Error
```
⚠️  Step 5 requires output from Step 3, which failed

Options:
1. Re-run Step 3 first
2. Provide manual input for Step 5
3. Skip Step 5
4. Cancel workflow
```

## Teaching Moment for Users

**Why workflow orchestration matters:**

Complex processes in enterprises involve multiple teams, systems, and steps. Without orchestration:
- Steps are manual and error-prone
- Knowledge is siloed (only one person knows the process)
- Inconsistent execution (everyone does it differently)
- No visibility (where are we in the process?)

Workflow orchestration provides:
- **Automation** - Reduce manual work
- **Consistency** - Same process every time
- **Visibility** - Track progress in real-time
- **Reusability** - Template once, use many times

**Architectural pattern: Saga Pattern**

The workflow orchestration here implements the **Saga pattern** from distributed systems:
- Break complex transaction into smaller steps
- Each step is independently executed
- If step fails, compensating actions can rollback
- Eventual consistency (not immediate)

This is how microservices handle complex multi-service operations.

**Agent composition vs monolithic agent:**

You could build one "super agent" that does everything, but:
- Harder to maintain (one giant prompt)
- Less reusable (can't use parts independently)
- Harder to test (must test entire system)
- Less flexible (can't mix and match)

Breaking into specialized agents + orchestration:
- ✅ Each agent is focused and maintainable
- ✅ Agents are reusable in different workflows
- ✅ Can test agents independently
- ✅ Can compose agents in novel ways

This is the **Unix philosophy**: Do one thing well, compose together.
