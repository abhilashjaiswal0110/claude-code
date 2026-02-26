/**
 * Research Agent Prompt Templates
 *
 * Structured prompts for different research stages and modes.
 */

import type { StageConfig, StageContext } from '@enterprise-agents/core';
import type { ResearchMode } from './types.js';
import { buildResearchPersona, getResearchModePrompt, CITATION_FORMAT } from './persona.js';

/**
 * Research mode configurations
 */
export const RESEARCH_MODES: Record<string, ResearchMode> = {
  comprehensive: {
    name: 'Comprehensive Research',
    description: 'Full multi-source research with synthesis and analysis',
    researchType: 'comprehensive',
    outputFormat: 'detailed',
    systemPromptAppend: getResearchModePrompt('comprehensive'),
    maxTurns: 25,
    maxBudgetUsd: 3.0,
    allowedTools: ['WebSearch', 'Read', 'Glob', 'Grep'],
  },

  'quick-facts': {
    name: 'Quick Facts',
    description: 'Rapid factual lookup with minimal elaboration',
    researchType: 'quick-facts',
    outputFormat: 'bullet-points',
    systemPromptAppend: getResearchModePrompt('quick-facts'),
    maxTurns: 10,
    maxBudgetUsd: 1.0,
    allowedTools: ['WebSearch'],
  },

  comparison: {
    name: 'Comparison Analysis',
    description: 'Structured comparison of options or topics',
    researchType: 'comparison',
    outputFormat: 'structured',
    systemPromptAppend: getResearchModePrompt('comparison'),
    maxTurns: 20,
    maxBudgetUsd: 2.5,
    allowedTools: ['WebSearch', 'Read'],
  },

  'trend-analysis': {
    name: 'Trend Analysis',
    description: 'Analysis of patterns, trends, and future projections',
    researchType: 'trend-analysis',
    outputFormat: 'structured',
    systemPromptAppend: getResearchModePrompt('trend-analysis'),
    maxTurns: 20,
    maxBudgetUsd: 2.5,
    allowedTools: ['WebSearch', 'Read'],
  },

  technical: {
    name: 'Technical Deep-Dive',
    description: 'In-depth technical research and analysis',
    researchType: 'technical',
    outputFormat: 'detailed',
    systemPromptAppend: getResearchModePrompt('technical'),
    maxTurns: 25,
    maxBudgetUsd: 3.0,
    allowedTools: ['WebSearch', 'Read', 'Glob', 'Grep'],
  },

  market: {
    name: 'Market Research',
    description: 'Market dynamics and competitive landscape analysis',
    researchType: 'market',
    outputFormat: 'structured',
    systemPromptAppend: getResearchModePrompt('market'),
    maxTurns: 20,
    maxBudgetUsd: 2.5,
    allowedTools: ['WebSearch', 'Read'],
  },

  literature: {
    name: 'Literature Review',
    description: 'Academic and industry literature synthesis',
    researchType: 'literature',
    outputFormat: 'detailed',
    systemPromptAppend: getResearchModePrompt('literature'),
    maxTurns: 25,
    maxBudgetUsd: 3.0,
    allowedTools: ['WebSearch', 'Read'],
  },
};

/**
 * Stage configurations for multi-stage research pipeline
 */
