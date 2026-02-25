/**
 * Research Agent
 *
 * Enterprise research agent with web search, citations, and multi-turn
 * conversation support. Inspired by Anthropic's claude-cookbooks patterns.
 *
 * Features:
 * - Multi-stage research pipeline
 * - Automatic citation management
 * - Multiple research modes (comprehensive, quick-facts, comparison, etc.)
 * - Session support for follow-up questions
 * - Extended thinking for complex research
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/claude_agent_sdk/research_agent
 */

import 'dotenv/config';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query } from '@anthropic-ai/claude-agent-sdk';
import {
  logger,
  validateEnvironment,
  resetActivityContext,
  printActivity,
  generateActivitySummary,
} from '@enterprise-agents/core';

import type {
  ResearchRequest,
  ResearchResult,
  ResearchSession,
  ResearchAgentConfig,
  Citation,
  Finding,
  ResearchType,
} from './types.js';

import { RESEARCH_PERSONA } from './persona.js';
import {
  RESEARCH_MODES,
  buildQuickResearchPrompt,
  buildFollowUpPrompt,
  buildSystemPrompt,
} from './prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

/**
 * Default agent configuration
 */
const DEFAULT_CONFIG: ResearchAgentConfig = {
  model: 'claude-sonnet-4-6',
  maxTurns: 25,
  maxBudgetUsd: 5.0,
  enableExtendedThinking: false,
  includeThinkingOutput: false,
  defaultOutputFormat: 'detailed',
  defaultMaxSources: 10,
};

/**
 * Active research sessions for multi-turn conversations
 */
const activeSessions: Map<string, ResearchSession> = new Map();

/**
 * Main research function
 *
 * @param request - Research request configuration
 * @param config - Agent configuration
 * @returns Research result with findings and citations
 */
export async function conductResearch(
  request: ResearchRequest,
  config: ResearchAgentConfig = {}
): Promise<ResearchResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();

  logger.header('Enterprise Research Agent');
  logger.info(`Query: ${request.query}`);
  logger.info(`Mode: ${request.researchType}`);

  resetActivityContext();

  const modeConfig = RESEARCH_MODES[request.researchType] || RESEARCH_MODES['comprehensive'];

  // Use multi-stage pipeline for comprehensive research
  if (request.researchType === 'comprehensive' ||
      request.researchType === 'technical' ||
      request.researchType === 'literature') {
    return conductMultiStageResearch(request, mergedConfig, startTime);
  }

  // Use single-stage for quick research
  return conductQuickResearch(request, mergedConfig, startTime);
}

/**
 * Conduct multi-stage research using the pipeline
 */
