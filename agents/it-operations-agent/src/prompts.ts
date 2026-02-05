/**
 * Stage prompts for IT Operations Agent
 */

import { ATOS_COMPANY_CONTEXT, SECURITY_RULES, COMPLIANCE_DISCLAIMER } from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { ITOPS_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { ITOpsMode } from './types.js';

const personaContext = buildPersonaContext(ITOPS_PERSONA);

const MODE_INSTRUCTIONS: Record<ITOpsMode, string> = {
  incident: `Perform incident triage including:
- Severity classification (P1-P4) with justification
- Category and subcategory assignment
- Impact assessment (users affected, business impact)
- Assigned team recommendation
- Immediate remediation steps (ordered by priority)
- Escalation path if not resolved within SLA
- Communication template for stakeholders`,

  'kb-search': `Search knowledge base and provide:
- Relevant KB articles and runbooks (summarized)
- Step-by-step resolution guidance
- Similar past incidents and their resolutions
- Known workarounds or temporary fixes
- Permanent fix recommendations if available
- Links to relevant documentation`,

  'root-cause': `Perform root cause analysis including:
- Incident timeline reconstruction
- 5 Whys analysis
- Fishbone (Ishikawa) diagram elements
- Root cause identification with evidence
- Contributing factors assessment
- Prevention recommendations (short-term and long-term)
- Process improvement suggestions
- Post-incident review template`,

  'status-report': `Generate an operations status report including:
- Executive summary (2-3 sentences)
- Incident metrics (total, by severity, MTTR, SLA compliance)
- Key highlights and achievements
- Open issues and risks
- Upcoming maintenance windows
- Action items with owners and deadlines
- Trend analysis (week-over-week or month-over-month)`,

  runbook: `Generate a standardized runbook including:
- Title, severity level, and applicable service
- Symptoms and detection criteria
- Prerequisites and access requirements
- Step-by-step diagnostic procedure
- Resolution steps (ordered by likelihood)
- Verification steps (confirm resolution)
- Rollback procedure
- Escalation criteria and contacts
- Automation opportunities`,
};

export function buildStages(mode: ITOpsMode): StageConfig[] {
  return [
    {
      name: 'Intake & Classification',
      description: 'Classify the request and determine approach',
      systemPromptAppend: `You are an IT operations classifier following ITIL. ${personaContext}`,
      allowedTools: ['Read', 'Grep', 'Glob'],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}
${SECURITY_RULES}

Classify this IT operations request:

REQUEST: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Search data/ for relevant categories, runbooks, and knowledge base articles.

Provide:
1. Request type classification
2. Severity/priority assessment
3. Affected service and component
4. Required knowledge sources
5. Initial assessment and approach`,
    },
    {
      name: 'Knowledge Retrieval',
      description: 'Search knowledge base and external resources',
      systemPromptAppend: `You are an IT knowledge base specialist. ${SECURITY_RULES}`,
      allowedTools: ['WebSearch', 'Read', 'Grep', 'Glob'],
      maxTurns: 10,
      maxBudgetUsd: 1.5,
      buildPrompt: (ctx) => `
Based on this classification:
${ctx.previousResults['Intake & Classification']}

Search for relevant knowledge:
REQUEST: ${ctx.topic}
MODE: ${mode}

1. Search data/ directory for matching runbooks and KB articles
2. Search web for known issues, patches, and best practices
3. Find relevant documentation and vendor advisories
4. Identify similar incidents and their resolutions

Compile all relevant information for analysis.`,
    },
    {
      name: 'Analysis & Recommendation',
      description: `Generate ${mode} analysis`,
      systemPromptAppend: personaContext,
      allowedTools: [],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${personaContext}

CLASSIFICATION:
${ctx.previousResults['Intake & Classification']}

KNOWLEDGE BASE:
${ctx.previousResults['Knowledge Retrieval']}

REQUEST: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Generate a comprehensive, actionable response.
Use ITIL terminology and structured formats.`,
    },
    {
      name: 'Report Formatting',
      description: 'Format final report with proper structure',
      systemPromptAppend: 'You are an IT operations report writer.',
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Format this IT operations output into a professional report:

CONTENT:
${ctx.previousResults['Analysis & Recommendation']}

MODE: ${mode}

Format with:
1. Clear section headers
2. Priority/severity indicators
3. Actionable steps with numbering
4. Escalation paths clearly marked
5. SLA references where applicable

${COMPLIANCE_DISCLAIMER}

Ensure the report is ready for use by the operations team.`,
    },
  ];
}
