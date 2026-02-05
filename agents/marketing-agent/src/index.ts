/**
 * Marketing & Communication Agent
 *
 * An AI agent that researches topics and generates marketing content
 * for Atos enterprise communications.
 *
 * Modes: blog, social, campaign, press-release, newsletter
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
import type { MarketingMode, MarketingOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: MarketingMode[] = ['blog', 'social', 'campaign', 'press-release', 'newsletter'];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'AI-Powered Digital Transformation: How Enterprises Are Scaling Intelligent Automation',
    'blog',
    VALID_MODES
  );

  const marketingMode = mode as MarketingMode;

  logger.header('Marketing & Communication Agent');
  logger.info(`Topic: ${topic}`);
  logger.info(`Mode: ${marketingMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(marketingMode);

  const results = await runPipeline(stages, {
    topic,
    mode: marketingMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Generation'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('GENERATED CONTENT', finalContent);

  const output: MarketingOutput = {
    topic,
    mode: marketingMode,
    researchSummary: results['Research'] || '',
    strategy: results['Strategy'] || '',
    content: finalContent,
    optimization: results['Optimization'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `marketing-${marketingMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `MARKETING CONTENT - ${marketingMode.toUpperCase()}`,
          'Marketing & Communication Agent',
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
      agentName: 'Marketing & Communication Agent',
      mode: marketingMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('Marketing content generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate marketing content:', error);
  process.exit(1);
});
