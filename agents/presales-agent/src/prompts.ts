/**
 * Stage prompts for Presales/Sales Agent
 */

import {
  ATOS_COMPANY_CONTEXT,
  ATOS_DIFFERENTIATORS,
  COMPLIANCE_DISCLAIMER,
  SECURITY_RULES,
} from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { PRESALES_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { PresalesMode } from './types.js';

const personaContext = buildPersonaContext(PRESALES_PERSONA);

const MODE_INSTRUCTIONS: Record<PresalesMode, string> = {
  proposal: `Generate a comprehensive proposal including:
- Executive Summary (1 page, compelling business case)
- Understanding of Client Needs (demonstrate deep understanding)
- Proposed Solution & Approach (architecture, methodology, tools)
- Implementation Roadmap (phases, milestones, deliverables)
- Team Structure & Key Roles
- Risk Management & Mitigation
- Commercial Summary (pricing structure, payment terms placeholder)
- Why Atos (key differentiators for this specific deal)
- Appendix: Relevant case studies and references`,

  competitor: `Generate a detailed competitor analysis including:
- Competitor Overview (company profile, market position)
- Service Comparison Matrix (feature-by-feature)
- Strengths & Weaknesses Assessment
- Pricing Intelligence (if available from public sources)
- Win/Loss Patterns Against This Competitor
- Atos Differentiators & Counterarguments
- Recommended Win Strategy
- Key Talking Points for Sales Team`,

  rfp: `Generate RFP response content including:
- Compliance Matrix (requirement mapping)
- Technical Response (solution architecture, methodology)
- Management Approach (governance, reporting, escalation)
- Team Qualifications & CVs Outline
- Past Performance & References
- Quality Assurance Approach
- Innovation & Value-Add Proposals
- Pricing Structure Framework`,

  'pitch-deck': `Generate a pitch deck outline (12-15 slides) including:
For each slide: title, 3-4 key bullet points, talking points, visual suggestion
Slides should cover:
1. Title & Value Proposition
2. Client Challenge & Pain Points
3. Market Context & Trends
4. Proposed Solution Overview
5. Solution Architecture (visual)
6. Implementation Approach
7. Timeline & Milestones
8. Team & Expertise
9. Case Study 1
10. Case Study 2
11. Why Atos
12. Commercial Overview
13. Next Steps & CTA`,

  'win-loss': `Generate a win/loss analysis including:
- Deal Summary (size, duration, competitors)
- Outcome Analysis (why won/lost)
- Key Decision Factors Ranking
- Competitive Dynamics
- Pricing Analysis
- Relationship & Trust Factors
- Lessons Learned
- Actionable Recommendations for Future Deals
- Process Improvement Suggestions`,
};

export function buildStages(mode: PresalesMode): StageConfig[] {
  return [
    {
      name: 'Opportunity Analysis',
      description: 'Analyze the opportunity and client context',
      systemPromptAppend: `You are a presales opportunity analyst. ${personaContext}`,
      allowedTools: ['Read', 'Grep', 'Glob'],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}

Analyze this presales opportunity:

TOPIC/OPPORTUNITY: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Search the data/ directory for relevant Atos capabilities, case studies, and competitive intelligence.

Provide:
1. Opportunity assessment (size, complexity, strategic value)
2. Client industry and likely requirements
3. Relevant Atos capabilities and experience
4. Potential challenges and risks
5. Initial win strategy hypothesis`,
    },
    {
      name: 'Deep Research',
      description: 'Research client, competitors, and market',
      systemPromptAppend: `You are a business intelligence researcher. ${SECURITY_RULES}`,
      allowedTools: ['WebSearch', 'Read', 'Grep', 'Glob'],
      maxTurns: 20,
      maxBudgetUsd: 3.0,
      buildPrompt: (ctx) => `
Based on this opportunity analysis:
${ctx.previousResults['Opportunity Analysis']}

Conduct deep research for:
TOPIC: ${ctx.topic}
MODE: ${mode}

Research:
1. Client company (recent news, strategy, technology stack, challenges)
2. Competitor landscape (who else might bid, their strengths)
3. Industry trends and benchmarks
4. Relevant technology trends and market data
5. Pricing benchmarks (from public sources only)
6. Regulatory and compliance considerations

Compile comprehensive intelligence for ${mode} creation.`,
    },
    {
      name: 'Content Generation',
      description: `Generate ${mode} content`,
      systemPromptAppend: `${personaContext}\n\n${ATOS_DIFFERENTIATORS}`,
      allowedTools: [],
      maxTurns: 10,
      buildPrompt: (ctx) => `
${personaContext}

OPPORTUNITY ANALYSIS:
${ctx.previousResults['Opportunity Analysis']}

RESEARCH:
${ctx.previousResults['Deep Research']}

TOPIC: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Create publication-ready content.
Lead with client value and differentiate Atos clearly.
Include specific proof points and evidence.`,
    },
    {
      name: 'Executive Summary',
      description: 'Create executive summary and key messages',
      systemPromptAppend: 'You are a senior executive communication specialist.',
      allowedTools: [],
      maxTurns: 5,
      buildPrompt: (ctx) => `
Create an executive summary of this ${mode}:

CONTENT:
${ctx.previousResults['Content Generation']}

Provide:
1. One-page executive summary (for CxO audience)
2. Three key messages (elevator pitch points)
3. Top 3 differentiators for this specific opportunity
4. Recommended next steps

Be concise, strategic, and compelling.`,
    },
    {
      name: 'Competitive Positioning',
      description: 'Final competitive positioning and win themes',
      systemPromptAppend: 'You are a competitive strategy specialist.',
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Based on all previous analysis:

OPPORTUNITY ANALYSIS:
${ctx.previousResults['Opportunity Analysis']}

RESEARCH:
${ctx.previousResults['Deep Research']}

EXECUTIVE SUMMARY:
${ctx.previousResults['Executive Summary']}

Provide final competitive positioning:
1. Win themes (3-5 key themes to emphasize)
2. Competitor counterarguments (objection handling)
3. Pricing strategy guidance
4. Risk mitigation talking points
5. Deal-closing recommendations

${COMPLIANCE_DISCLAIMER}`,
    },
  ];
}
