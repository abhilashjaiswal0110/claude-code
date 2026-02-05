/**
 * Multi-stage pipeline executor
 *
 * Runs a sequence of stages (e.g., research → generate → output),
 * passing results from each stage to the next.
 */

import { runQuery } from './sdk-wrapper.js';
import { logger } from './logger.js';
import type { StageConfig, StageContext } from './types.js';

export async function runPipeline(
  stages: StageConfig[],
  context: StageContext
): Promise<Record<string, string>> {
  const results: Record<string, string> = { ...context.previousResults };

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    logger.stageStart(i + 1, stages.length, stage.name);

    const prompt = stage.buildPrompt({
      ...context,
      previousResults: results,
    });

    const result = await runQuery(prompt, {
      systemPromptAppend: stage.systemPromptAppend,
      allowedTools: stage.allowedTools,
      maxTurns: stage.maxTurns,
      maxBudgetUsd: stage.maxBudgetUsd,
    });

    results[stage.name] = result;
    logger.stageComplete(stage.name);
  }

  return results;
}
