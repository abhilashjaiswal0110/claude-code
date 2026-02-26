/**
 * Evaluator-Optimizer Pattern
 *
 * Implements iterative refinement where a generator creates content
 * and an evaluator provides feedback for optimization.
 *
 * @see https://anthropic.com/research/building-effective-agents
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { logger } from '@enterprise-agents/core';

import type {
  EvaluatorOptimizerConfig,
  EvaluationResult,
  EvaluationCriterion,
  OptimizationIteration,
} from './types.js';

/**
 * Default evaluator-optimizer configuration
 */
const DEFAULT_CONFIG: Partial<EvaluatorOptimizerConfig> = {
  minScore: 0.8,
  maxIterations: 3,
  includeFeedback: true,
  generatorTools: ['WebSearch', 'Read'],
  evaluatorTools: ['Read'],
};

/**
 * Evaluator-Optimizer class
 *
 * Coordinates iterative content generation and refinement.
 */
export class EvaluatorOptimizer {
  private config: EvaluatorOptimizerConfig;

  constructor(config: EvaluatorOptimizerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as EvaluatorOptimizerConfig;
  }

  /**
   * Run the optimization loop
   *
   * @param task - The task to optimize for
   * @returns Final optimized result
   */
  async optimize(task: string): Promise<{
    success: boolean;
    finalContent: string;
    iterations: OptimizationIteration[];
    finalScore: number;
  }> {
    const iterations: OptimizationIteration[] = [];
    let currentContent = '';
    let previousFeedback = '';
    const maxIterations = this.config.maxIterations || 3;
    const minScore = this.config.minScore || 0.8;

    logger.info('Starting evaluator-optimizer loop');

    for (let i = 0; i < maxIterations; i++) {
      const iterationStart = Date.now();
      logger.info(`Iteration ${i + 1}/${maxIterations}`);

      // Generate/Regenerate content
      currentContent = await this.generate(task, currentContent, previousFeedback);

      // Evaluate content
      const evaluation = await this.evaluate(task, currentContent);

      iterations.push({
        iteration: i + 1,
        content: currentContent,
        evaluation,
        durationMs: Date.now() - iterationStart,
      });

      logger.info(`Iteration ${i + 1} score: ${evaluation.score.toFixed(2)}`);

      // Check if we've reached acceptable quality
      if (evaluation.passes && evaluation.score >= minScore) {
        logger.info(`Reached acceptable quality at iteration ${i + 1}`);
        return {
          success: true,
          finalContent: currentContent,
          iterations,
          finalScore: evaluation.score,
        };
      }

      // Prepare feedback for next iteration
      if (this.config.includeFeedback) {
        previousFeedback = evaluation.feedback;
      }
    }

    // Return best result even if threshold not met
    const bestIteration = iterations.reduce((best, curr) =>
      curr.evaluation.score > best.evaluation.score ? curr : best
    );

    logger.warning(`Max iterations reached, returning best result (score: ${bestIteration.evaluation.score.toFixed(2)})`);

    return {
      success: bestIteration.evaluation.passes,
      finalContent: bestIteration.content,
      iterations,
      finalScore: bestIteration.evaluation.score,
    };
  }

