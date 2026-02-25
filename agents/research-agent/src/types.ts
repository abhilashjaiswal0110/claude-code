/**
 * Type definitions for Research Agent
 */

/**
 * Research request configuration
 */
export interface ResearchRequest {
  /** The topic or question to research */
  query: string;

  /** Type of research to perform */
  researchType: ResearchType;

  /** Additional context or constraints */
  context?: string;

  /** Required sources or domains to include */
  requiredSources?: string[];

  /** Domains to exclude from research */
  excludedDomains?: string[];

  /** Maximum number of sources to include */
  maxSources?: number;

  /** Minimum citation threshold */
  minCitations?: number;

  /** Output format preference */
  outputFormat?: OutputFormat;
}

/**
 * Types of research the agent can perform
 */
export type ResearchType =
  | 'comprehensive'   // Full multi-source research with synthesis
  | 'quick-facts'     // Quick factual lookup
  | 'comparison'      // Compare multiple options/topics
  | 'trend-analysis'  // Analyze trends and patterns
  | 'technical'       // Technical deep-dive
  | 'market'          // Market research and analysis
  | 'literature';     // Academic/literature review

/**
 * Output format options
 */
export type OutputFormat =
  | 'detailed'        // Full detailed report
  | 'summary'         // Executive summary
  | 'bullet-points'   // Key points in bullet format
  | 'structured'      // Structured sections with headers
  | 'presentation';   // Presentation-ready format

/**
 * A single source citation
 */
export interface Citation {
  /** Unique identifier for the citation */
  id: string;

  /** Source title */
  title: string;

  /** Source URL */
  url: string;

  /** Author or organization */
  author?: string;

  /** Publication date */
  publishedDate?: string;

  /** Date the source was accessed */
  accessedDate: string;

  /** Brief description of the source */
  description?: string;

  /** Relevance score (0-1) */
  relevanceScore?: number;

  /** Credibility indicator */
  credibility?: 'high' | 'medium' | 'low' | 'unknown';
}

/**
 * A key finding from the research
 */
export interface Finding {
  /** The finding statement */
  statement: string;

  /** Supporting evidence */
  evidence: string[];

  /** Citation references */
  citations: string[];

  /** Confidence level */
  confidence: 'high' | 'medium' | 'low';

  /** Category or theme */
  category?: string;
}

/**
 * Research result structure
 */
export interface ResearchResult {
  /** Original query */
  query: string;

  /** Type of research performed */
  researchType: ResearchType;

  /** Executive summary */
  summary: string;

  /** Key findings */
  findings: Finding[];

  /** Detailed analysis */
  analysis: string;

  /** All citations used */
  citations: Citation[];

  /** Research methodology notes */
  methodology?: string;

  /** Limitations or caveats */
  limitations?: string[];

  /** Suggestions for further research */
  furtherResearch?: string[];

  /** Timestamp of research completion */
  completedAt: string;

  /** Research duration in milliseconds */
  durationMs: number;

  /** Token usage statistics */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalCost?: number;
  };
}

/**
 * Research session for multi-turn conversations
 */
export interface ResearchSession {
  /** Unique session identifier */
  id: string;

  /** Session start time */
  startedAt: string;

  /** All queries in the session */
  queries: string[];

  /** All results accumulated */
  results: ResearchResult[];

  /** Running context for follow-up questions */
  context: string;

  /** Whether the session is still active */
  active: boolean;
}

/**
 * Configuration for the research agent
 */
export interface ResearchAgentConfig {
  /** Model to use (default: claude-sonnet-4-6) */
  model?: string;

  /** Maximum turns per query */
  maxTurns?: number;

  /** Budget limit per query */
  maxBudgetUsd?: number;

  /** Enable extended thinking for complex research */
  enableExtendedThinking?: boolean;

  /** Include thinking process in output */
  includeThinkingOutput?: boolean;

  /** Default output format */
  defaultOutputFormat?: OutputFormat;

  /** Default number of sources */
  defaultMaxSources?: number;

  /** Custom system prompt additions */
  systemPromptAdditions?: string;
}

/**
 * Agent mode configuration
 */
export interface ResearchMode {
  name: string;
  description: string;
  researchType: ResearchType;
  outputFormat: OutputFormat;
  systemPromptAppend: string;
  maxTurns: number;
  maxBudgetUsd: number;
  allowedTools: string[];
}
