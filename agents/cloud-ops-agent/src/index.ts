/**
 * Cloud Operations Agent
 *
 * An AI agent for cloud cost optimization, incident response, capacity planning,
 * architecture reviews, and migration assessments across AWS, Azure, and GCP.
 *
 * Modes: cost-optimization, incident-response, capacity-planning, architecture-review, migration-assessment
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
import type { CloudOpsMode, CloudOpsOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: CloudOpsMode[] = [
  'cost-optimization',
  'incident-response',
  'capacity-planning',
  'architecture-review',
  'migration-assessment',
];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'Optimize cloud costs for our production Kubernetes cluster on AWS',
    'cost-optimization',
    VALID_MODES
  );

  const cloudOpsMode = mode as CloudOpsMode;

  logger.header('Cloud Operations Agent');
  logger.info(`Topic: ${topic}`);
  logger.info(`Mode: ${cloudOpsMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(cloudOpsMode);

  const results = await runPipeline(stages, {
    topic,
    mode: cloudOpsMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Operational Review'] || results['Recommendations'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('CLOUD OPERATIONS ANALYSIS', finalContent);

  const output: CloudOpsOutput = {
    topic,
    mode: cloudOpsMode,
    discovery: results['Discovery'] || '',
    analysis: results['Analysis'] || '',
    recommendations: results['Recommendations'] || '',
    operationalReview: results['Operational Review'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `cloud-ops-${cloudOpsMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `CLOUD OPERATIONS - ${cloudOpsMode.toUpperCase()}`,
          'Cloud Operations Agent',
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
      agentName: 'Cloud Operations Agent',
      mode: cloudOpsMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('Cloud operations analysis generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate cloud operations analysis:', error);
  process.exit(1);
});
