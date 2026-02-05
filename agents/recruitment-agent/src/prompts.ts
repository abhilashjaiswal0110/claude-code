/**
 * Stage prompts for Recruitment Agent
 */

import {
  ATOS_COMPANY_CONTEXT,
  RECRUITMENT_COMPLIANCE_RULES,
  DATA_HANDLING_RULES,
  COMPLIANCE_DISCLAIMER,
} from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { RECRUITMENT_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { RecruitmentMode } from './types.js';

const personaContext = buildPersonaContext(RECRUITMENT_PERSONA);

const MODE_INSTRUCTIONS: Record<RecruitmentMode, string> = {
  jd: `Generate a comprehensive job description including:
- Job title (clear, industry-standard)
- Role summary (2-3 sentences)
- Key responsibilities (8-12 bullet points)
- Required qualifications (must-have, clearly defined)
- Preferred qualifications (nice-to-have, separate from required)
- Skills and competencies
- What we offer (benefits, culture, growth)
- Equal opportunity employer statement
- Application instructions

IMPORTANT: Use inclusive, bias-free language. Avoid gendered terms, age-indicative language, or culturally biased requirements.`,

  screening: `Generate a resume screening framework including:
- Screening criteria matrix (must-have vs. nice-to-have)
- Scoring rubric (1-5 scale per criterion)
- Red flags to watch for (gaps, inconsistencies)
- Green flags to highlight (relevant experience, certifications)
- Bias mitigation checklist (ensure fair evaluation)
- Recommendation categories: Proceed / Hold / Reject with criteria
- Sample screening summary template

IMPORTANT: Focus only on job-relevant qualifications. Do not consider or reference age, gender, ethnicity, or other protected characteristics.`,

  interview: `Generate structured interview questions including:
- 5 behavioral questions (STAR method)
- 5 technical/role-specific questions
- 3 situational/problem-solving questions
- 2 culture and values alignment questions
- For each question: evaluation criteria and follow-up probes
- Interview scorecard template
- Red/green flag indicators

Questions should be standardized and applied consistently to all candidates.`,

  comparison: `Generate a candidate comparison framework including:
- Evaluation criteria (weighted by importance)
- Scoring matrix template (1-5 scale)
- Strengths and concerns for each candidate profile
- Side-by-side comparison format
- Overall recommendation with rationale
- Risk assessment per candidate
- Hiring committee discussion guide

IMPORTANT: Compare based on qualifications and demonstrated competencies only.`,

  offer: `Generate an offer letter template including:
- Position title and reporting structure
- Start date and location
- Compensation package (base, variable, equity placeholder)
- Benefits summary
- Working arrangements
- Probation period terms
- Key terms and conditions
- Acceptance deadline and process
- Welcome message and next steps

Reference market data for compensation benchmarking.`,
};

export function buildStages(mode: RecruitmentMode): StageConfig[] {
  return [
    {
      name: 'Role Understanding',
      description: 'Analyze the role requirements and context',
      systemPromptAppend: `You are a recruitment specialist. ${personaContext}\n\n${RECRUITMENT_COMPLIANCE_RULES}`,
      allowedTools: ['Read', 'Glob'],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}
${RECRUITMENT_COMPLIANCE_RULES}

Analyze this recruitment request:

TOPIC: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Search data/ for relevant JD templates, interview frameworks, and compliance guidelines.

Provide:
1. Role analysis (level, function, key competencies)
2. Market positioning (how competitive is this role)
3. Key requirements categorization (must-have vs. nice-to-have)
4. Compliance considerations for this role/region
5. Available templates and frameworks to use`,
    },
    {
      name: 'Market Research',
      description: 'Research salary trends and market conditions',
      systemPromptAppend: `You are a talent market analyst. ${DATA_HANDLING_RULES}`,
      allowedTools: ['WebSearch'],
      maxTurns: 10,
      maxBudgetUsd: 1.5,
      buildPrompt: (ctx) => `
Based on this role analysis:
${ctx.previousResults['Role Understanding']}

Research the talent market:
TOPIC: ${ctx.topic}
MODE: ${mode}

1. Salary benchmarks and compensation trends
2. Skills in demand and talent availability
3. Competitor hiring activity for similar roles
4. Industry-standard qualifications and certifications
5. Inclusive language best practices for job postings
6. Regional compliance requirements

Compile market intelligence for recruitment content creation.`,
    },
    {
      name: 'Content Generation',
      description: `Generate ${mode} content`,
      systemPromptAppend: `${personaContext}\n\n${RECRUITMENT_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 8,
      buildPrompt: (ctx) => `
${personaContext}

ROLE ANALYSIS:
${ctx.previousResults['Role Understanding']}

MARKET RESEARCH:
${ctx.previousResults['Market Research']}

TOPIC: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Generate comprehensive, publication-ready content.
Ensure all language is inclusive and bias-free.`,
    },
    {
      name: 'Bias & Compliance Check',
      description: 'Review for bias, compliance, and inclusive language',
      systemPromptAppend: `You are a recruitment compliance and DEI specialist. ${RECRUITMENT_COMPLIANCE_RULES}`,
      allowedTools: [],
      maxTurns: 5,
      buildPrompt: (ctx) => `
Review this recruitment content for bias and compliance:

CONTENT:
${ctx.previousResults['Content Generation']}

MODE: ${mode}

CHECK FOR:
1. Gendered language (he/she → they, chairman → chairperson)
2. Age-indicative terms (young, energetic, digital native, seasoned)
3. Culturally biased requirements (native speaker → fluent speaker)
4. Unnecessary requirements that may exclude qualified candidates
5. Equal opportunity statement presence and completeness
6. GDPR and data protection compliance
7. Salary transparency requirements (where applicable)
8. Accessibility considerations

For each issue found:
- Identify the problematic text
- Explain why it's problematic
- Provide the corrected version

Return the final compliant version with all corrections applied.

${COMPLIANCE_DISCLAIMER}`,
    },
  ];
}
