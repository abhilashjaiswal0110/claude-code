/**
 * Extended Thinking Support for Deep Reasoning
 *
 * Provides utilities for leveraging Claude's extended thinking capabilities
 * for complex reasoning tasks. Extended thinking allows Claude to take more
 * time to think through problems before responding.
 *
 * @module extended-thinking
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/extended_thinking
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { logProgress, logInfo, logWarning, logDebug } from './logger.js';

/**
 * Configuration for extended thinking mode
 */
export interface ExtendedThinkingConfig {
  /** Maximum tokens for the thinking process (budget for reasoning) */
  maxThinkingTokens?: number;

  /** Maximum tokens for the final response */
  maxResponseTokens?: number;

  /** System prompt to guide reasoning */
  systemPrompt?: string;

  /** Additional context for the thinking process */
  thinkingContext?: string;

  /** Whether to include thinking process in output */
  includeThinkingOutput?: boolean;

  /** Budget limit in USD */
  maxBudgetUsd?: number;

  /** Maximum turns for agentic tasks */
  maxTurns?: number;
}

/**
 * Result of an extended thinking query
 */
export interface ExtendedThinkingResult {
  /** The final response text */
  response: string;

  /** The thinking process (if includeThinkingOutput was true) */
  thinking?: string;

  /** Token usage statistics */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    thinkingTokens?: number;
  };

  /** Duration of the thinking process in milliseconds */
  thinkingDurationMs?: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<ExtendedThinkingConfig> = {
  maxThinkingTokens: 10000,
  maxResponseTokens: 4096,
  systemPrompt: 'You are a thoughtful assistant who carefully reasons through problems.',
  thinkingContext: '',
  includeThinkingOutput: false,
  maxBudgetUsd: 1.0,
  maxTurns: 10,
};

/**
 * Execute a query with extended thinking enabled
 *
 * Extended thinking allows Claude to perform deeper reasoning by giving it
 * a dedicated "thinking budget" to work through complex problems before
 * providing a final response.
 *
 * @param prompt - The query to process
 * @param config - Configuration options for extended thinking
 * @returns Result containing the response and optional thinking output
 *
 * @example
 * ```typescript
 * const result = await runExtendedThinking(
 *   'Analyze this complex algorithm and suggest optimizations',
 *   {
 *     maxThinkingTokens: 5000,
 *     includeThinkingOutput: true,
 *     systemPrompt: 'You are an expert software architect.'
 *   }
 * );
 *
 * console.log('Thinking:', result.thinking);
 * console.log('Response:', result.response);
 * ```
 */
