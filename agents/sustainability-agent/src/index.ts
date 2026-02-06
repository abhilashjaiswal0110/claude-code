/**
 * Sustainability Agent
 *
 * An AI agent for IT sustainability analysis, carbon footprint assessment,
 * green IT strategies, energy optimization, and ESG compliance guidance.
 *
 * Modes: carbon-footprint, green-it, sustainability-report, energy-optimization, esg-compliance
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
import type { SustainabilityMode, SustainabilityOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: SustainabilityMode[] = [
  'carbon-footprint',
  'green-it',
  'sustainability-report',
  'energy-optimization',
  'esg-compliance',
];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'Assess the carbon footprint of our data center operations and recommend reduction strategies',
    'carbon-footprint',
    VALID_MODES
  );

  const sustainabilityMode = mode as SustainabilityMode;

  logger.header('Sustainability Agent');
  logger.info(`Topic: ${topic}`);
  logger.info(`Mode: ${sustainabilityMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(sustainabilityMode);

  const results = await runPipeline(stages, {
    topic,
    mode: sustainabilityMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Compliance Review'] || results['Analysis'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('SUSTAINABILITY ANALYSIS', finalContent);

  const output: SustainabilityOutput = {
    topic,
    mode: sustainabilityMode,
    assessment: results['Assessment'] || '',
    dataCollection: results['Data Collection'] || '',
    analysis: results['Analysis'] || '',
    complianceReview: results['Compliance Review'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `sustainability-${sustainabilityMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `SUSTAINABILITY ANALYSIS - ${sustainabilityMode.toUpperCase()}`,
          'Sustainability Agent',
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
      agentName: 'Sustainability Agent',
      mode: sustainabilityMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('Sustainability analysis generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate sustainability analysis:', error);
  process.exit(1);
});