async function conductMultiStageResearch(
  request: ResearchRequest,
  config: ResearchAgentConfig,
  startTime: number
): Promise<ResearchResult> {
  const modeConfig = RESEARCH_MODES[request.researchType] || RESEARCH_MODES['comprehensive'];

  // Stage 1: Source Discovery
  logger.stageStart(1, 3, 'Source Discovery');

  let sourceDiscoveryResult = '';

  for await (const message of query({
    prompt: `Discover and evaluate sources for researching:
"${request.query}"

${request.context ? `Additional context: ${request.context}` : ''}

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
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: buildSystemPrompt(request.researchType),
      },
      allowedTools: ['WebSearch'],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 10,
      maxBudgetUsd: 1.0,
    },
  })) {
    printActivity(message as never);

    if ('result' in message && message.type === 'result') {
      sourceDiscoveryResult = message.result as string;
    }
  }

  logger.stageComplete('Source Discovery');

  // Stage 2: Deep Research
  logger.stageStart(2, 3, 'Deep Research');

  let deepResearchResult = '';

  for await (const message of query({
    prompt: `Conduct deep research on:
"${request.query}"

Sources identified in previous stage:
${sourceDiscoveryResult}

Research tasks:
1. Extract key facts and data from sources
2. Verify information across multiple sources
3. Note any conflicting information
4. Gather statistics and metrics
5. Identify expert opinions and consensus

${request.context ? `Focus areas: ${request.context}` : ''}

Compile comprehensive research notes with full citations.`,
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: buildSystemPrompt(request.researchType),
      },
      allowedTools: modeConfig.allowedTools,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 15,
      maxBudgetUsd: 2.0,
    },
  })) {
    printActivity(message as never);

    if ('result' in message && message.type === 'result') {
      deepResearchResult = message.result as string;
    }
  }

  logger.stageComplete('Deep Research');

  // Stage 3: Synthesis
  logger.stageStart(3, 3, 'Synthesis');

  let finalContent = '';

  for await (const message of query({
    prompt: `Synthesize the research on "${request.query}" into a final report.

Research notes from deep research:
${deepResearchResult}

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
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: buildSystemPrompt(request.researchType),
      },
      allowedTools: [],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 5,
      maxBudgetUsd: 0.5,
    },
  })) {
    printActivity(message as never);

    if ('result' in message && message.type === 'result') {
      finalContent = message.result as string;
    }
  }

  logger.stageComplete('Synthesis');

  const durationMs = Date.now() - startTime;

  // Parse citations and findings from the result
  const result = parseResearchResult(
    request,
    finalContent,
    durationMs
  );

  // Save output files
  saveResearchOutput(request.query, result, finalContent);

  logger.done(`Research completed in ${Math.round(durationMs / 1000)}s`);

  return result;
}

/**
 * Conduct quick single-stage research
 */
async function conductQuickResearch(
  request: ResearchRequest,
  config: ResearchAgentConfig,
  startTime: number
): Promise<ResearchResult> {
  const modeConfig = RESEARCH_MODES[request.researchType] || RESEARCH_MODES['quick-facts'];

  logger.stageStart(1, 1, 'Quick Research');

  let result = '';

  for await (const message of query({
    prompt: buildQuickResearchPrompt(request.query, request.context),
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: buildSystemPrompt(request.researchType),
      },
      allowedTools: modeConfig.allowedTools,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: modeConfig.maxTurns,
      maxBudgetUsd: modeConfig.maxBudgetUsd,
    },
  })) {
    printActivity(message as never);

    if ('result' in message && message.type === 'result') {
      result = message.result as string;
    }
  }

  logger.stageComplete('Quick Research');

  const durationMs = Date.now() - startTime;
  const researchResult = parseResearchResult(request, result, durationMs);

  // Save output
  saveResearchOutput(request.query, researchResult, result);

  logger.done(`Research completed in ${Math.round(durationMs / 1000)}s`);

  return researchResult;
}

/**
 * Continue research with a follow-up question
 *
 * @param sessionId - Session ID from previous research
 * @param followUpQuery - Follow-up question
 * @returns Research result for the follow-up
 */
export async function continueResearch(
  sessionId: string,
  followUpQuery: string
): Promise<ResearchResult> {
  const session = activeSessions.get(sessionId);

  if (!session || !session.active) {
    throw new Error(`No active session found with ID: ${sessionId}`);
  }

  logger.info(`Continuing research session: ${sessionId}`);
  logger.info(`Follow-up: ${followUpQuery}`);

  const startTime = Date.now();
  resetActivityContext();

  let result = '';

  for await (const message of query({
    prompt: buildFollowUpPrompt(followUpQuery, session.context),
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: buildSystemPrompt('comprehensive'),
      },
      allowedTools: ['WebSearch', 'Read'],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 15,
      maxBudgetUsd: 2.0,
    },
  })) {
    printActivity(message as never);

    if ('result' in message && message.type === 'result') {
      result = message.result as string;
    }
  }

  const durationMs = Date.now() - startTime;

  const researchResult = parseResearchResult(
    {
      query: followUpQuery,
      researchType: 'comprehensive',
    },
    result,
    durationMs
  );

  // Update session
  session.queries.push(followUpQuery);
  session.results.push(researchResult);
  session.context += `\n\n---\n\nFollow-up: ${followUpQuery}\n\n${result}`;

  return researchResult;
}