export function buildResearchStages(mode: string): StageConfig[] {
  const modeConfig = RESEARCH_MODES[mode] || RESEARCH_MODES['comprehensive'];

  return [
    {
      name: 'source-discovery',
      description: 'Discover and evaluate potential sources',
      systemPromptAppend: `${buildResearchPersona()}

STAGE: Source Discovery
Your task is to identify and evaluate potential sources for the research query.
Search for diverse, authoritative sources including:
- Academic papers and journals
- Industry reports and white papers
- Expert opinions and analysis
- Official documentation and specifications
- News and recent developments

${modeConfig.systemPromptAppend}`,
      allowedTools: ['WebSearch'],
      maxTurns: 10,
      maxBudgetUsd: 1.0,
      buildPrompt: (ctx: StageContext) => `
Discover and evaluate sources for researching:
"${ctx.topic}"

${ctx.additionalContext ? `Additional context: ${ctx.additionalContext}` : ''}

Search for:
1. Primary authoritative sources
2. Recent developments (2024-2026)
3. Expert perspectives and analysis
4. Relevant data and statistics

For each source found, note:
- Title and URL
- Source type (academic, industry, news, etc.)
- Relevance to the query
- Credibility assessment

Return a structured list of sources to be used in the next research stage.`,
    },

    {
      name: 'deep-research',
      description: 'Conduct in-depth research using discovered sources',
      systemPromptAppend: `${buildResearchPersona()}

STAGE: Deep Research
Using the sources identified, conduct thorough research to answer the query.
Extract key information, verify facts across sources, and note any conflicts.

${CITATION_FORMAT}

${modeConfig.systemPromptAppend}`,
      allowedTools: modeConfig.allowedTools,
      maxTurns: 15,
      maxBudgetUsd: 2.0,
      buildPrompt: (ctx: StageContext) => `
Conduct deep research on:
"${ctx.topic}"

Sources identified in previous stage:
${ctx.previousResults['source-discovery'] || 'No prior sources - perform fresh search'}

Research tasks:
1. Extract key facts and data from sources
2. Verify information across multiple sources
3. Note any conflicting information
4. Gather statistics and metrics
5. Identify expert opinions and consensus

${ctx.additionalContext ? `Focus areas: ${ctx.additionalContext}` : ''}

Compile comprehensive research notes with full citations.`,
    },

    {
      name: 'synthesis',
      description: 'Synthesize findings into final research report',
      systemPromptAppend: `${buildResearchPersona()}

STAGE: Synthesis and Report Generation
Create a polished research report that synthesizes all findings.
Structure the output according to the specified format.

${CITATION_FORMAT}

${modeConfig.systemPromptAppend}`,
      allowedTools: [],
      maxTurns: 5,
      maxBudgetUsd: 0.5,
      buildPrompt: (ctx: StageContext) => `
Synthesize the research on "${ctx.topic}" into a final report.

Research notes from deep research:
${ctx.previousResults['deep-research'] || 'Error: No research notes available'}

Create a comprehensive research report with:

1. EXECUTIVE SUMMARY (2-3 sentences capturing key insights)

2. KEY FINDINGS (numbered list)
   - Each finding must have citation references
   - Include confidence level (high/medium/low)

3. DETAILED ANALYSIS
   - Organize by themes or categories
   - Include relevant data and statistics
   - Provide context and implications

4. LIMITATIONS AND CAVEATS
   - Note any gaps in available information
   - Acknowledge uncertainty where applicable

5. SOURCES
   - Full citation for each source used
   - Format: [n] [Title](URL) - Author/Org, Date Accessed

6. SUGGESTIONS FOR FURTHER RESEARCH (optional)
   - Areas that need more investigation
   - Related questions that emerged

Format for professional presentation with clear headings and structure.`,
    },
  ];
}

/**
 * Build prompt for single-stage quick research
 */
export function buildQuickResearchPrompt(query: string, context?: string): string {
  return `${buildResearchPersona()}

Research Query: ${query}
${context ? `Context: ${context}` : ''}

Provide a concise, factual response with:
1. Direct answer to the query
2. Key supporting facts (with citations)
3. Brief list of sources

${CITATION_FORMAT}

Keep the response focused and efficient while maintaining citation standards.`;
}

/**
 * Build prompt for follow-up questions in multi-turn conversation
 */
export function buildFollowUpPrompt(
  followUpQuery: string,
  previousContext: string
): string {
  return `${buildResearchPersona()}

PREVIOUS RESEARCH CONTEXT:
${previousContext}

FOLLOW-UP QUESTION:
${followUpQuery}

Building on the previous research, answer this follow-up question.
- Reference relevant information from previous findings
- Add new research if needed
- Maintain citation standards

${CITATION_FORMAT}`;
}

/**
 * Build system prompt for research agent
 */
export function buildSystemPrompt(mode: string): string {
  const modeConfig = RESEARCH_MODES[mode] || RESEARCH_MODES['comprehensive'];

  return `${buildResearchPersona()}

Research Mode: ${modeConfig.name}
${modeConfig.description}

${modeConfig.systemPromptAppend}

${CITATION_FORMAT}`;
}