export async function runExtendedThinking(
  prompt: string,
  config: ExtendedThinkingConfig = {}
): Promise<ExtendedThinkingResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const startTime = Date.now();
  let response = '';
  let thinking = '';
  let inputTokens = 0;
  let outputTokens = 0;

  logInfo('Starting extended thinking process...');

  // Build the enhanced prompt that encourages deep thinking
  const enhancedPrompt = buildThinkingPrompt(prompt, mergedConfig);

  // Build system prompt that encourages step-by-step reasoning
  const systemPromptWithThinking = `${mergedConfig.systemPrompt}

IMPORTANT: For this query, take your time to think through the problem carefully.
Break down complex problems into smaller parts and reason through each step.
Consider multiple approaches and evaluate their trade-offs before providing your answer.
${mergedConfig.thinkingContext ? `\nAdditional context: ${mergedConfig.thinkingContext}` : ''}`;

  try {
    for await (const message of query({
      prompt: enhancedPrompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: systemPromptWithThinking,
        },
        allowedTools: ['Read', 'Glob', 'Grep'], // Limited tools for thinking
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: mergedConfig.maxTurns,
        maxBudgetUsd: mergedConfig.maxBudgetUsd,
      },
    })) {
      if (message.type === 'assistant' && message.message.content) {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            logProgress();

            // Capture thinking blocks if they're marked
            const text = block.text;
            if (mergedConfig.includeThinkingOutput) {
              // Look for thinking markers
              const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
              if (thinkingMatch) {
                thinking += thinkingMatch[1];
              }
            }
          }
        }
      }

      if ('result' in message && message.type === 'result') {
        response = message.result;
      }

      // Track usage if available
      if ('usage' in message && message.usage) {
        inputTokens = message.usage.input_tokens || 0;
        outputTokens = message.usage.output_tokens || 0;
      }
    }
  } catch (err) {
    logWarning(`Extended thinking error: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }

  const thinkingDurationMs = Date.now() - startTime;
  logInfo(`Extended thinking completed in ${thinkingDurationMs}ms`);

  return {
    response,
    thinking: mergedConfig.includeThinkingOutput ? thinking : undefined,
    usage: {
      inputTokens,
      outputTokens,
      thinkingTokens: thinking ? Math.ceil(thinking.length / 4) : undefined,
    },
    thinkingDurationMs,
  };
}

/**
 * Build an enhanced prompt that encourages deep thinking
 */
function buildThinkingPrompt(prompt: string, config: Required<ExtendedThinkingConfig>): string {
  const parts: string[] = [];

  if (config.includeThinkingOutput) {
    parts.push(
      'Before providing your final answer, wrap your detailed reasoning process in <thinking></thinking> tags.',
      ''
    );
  }

  parts.push(
    'Please carefully analyze the following and provide a thorough response:',
    '',
    prompt
  );

  return parts.join('\n');
}

/**
 * Run a structured analysis with extended thinking
 *
 * This variant is designed for analytical tasks that benefit from
 * a structured output format with clear sections.
 *
 * @param topic - The subject to analyze
 * @param analysisType - Type of analysis to perform
 * @param config - Extended thinking configuration
 * @returns Structured analysis result
 *
 * @example
 * ```typescript
 * const analysis = await runStructuredAnalysis(
 *   'microservices vs monolithic architecture',
 *   'comparison',
 *   { maxThinkingTokens: 8000 }
 * );
 * ```
 */
export async function runStructuredAnalysis(
  topic: string,
  analysisType: 'comparison' | 'evaluation' | 'recommendation' | 'investigation' | 'synthesis',
  config: ExtendedThinkingConfig = {}
): Promise<ExtendedThinkingResult> {
  const analysisPrompts: Record<string, string> = {
    comparison: `Perform a detailed comparison analysis of: ${topic}

Structure your analysis with:
1. Overview of each option
2. Key similarities
3. Key differences
4. Pros and cons of each
5. Use case recommendations
6. Final assessment`,

    evaluation: `Provide a thorough evaluation of: ${topic}

Structure your evaluation with:
1. Background and context
2. Criteria for evaluation
3. Detailed assessment against criteria
4. Strengths identified
5. Weaknesses or concerns
6. Overall rating and justification`,

    recommendation: `Provide recommendations for: ${topic}

Structure your recommendations with:
1. Current situation assessment
2. Goals and constraints identified
3. Options considered
4. Recommended approach
5. Implementation steps
6. Risk mitigation strategies`,

    investigation: `Investigate the following: ${topic}

Structure your investigation with:
1. Problem statement
2. Evidence gathered
3. Analysis of findings
4. Root causes identified
5. Conclusions
6. Recommended actions`,

    synthesis: `Synthesize information about: ${topic}

Structure your synthesis with:
1. Key themes identified
2. Patterns and relationships
3. Contradictions or conflicts
4. Integrated understanding
5. Implications
6. Summary of insights`,
  };

  const prompt = analysisPrompts[analysisType];

  return runExtendedThinking(prompt, {
    ...config,
    systemPrompt: config.systemPrompt ||
      'You are an expert analyst who provides thorough, well-structured analyses.',
    includeThinkingOutput: config.includeThinkingOutput ?? true,
  });
}

/**
 * Run a problem-solving session with extended thinking
 *
 * Designed for complex problem-solving that requires systematic
 * exploration of the solution space.
 *
 * @param problem - Description of the problem
 * @param constraints - Known constraints or requirements
 * @param config - Extended thinking configuration
 * @returns Problem-solving result
 */
export async function runProblemSolving(
  problem: string,
  constraints: string[] = [],
  config: ExtendedThinkingConfig = {}
): Promise<ExtendedThinkingResult> {
  const constraintText = constraints.length > 0
    ? `\n\nConstraints to consider:\n${constraints.map(c => `- ${c}`).join('\n')}`
    : '';

  const prompt = `Problem to solve: ${problem}${constraintText}

Approach this systematically:
1. Understand the problem completely
2. Identify key challenges
3. Generate multiple potential solutions
4. Evaluate each solution against constraints
5. Select the best approach
6. Provide detailed implementation plan`;

  return runExtendedThinking(prompt, {
    ...config,
    systemPrompt: config.systemPrompt ||
      'You are an expert problem solver who methodically works through complex challenges.',
    includeThinkingOutput: true,
    maxThinkingTokens: config.maxThinkingTokens || 12000, // More tokens for problem-solving
  });
}

/**
 * Run a code review with extended thinking
 *
 * Performs deep analysis of code for bugs, security issues,
 * and improvement opportunities.
 *
 * @param code - The code to review
 * @param language - Programming language
 * @param focusAreas - Specific areas to focus on
 * @param config - Extended thinking configuration
 * @returns Code review result
 */
export async function runCodeReview(
  code: string,
  language: string,
  focusAreas: string[] = ['bugs', 'security', 'performance', 'maintainability'],
  config: ExtendedThinkingConfig = {}
): Promise<ExtendedThinkingResult> {
  const prompt = `Review the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Focus areas: ${focusAreas.join(', ')}

Provide a comprehensive review covering:
1. Summary of what the code does
2. Issues found (categorized by severity)
3. Security concerns
4. Performance considerations
5. Code quality and maintainability
6. Specific recommendations for improvement`;

  return runExtendedThinking(prompt, {
    ...config,
    systemPrompt: config.systemPrompt ||
      `You are an expert ${language} developer performing a thorough code review.`,
    includeThinkingOutput: true,
  });
}
