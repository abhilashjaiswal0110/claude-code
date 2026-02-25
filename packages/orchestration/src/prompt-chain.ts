/**
 * Prompt Chaining Pattern
 *
 * Implements sequential execution of prompts where each step's
 * output feeds into the next step's input.
 *
 * @see https://anthropic.com/research/building-effective-agents
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { logger } from '@enterprise-agents/core';

import type {
  ChainStep,
  PromptChainConfig,
  ChainResult,
} from './types.js';

/**
 * Default chain configuration
 */
const DEFAULT_CONFIG: Partial<PromptChainConfig> = {
  stopOnError: true,
  timeout: 300000, // 5 minutes
  maxBudgetUsd: 5.0,
};

/**
 * Prompt Chain executor
 *
 * Executes a sequence of prompts with data flow between steps.
 */
export class PromptChain {
  private config: PromptChainConfig;

  constructor(config: PromptChainConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as PromptChainConfig;
  }

  /**
   * Execute the prompt chain
   *
   * @param initialInput - Input for the first step
   * @returns Chain execution result
   */
  async execute(initialInput: unknown): Promise<ChainResult> {
    const startTime = Date.now();
    const stepResults: Record<string, unknown> = {};
    const skippedSteps: string[] = [];

    logger.info(`Starting prompt chain with ${this.config.steps.length} steps`);

    try {
      let currentInput = initialInput;

      for (let i = 0; i < this.config.steps.length; i++) {
        const step = this.config.steps[i];

        // Check condition if specified
        if (step.condition && !step.condition(stepResults)) {
          logger.info(`Skipping step ${step.name} (condition not met)`);
          skippedSteps.push(step.name);
          continue;
        }

        logger.info(`Executing step ${i + 1}/${this.config.steps.length}: ${step.name}`);

        // Transform input if needed
        const stepInput = step.transformInput
          ? step.transformInput(currentInput, stepResults)
          : currentInput;

        // Build prompt
        const prompt = this.buildStepPrompt(step, stepInput, stepResults);

        // Execute step
        const output = await this.executeStep(step, prompt);

        // Transform output if needed
        const transformedOutput = step.transformOutput
          ? step.transformOutput(output)
          : output;

        // Store result
        stepResults[step.name] = transformedOutput;
        currentInput = transformedOutput;

        logger.info(`Completed step: ${step.name}`);
      }

      const totalDurationMs = Date.now() - startTime;

      // Get final output from last non-skipped step
      const executedSteps = this.config.steps.filter(s => !skippedSteps.includes(s.name));
      const lastStep = executedSteps[executedSteps.length - 1];
      const finalOutput = lastStep ? stepResults[lastStep.name] : initialInput;

      return {
        success: true,
        stepResults,
        finalOutput,
        skippedSteps,
        totalDurationMs,
      };
    } catch (err) {
      const totalDurationMs = Date.now() - startTime;

      return {
        success: false,
        stepResults,
        finalOutput: null,
        skippedSteps,
        error: err instanceof Error ? err.message : String(err),
        totalDurationMs,
      };
    }
  }

  /**
   * Build prompt for a step
   */
  private buildStepPrompt(
    step: ChainStep,
    input: unknown,
    previousResults: Record<string, unknown>
  ): string {
    // Replace template variables
    let prompt = step.promptTemplate;

    // Replace {input} placeholder
    prompt = prompt.replace(
      /\{input\}/g,
      typeof input === 'string' ? input : JSON.stringify(input, null, 2)
    );

    // Replace {stepName} placeholders for previous results
    for (const [stepName, result] of Object.entries(previousResults)) {
      prompt = prompt.replace(
        new RegExp(`\\{${stepName}\\}`, 'g'),
        typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      );
    }

    return prompt;
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: ChainStep, prompt: string): Promise<string> {
    let result = '';

    for await (const message of query({
      prompt,
      options: {
        systemPrompt: step.systemPrompt
          ? {
              type: 'preset',
              preset: 'claude_code',
              append: step.systemPrompt,
            }
          : { type: 'preset', preset: 'claude_code' },
        allowedTools: step.allowedTools || [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: step.maxTurns || 10,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        result = message.result as string;
      }
    }

    return result;
  }
}

/**
 * Create a research and writing chain
 */
export function createResearchWritingChain(): PromptChain {
  return new PromptChain({
    steps: [
      {
        name: 'research',
        promptTemplate: `Research the following topic thoroughly:
{input}

Gather key facts, statistics, and expert opinions.
Cite your sources using markdown links.`,
        systemPrompt: 'You are a thorough research analyst.',
        allowedTools: ['WebSearch'],
        maxTurns: 15,
      },
      {
        name: 'outline',
        promptTemplate: `Based on the following research, create a detailed outline:

Research:
{research}

Create a structured outline with main sections and key points.`,
        systemPrompt: 'You are a skilled content planner.',
        allowedTools: [],
        maxTurns: 5,
      },
      {
        name: 'draft',
        promptTemplate: `Write a comprehensive article based on this outline:

Outline:
{outline}

Research:
{research}

Write engaging, well-structured content.`,
        systemPrompt: 'You are a professional writer.',
        allowedTools: [],
        maxTurns: 5,
      },
      {
        name: 'edit',
        promptTemplate: `Edit and polish the following draft:

{draft}

Improve clarity, flow, and impact. Fix any errors.`,
        systemPrompt: 'You are a meticulous editor.',
        allowedTools: [],
        maxTurns: 5,
      },
    ],
  });
}

/**
 * Create a data analysis chain
 */
export function createAnalysisChain(): PromptChain {
  return new PromptChain({
    steps: [
      {
        name: 'gather',
        promptTemplate: `Gather data about:
{input}

Find relevant metrics, statistics, and trends.`,
        systemPrompt: 'You are a data analyst.',
        allowedTools: ['WebSearch', 'Read'],
        maxTurns: 15,
      },
      {
        name: 'analyze',
        promptTemplate: `Analyze the following data:

{gather}

Identify patterns, correlations, and insights.`,
        systemPrompt: 'You are a statistical analyst.',
        allowedTools: [],
        maxTurns: 10,
      },
      {
        name: 'visualize',
        promptTemplate: `Based on this analysis, describe visualizations:

{analyze}

Recommend charts and graphs that would best represent the data.`,
        systemPrompt: 'You are a data visualization expert.',
        allowedTools: [],
        maxTurns: 5,
      },
      {
        name: 'summarize',
        promptTemplate: `Create an executive summary of the analysis:

Analysis:
{analyze}

Visualization Recommendations:
{visualize}

Provide key insights and recommendations.`,
        systemPrompt: 'You are a business analyst.',
        allowedTools: [],
        maxTurns: 5,
      },
    ],
  });
}
