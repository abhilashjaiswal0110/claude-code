/**
 * HR Agent
 *
 * An AI agent that handles HR policy queries, benefits explanations,
 * engagement analysis, onboarding guides, and exit interview summaries.
 *
 * Modes: policy, benefits, engagement, onboarding, exit-interview
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
import type { HRMode, HROutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: HRMode[] = ['policy', 'benefits', 'engagement', 'onboarding', 'exit-interview'];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'What is the work from home policy and how do I apply for remote work?',
    'policy',
    VALID_MODES
  );

  const hrMode = mode as HRMode;

  logger.header('HR Agent');
  logger.info(`Query: ${topic}`);
  logger.info(`Mode: ${hrMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(hrMode);

  const results = await runPipeline(stages, {
    topic,
    mode: hrMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Compliance Check'] || results['Response Generation'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('HR RESPONSE', finalContent);

  const output: HROutput = {
    topic,
    mode: hrMode,
    classification: results['Classification'] || '',
    policySearch: results['Policy Search'] || '',
    response: results['Response Generation'] || '',
    complianceCheck: results['Compliance Check'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `hr-${hrMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `HR RESPONSE - ${hrMode.toUpperCase()}`,
          'HR Agent',
          `${raw}\n\n${COMPLIANCE_DISCLAIMER}`,
          {
            Query: t,
            Mode: meta.mode,
            Generated: meta.generatedAt,
          }
        ),
    },
    topic,
    finalContent,
    output as unknown as Record<string, unknown>,
    {
      agentName: 'HR Agent',
      mode: hrMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('HR response generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate HR response:', error);
  process.exit(1);
});
