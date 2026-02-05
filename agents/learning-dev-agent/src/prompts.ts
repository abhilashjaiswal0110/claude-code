/**
 * Stage prompts for Learning & Development Agent
 */

import { ATOS_COMPANY_CONTEXT, COMPLIANCE_DISCLAIMER } from '@enterprise-agents/prompts';
import { buildPersonaContext } from '@enterprise-agents/core';
import { LD_PERSONA } from './persona.js';
import type { StageConfig } from '@enterprise-agents/core';
import type { LDMode } from './types.js';

const personaContext = buildPersonaContext(LD_PERSONA);

const MODE_INSTRUCTIONS: Record<LDMode, string> = {
  'skill-gap': `Perform a skill gap analysis including:
- Current skills inventory (based on provided role/profile)
- Required skills for target role/objective
- Gap identification with priority ranking (high/medium/low)
- Gap severity assessment (critical, important, nice-to-have)
- Recommended development actions per gap
- Timeline for closing each gap
- Quick wins vs. long-term development items`,

  'learning-path': `Generate a personalized learning path including:
- Path title and target outcome
- Prerequisites
- Phase 1: Foundation (core concepts and basics)
- Phase 2: Applied (hands-on skills and projects)
- Phase 3: Advanced (specialization and mastery)
- Phase 4: Leadership (teaching others and thought leadership)
- Recommended certifications at each phase
- Milestones and checkpoints
- Estimated total duration`,

  training: `Provide training recommendations including:
- 5-8 specific course/resource recommendations
- For each: title, provider, type, level, duration, cost estimate
- Mix of formats: online courses, books, labs, workshops
- Platform recommendations (Coursera, Udemy, LinkedIn Learning, etc.)
- Free vs. paid options
- Hands-on practice suggestions
- Community and networking recommendations`,

  assessment: `Generate assessment questions including:
- 10-15 questions across difficulty levels
- Mix of types: multiple-choice, scenario-based, practical, open-ended
- Mapped to specific competencies
- For multiple-choice: include correct answer and explanation
- For scenarios: include evaluation criteria
- For practical: include success criteria
- Difficulty distribution: 30% easy, 50% medium, 20% hard`,

  'team-matrix': `Generate a team skill matrix analysis including:
- Team skill inventory template
- Skill proficiency scale (1-5 with descriptions)
- Current team coverage assessment
- Critical gaps and single points of failure
- Cross-training recommendations
- Collective upskilling plan with priorities
- Budget allocation suggestions
- Success metrics and tracking approach`,
};

export function buildStages(mode: LDMode): StageConfig[] {
  return [
    {
      name: 'Profile Analysis',
      description: 'Analyze the role/profile and skill requirements',
      systemPromptAppend: `You are a talent assessment specialist. ${personaContext}`,
      allowedTools: ['Read', 'Glob'],
      maxTurns: 5,
      buildPrompt: (ctx) => `
${ATOS_COMPANY_CONTEXT}

Analyze this learning & development request:

TOPIC: ${ctx.topic}
MODE: ${mode}
${ctx.additionalContext ? `CONTEXT: ${ctx.additionalContext}` : ''}

Search data/ for relevant skill frameworks and certification guides.

Provide:
1. Role/profile analysis
2. Current skill level assessment (based on available information)
3. Industry standard expectations for this role/domain
4. Key competency areas to evaluate
5. Available internal resources and frameworks`,
    },
    {
      name: 'Market Research',
      description: 'Research skills demand and learning resources',
      systemPromptAppend: 'You are a skills market research analyst.',
      allowedTools: ['WebSearch'],
      maxTurns: 12,
      maxBudgetUsd: 1.5,
      buildPrompt: (ctx) => `
Based on this profile analysis:
${ctx.previousResults['Profile Analysis']}

Research the current market for:
TOPIC: ${ctx.topic}
MODE: ${mode}

1. In-demand skills and trends in this domain
2. Top certifications and their market value
3. Best learning platforms and courses for this domain
4. Salary impact of skill development
5. Industry benchmarks for skill proficiency
6. Emerging skills to watch

Compile comprehensive market intelligence for learning path design.`,
    },
    {
      name: 'Gap Analysis & Planning',
      description: `Generate ${mode} content`,
      systemPromptAppend: personaContext,
      allowedTools: [],
      maxTurns: 8,
      buildPrompt: (ctx) => `
${personaContext}

PROFILE ANALYSIS:
${ctx.previousResults['Profile Analysis']}

MARKET RESEARCH:
${ctx.previousResults['Market Research']}

TOPIC: ${ctx.topic}
MODE: ${mode}

${MODE_INSTRUCTIONS[mode]}

Create a comprehensive, actionable output.
Be specific with recommendations (actual course names, certifications, providers).
Include both free and paid options where applicable.`,
    },
    {
      name: 'Quality Review',
      description: 'Review and optimize the learning plan',
      systemPromptAppend: 'You are a learning effectiveness evaluator.',
      allowedTools: [],
      maxTurns: 3,
      buildPrompt: (ctx) => `
Review this ${mode} output for quality and completeness:

CONTENT:
${ctx.previousResults['Gap Analysis & Planning']}

Evaluate:
1. Actionability - are recommendations specific enough?
2. Feasibility - are timelines realistic?
3. Alignment - does it match the original request?
4. Balance - mix of theory and practice?
5. Measurability - are there clear success criteria?

Provide the final optimized version with any improvements.

${COMPLIANCE_DISCLAIMER}`,
    },
  ];
}
