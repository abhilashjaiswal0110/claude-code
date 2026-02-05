/**
 * IT Operations Agent
 *
 * An AI agent for incident triage, knowledge base search, root cause analysis,
 * status report generation, and runbook creation.
 *
 * Modes: incident, kb-search, root-cause, status-report, runbook
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
import type { ITOpsMode, ITOpsOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: ITOpsMode[] = ['incident', 'kb-search', 'root-cause', 'status-report', 'runbook'];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'Production API server returning 503 errors with high CPU usage',
    'incident',
    VALID_MODES
  );

  const opsMode = mode as ITOpsMode;

  logger.header('IT Operations Agent');
  logger.info(`Request: ${topic}`);
  logger.info(`Mode: ${opsMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(opsMode);

  const results = await runPipeline(stages, {
    topic,
    mode: opsMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Report Formatting'] || results['Analysis & Recommendation'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('IT OPERATIONS OUTPUT', finalContent);

  const output: ITOpsOutput = {
    topic,
    mode: opsMode,
    classification: results['Intake & Classification'] || '',
    knowledgeRetrieval: results['Knowledge Retrieval'] || '',
    analysis: results['Analysis & Recommendation'] || '',
    report: results['Report Formatting'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `itops-${opsMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `IT OPERATIONS - ${opsMode.toUpperCase()}`,
          'IT Operations Agent',
          `${raw}\n\n${COMPLIANCE_DISCLAIMER}`,
          {
            Request: t,
            Mode: meta.mode,
            Generated: meta.generatedAt,
          }
        ),
    },
    topic,
    finalContent,
    output as unknown as Record<string, unknown>,
    {
      agentName: 'IT Operations Agent',
      mode: opsMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('IT operations output generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate IT operations output:', error);
  process.exit(1);
});
