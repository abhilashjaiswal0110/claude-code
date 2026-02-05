/**
 * Presales/Sales Agent
 *
 * An AI agent for proposal generation, competitor analysis, RFP response,
 * pitch deck creation, and win/loss analysis.
 *
 * Modes: proposal, competitor, rfp, pitch-deck, win-loss
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
import type { PresalesMode, PresalesOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: PresalesMode[] = ['proposal', 'competitor', 'rfp', 'pitch-deck', 'win-loss'];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'Cloud Migration & Modernization for European Financial Services Client',
    'proposal',
    VALID_MODES
  );

  const presalesMode = mode as PresalesMode;

  logger.header('Presales/Sales Agent');
  logger.info(`Opportunity: ${topic}`);
  logger.info(`Mode: ${presalesMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(presalesMode);

  const results = await runPipeline(stages, {
    topic,
    mode: presalesMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Content Generation'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('GENERATED PRESALES CONTENT', finalContent);

  if (results['Executive Summary']) {
    logger.result('EXECUTIVE SUMMARY', results['Executive Summary']);
  }

  const output: PresalesOutput = {
    topic,
    mode: presalesMode,
    opportunityAnalysis: results['Opportunity Analysis'] || '',
    research: results['Deep Research'] || '',
    content: finalContent,
    executiveSummary: results['Executive Summary'] || '',
    competitivePositioning: results['Competitive Positioning'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `presales-${presalesMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `PRESALES - ${presalesMode.toUpperCase()}`,
          'Presales/Sales Agent',
          `${raw}\n\n${COMPLIANCE_DISCLAIMER}`,
          {
            Opportunity: t,
            Mode: meta.mode,
            Generated: meta.generatedAt,
          }
        ),
    },
    topic,
    finalContent,
    output as unknown as Record<string, unknown>,
    {
      agentName: 'Presales/Sales Agent',
      mode: presalesMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('Presales content generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate presales content:', error);
  process.exit(1);
});
