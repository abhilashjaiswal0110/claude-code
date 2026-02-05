/**
 * Learning & Development Agent
 *
 * An AI agent for skill gap analysis, learning path generation,
 * training recommendations, assessment creation, and team skill matrices.
 *
 * Modes: skill-gap, learning-path, training, assessment, team-matrix
 *
 * @author Abhilash Jaiswal
 */

import 'dotenv/config';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  validateEnvironment,
  parseCliArgs,
  runPipeline,
  writeOutput,
  logger,
} from '@enterprise-agents/core';
import { formatExecutiveSummary, COMPLIANCE_DISCLAIMER } from '@enterprise-agents/prompts';
import { buildStages } from './prompts.js';
import type { LDMode, LDOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: LDMode[] = ['skill-gap', 'learning-path', 'training', 'assessment', 'team-matrix'];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'Cloud Solutions Architect transitioning from on-premise infrastructure',
    'learning-path',
    VALID_MODES
  );

  const ldMode = mode as LDMode;

  logger.header('Learning & Development Agent');
  logger.info(`Topic: ${topic}`);
  logger.info(`Mode: ${ldMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(ldMode);

  const results = await runPipeline(stages, {
    topic,
    mode: ldMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Quality Review'] || results['Gap Analysis & Planning'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('L&D OUTPUT', finalContent);

  const output: LDOutput = {
    topic,
    mode: ldMode,
    profileAnalysis: results['Profile Analysis'] || '',
    marketResearch: results['Market Research'] || '',
    gapAnalysis: results['Gap Analysis & Planning'] || '',
    learningPlan: results['Quality Review'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `ld-${ldMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `LEARNING & DEVELOPMENT - ${ldMode.toUpperCase()}`,
          'Learning & Development Agent',
          `${raw}\n\n${COMPLIANCE_DISCLAIMER}`,
          {
            Topic: t,
            Mode: meta.mode,
            Generated: meta.generatedAt,
          }
        ),
    },
    topic,
    finalContent,
    output as unknown as Record<string, unknown>,
    {
      agentName: 'Learning & Development Agent',
      mode: ldMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('L&D output generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate L&D output:', error);
  process.exit(1);
});
