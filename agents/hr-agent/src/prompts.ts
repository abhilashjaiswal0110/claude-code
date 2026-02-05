/**
 * Stage prompts for HR Agent
 */

import {
  ATOS_COMPANY_CONTEXT,
  HR_COMPLIANCE_RULES,
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER,
} from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { HR_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { HRMode } from './types.js';

const personaContext = buildPersonaContext(HR_PERSONA);

const MODE_INSTRUCTIONS: Record<HRMode, string> = {
  policy: `Answer the employee's policy question with:
- Direct, clear answer based on available policy documents
- Specific policy references (document name, section)
- Step-by-step guidance if applicable
- Escalation path if the query requires HR representative involvement
- Disclaimer that this is guidance, not a binding interpretation`,

  benefits: `Explain the benefit in detail:
- Eligibility criteria
- Enrollment process and deadlines
- Coverage details and package options
- How to claim or activate
- Contact information for benefits administration
- Comparison with alternatives if relevant`,

  engagement: `Analyze the engagement survey data/topic:
- Identify key themes and sentiment patterns
- Highlight areas of strength and concern
- Provide statistical insights where possible
- Generate actionable recommendations by priority
- Suggest follow-up actions and timeline
- Include benchmarking context if available`,

  onboarding: `Create a personalized onboarding guide:
- Pre-joining checklist
- Week 1 schedule and activities (orientation, IT setup, introductions)
- Week 2 plan (role-specific training, shadowing)
- First month milestones and goals
- Key contacts and resources
- 30/60/90-day expectations
- Cultural integration tips`,

  'exit-interview': `Analyze exit interview data/feedback:
- Identify recurring themes and patterns
- Categorize reasons for departure (compensation, growth, culture, management, etc.)
- Highlight systemic issues vs. individual cases
- Provide retention recommendations with priority ranking
- Suggest process improvements
- Compare against industry benchmarks if available`,
};

export function buildStages(mode: HRMode): StageConfig[] {
  return [
    {
      name: 'Classification',
      description: 'Classify the query type and determine routing',
      systemPromptAppend: `You are an HR query classifier. ${personaContext}`,
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}

Classify this HR query and determine the best approach:

QUERY: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Provide:
1. Query category (policy, benefits, engagement, onboarding, exit-interview)
2. Sub-category (e.g., leave, insurance, work-from-home)
3. Sensitivity level (standard, sensitive, confidential)
4. Required data sources (which policy documents, databases, or systems to reference)
5. Escalation needed? (can be answered with available information, or needs HR representative)

Be concise and structured.`,
    },
    {
      name: 'Policy Search',
      description: 'Search policy documents and knowledge base',
      systemPromptAppend: `You are an HR knowledge base specialist. ${DATA_HANDLING_RULES}`,
      allowedTools: ['Read', 'Grep', 'Glob'],
      maxTurns: 8,
      maxBudgetUsd: 1.0,
      buildPrompt: (ctx) => `
Based on this classification:
${ctx.previousResults['Classification']}

Search for relevant policy information for:
QUERY: ${ctx.topic}
MODE: ${mode}

Search the data/ directory for relevant policy documents, FAQs, and templates.
Read the relevant files and extract the specific information needed to answer the query.

Compile all relevant policy excerpts, FAQ answers, and reference material.
Note the source document for each piece of information.`,
    },
    {
      name: 'Response Generation',
      description: `Generate ${mode} response`,
      systemPromptAppend: `${personaContext}\n\n${HR_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${personaContext}

CLASSIFICATION:
${ctx.previousResults['Classification']}

POLICY INFORMATION:
${ctx.previousResults['Policy Search']}

QUERY: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Generate a comprehensive, helpful response.
Reference specific policies where applicable.
Use clear, empathetic language.`,
    },
    {
      name: 'Compliance Check',
      description: 'Verify compliance and add disclaimers',
      systemPromptAppend: `You are an HR compliance reviewer. ${HR_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Review this HR response for compliance:

RESPONSE:
${ctx.previousResults['Response Generation']}

MODE: ${mode}

Check for:
1. Accuracy against referenced policies
2. Appropriate disclaimers included
3. No PII exposure or confidentiality violations
4. Inclusive and non-discriminatory language
5. Proper escalation recommendations where needed
6. Legal sensitivity (no definitive legal interpretations)

Provide the final response with any necessary corrections and this disclaimer:

${COMPLIANCE_DISCLAIMER}

If the response is compliant, return it with the disclaimer appended.
If corrections are needed, make them and explain what was changed.`,
    },
  ];
}