/**
 * Create a new research session for multi-turn conversations
 */
export function createSession(initialResult: ResearchResult): ResearchSession {
  const sessionId = `research-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const session: ResearchSession = {
    id: sessionId,
    startedAt: new Date().toISOString(),
    queries: [initialResult.query],
    results: [initialResult],
    context: initialResult.analysis,
    active: true,
  };

  activeSessions.set(sessionId, session);

  return session;
}

/**
 * End a research session
 */
export function endSession(sessionId: string): void {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.active = false;
    logger.info(`Session ${sessionId} ended`);
  }
}

/**
 * Parse research result from raw content
 */
function parseResearchResult(
  request: ResearchRequest,
  content: string,
  durationMs: number
): ResearchResult {
  return {
    query: request.query,
    researchType: request.researchType,
    summary: extractSection(content, 'EXECUTIVE SUMMARY', 'KEY FINDINGS') ||
             extractFirstParagraph(content),
    findings: parseFindings(content),
    analysis: extractSection(content, 'DETAILED ANALYSIS', 'LIMITATIONS') ||
              content,
    citations: parseCitations(content),
    methodology: extractSection(content, 'METHODOLOGY', null),
    limitations: extractBulletPoints(content, 'LIMITATIONS'),
    furtherResearch: extractBulletPoints(content, 'FURTHER RESEARCH') ||
                     extractBulletPoints(content, 'SUGGESTIONS'),
    completedAt: new Date().toISOString(),
    durationMs,
  };
}

/**
 * Extract a section between two headers
 */
function extractSection(
  content: string,
  startMarker: string,
  endMarker: string | null
): string | undefined {
  const startIndex = content.toUpperCase().indexOf(startMarker.toUpperCase());
  if (startIndex === -1) return undefined;

  const startPos = content.indexOf('\n', startIndex) + 1;

  if (endMarker) {
    const endIndex = content.toUpperCase().indexOf(endMarker.toUpperCase(), startPos);
    if (endIndex !== -1) {
      return content.slice(startPos, endIndex).trim();
    }
  }

  return content.slice(startPos).trim();
}

/**
 * Extract the first paragraph
 */
function extractFirstParagraph(content: string): string {
  const paragraphs = content.split('\n\n');
  return paragraphs[0]?.trim() || content.slice(0, 500);
}

/**
 * Parse bullet points from a section
 */
function extractBulletPoints(content: string, sectionName: string): string[] | undefined {
  const section = extractSection(content, sectionName, null);
  if (!section) return undefined;

  const bullets = section
    .split('\n')
    .filter(line => line.trim().match(/^[-*\u2022]\s/))
    .map(line => line.replace(/^[-*\u2022]\s+/, '').trim());

  return bullets.length > 0 ? bullets : undefined;
}

/**
 * Parse findings from content
 */
function parseFindings(content: string): Finding[] {
  const findingsSection = extractSection(content, 'KEY FINDINGS', 'DETAILED ANALYSIS') ||
                          extractSection(content, 'FINDINGS', 'ANALYSIS');

  if (!findingsSection) return [];

  const findings: Finding[] = [];
  const lines = findingsSection.split('\n');

  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)/);
    if (match) {
      const statement = match[1].trim();
      const citations = extractCitationRefs(statement);

      findings.push({
        statement: statement.replace(/\[\d+\]/g, '').trim(),
        evidence: [],
        citations,
        confidence: 'medium',
      });
    }
  }

  return findings;
}

/**
 * Extract citation references from text
 */
function extractCitationRefs(text: string): string[] {
  const matches = text.match(/\[(\d+)\]/g);
  return matches ? matches.map(m => m.replace(/[\[\]]/g, '')) : [];
}

/**
 * Parse citations from content
 */
function parseCitations(content: string): Citation[] {
  const citations: Citation[] = [];
  const sourcesSection = extractSection(content, 'SOURCES', null) ||
                         extractSection(content, 'References', null);

  if (!sourcesSection) {
    // Try to find inline citations
    const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let match;
    let index = 1;

    while ((match = urlRegex.exec(content)) !== null) {
      citations.push({
        id: String(index++),
        title: match[1],
        url: match[2],
        accessedDate: new Date().toISOString().split('T')[0],
      });
    }

    return citations;
  }

  // Parse numbered citations
  const lines = sourcesSection.split('\n');
  for (const line of lines) {
    const match = line.match(/\[(\d+)\]\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
    if (match) {
      citations.push({
        id: match[1],
        title: match[2],
        url: match[3],
        accessedDate: new Date().toISOString().split('T')[0],
      });
    }
  }

  return citations;
}

/**
 * Format research output for file saving
 */
function formatResearchOutput(
  topic: string,
  rawContent: string,
  metadata: Record<string, string>
): string {
  const divider = '\u2550'.repeat(60);

  return `${divider}
ENTERPRISE RESEARCH REPORT
${divider}

Query: ${topic}
Generated: ${metadata.generatedAt}
Agent: ${RESEARCH_PERSONA.name}

${divider}

${rawContent}

${divider}
Generated by Enterprise Research Agent
${divider}
`;
}

/**
 * Save research output to files
 */
function saveResearchOutput(
  queryText: string,
  result: ResearchResult,
  rawContent: string
): string {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const slug = queryText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const baseFilename = `${timestamp}_research_${slug}`;

  // Save formatted report
  const reportPath = join(OUTPUT_DIR, `${baseFilename}.txt`);
  writeFileSync(
    reportPath,
    formatResearchOutput(queryText, rawContent, { generatedAt: result.completedAt }),
    'utf-8'
  );

  // Save JSON for programmatic use
  const jsonPath = join(OUTPUT_DIR, `${baseFilename}.json`);
  writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');

  logger.saved(reportPath);

  return reportPath;
}

/**
 * CLI entry point
 */
async function main(): Promise<void> {
  validateEnvironment();

  const args = process.argv.slice(2);

  // Parse mode flag
  let mode: ResearchType = 'comprehensive';
  let queryArgs = args;

  if (args[0]?.startsWith('--mode=')) {
    mode = args[0].replace('--mode=', '') as ResearchType;
    queryArgs = args.slice(1);
  } else if (args[0] === '--mode' && args[1]) {
    mode = args[1] as ResearchType;
    queryArgs = args.slice(2);
  }

  const queryText = queryArgs.join(' ') || 'What are the key trends in enterprise automation for 2026?';

  console.log('\n');
  console.log('  ____                              _     ');
  console.log(' |  _ \\ ___  ___  ___  __ _ _ __ ___| |__  ');
  console.log(' | |_) / _ \\/ __|/ _ \\/ _` | \'__/ __| \'_ \\ ');
  console.log(' |  _ <  __/\\__ \\  __/ (_| | | | (__| | | |');
  console.log(' |_| \\_\\___||___/\\___|\\__,_|_|  \\___|_| |_|');
  console.log('');
  console.log('  Enterprise Research Agent');
  console.log('  Powered by claude-cookbooks patterns');
  console.log('\n');

  try {
    const result = await conductResearch({
      query: queryText,
      researchType: mode,
    });

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('RESEARCH SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log('Query:', result.query);
    console.log('Mode:', result.researchType);
    console.log('Duration:', Math.round(result.durationMs / 1000), 'seconds');
    console.log('Findings:', result.findings.length);
    console.log('Citations:', result.citations.length);

    console.log('\n' + '-'.repeat(60));
    console.log('Executive Summary:');
    console.log(result.summary);
    console.log('-'.repeat(60) + '\n');

    // Show activity summary
    console.log(generateActivitySummary());

    console.log('\n[Done] Research completed successfully!\n');
  } catch (error) {
    logger.error('Research failed', error);
    process.exit(1);
  }
}

// Run if executed directly
main();

// Export for programmatic use
export {
  conductResearch,
  continueResearch,
  createSession,
  endSession,
  RESEARCH_MODES,
  RESEARCH_PERSONA,
};