  /**
   * Generate or regenerate content
   */
  private async generate(
    task: string,
    previousContent: string,
    feedback: string
  ): Promise<string> {
    let prompt: string;

    if (!previousContent) {
      // Initial generation
      prompt = `Task: ${task}

Generate high-quality content that fully addresses this task.`;
    } else {
      // Regeneration with feedback
      prompt = `Task: ${task}

Previous Attempt:
${previousContent}

Evaluator Feedback:
${feedback}

Based on the feedback, regenerate improved content that addresses the identified issues.`;
    }

    let result = '';

    for await (const message of query({
      prompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: this.config.generatorPrompt,
        },
        allowedTools: this.config.generatorTools || [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 15,
        maxBudgetUsd: 2.0,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        result = message.result as string;
      }
    }

    return result;
  }

  /**
   * Evaluate generated content
   */
  private async evaluate(task: string, content: string): Promise<EvaluationResult> {
    const criteriaText = this.config.criteria
      .map(c => `- ${c.name} (weight: ${c.weight}): ${c.description}`)
      .join('\n');

    const evaluationPrompt = `Evaluate the following content against the specified criteria.

Task: ${task}

Content to Evaluate:
${content}

Evaluation Criteria:
${criteriaText}

Provide your evaluation in JSON format:
{
  "scores": {
    "criterion_name": score_between_0_and_1,
    ...
  },
  "feedback": "Detailed feedback explaining strengths and weaknesses",
  "suggestions": ["specific improvement suggestion 1", "suggestion 2", ...]
}`;

    let evaluationResult = '';

    for await (const message of query({
      prompt: evaluationPrompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: this.config.evaluatorPrompt,
        },
        allowedTools: this.config.evaluatorTools || [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 5,
        maxBudgetUsd: 0.5,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        evaluationResult = message.result as string;
      }
    }

    return this.parseEvaluation(evaluationResult);
  }

  /**
   * Parse evaluation result from JSON response
   */
  private parseEvaluation(result: string): EvaluationResult {
    try {
      // Extract JSON from response - use safer approach to avoid ReDoS
      const startIdx = result.indexOf('{');
      const endIdx = result.lastIndexOf('}');
      const jsonMatch = startIdx !== -1 && endIdx > startIdx && result.includes('"scores"')
        ? [result.slice(startIdx, endIdx + 1)]
        : null;
      if (!jsonMatch) {
        throw new Error('No evaluation JSON found');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Calculate weighted score
      let totalWeight = 0;
      let weightedSum = 0;
      const criterionScores: Record<string, number> = {};

      for (const criterion of this.config.criteria) {
        const score = parsed.scores?.[criterion.name] ?? 0.5;
        criterionScores[criterion.name] = score;
        weightedSum += score * criterion.weight;
        totalWeight += criterion.weight;
      }

      const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
      const minScore = this.config.minScore || 0.8;

      return {
        score: overallScore,
        criterionScores,
        feedback: parsed.feedback || 'No feedback provided',
        passes: overallScore >= minScore,
        suggestions: parsed.suggestions || [],
      };
    } catch (err) {
      // Return default evaluation on parse error
      logger.warning('Failed to parse evaluation, using defaults');

      const defaultScores: Record<string, number> = {};
      for (const criterion of this.config.criteria) {
        defaultScores[criterion.name] = 0.5;
      }

      return {
        score: 0.5,
        criterionScores: defaultScores,
        feedback: result,
        passes: false,
      };
    }
  }
}

/**
 * Create an evaluator-optimizer for content quality
 */
export function createContentOptimizer(
  additionalCriteria: EvaluationCriterion[] = []
): EvaluatorOptimizer {
  const defaultCriteria: EvaluationCriterion[] = [
    {
      name: 'accuracy',
      description: 'Information is factually correct and well-sourced',
      weight: 0.3,
    },
    {
      name: 'completeness',
      description: 'All aspects of the task are addressed',
      weight: 0.25,
    },
    {
      name: 'clarity',
      description: 'Content is clear, well-organized, and easy to understand',
      weight: 0.2,
    },
    {
      name: 'relevance',
      description: 'Content stays focused on the task without tangents',
      weight: 0.15,
    },
    {
      name: 'quality',
      description: 'Professional writing quality and appropriate tone',
      weight: 0.1,
    },
  ];

  return new EvaluatorOptimizer({
    generatorPrompt: 'You are a skilled content creator who produces high-quality, well-researched content.',
    evaluatorPrompt: 'You are a critical evaluator who provides detailed, constructive feedback for improvement.',
    criteria: [...defaultCriteria, ...additionalCriteria],
    minScore: 0.8,
    maxIterations: 3,
    includeFeedback: true,
  });
}

/**
 * Create an evaluator-optimizer for code quality
 */
export function createCodeOptimizer(
  additionalCriteria: EvaluationCriterion[] = []
): EvaluatorOptimizer {
  const codeCriteria: EvaluationCriterion[] = [
    {
      name: 'correctness',
      description: 'Code is functionally correct and handles edge cases',
      weight: 0.35,
    },
    {
      name: 'efficiency',
      description: 'Code is efficient with good time/space complexity',
      weight: 0.2,
    },
    {
      name: 'readability',
      description: 'Code is well-structured, documented, and easy to understand',
      weight: 0.2,
    },
    {
      name: 'security',
      description: 'Code follows security best practices',
      weight: 0.15,
    },
    {
      name: 'testability',
      description: 'Code is designed for easy testing',
      weight: 0.1,
    },
  ];

  return new EvaluatorOptimizer({
    generatorPrompt: 'You are an expert software developer who writes clean, efficient, secure code.',
    evaluatorPrompt: 'You are a senior code reviewer who provides thorough, constructive code reviews.',
    criteria: [...codeCriteria, ...additionalCriteria],
    minScore: 0.85,
    maxIterations: 3,
    includeFeedback: true,
    generatorTools: ['Read', 'Glob', 'Grep'],
    evaluatorTools: ['Read'],
  });
}
