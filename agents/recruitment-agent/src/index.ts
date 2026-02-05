/**
 * Recruitment Agent
 *
 * An AI agent for job description generation, resume screening,
 * interview question creation, candidate comparison, and offer letters.
 *
 * Includes bias detection and compliance checking in every pipeline run.
 *
 * Modes: jd, screening, interview, comparison, offer
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
import type { RecruitmentMode, RecruitmentOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: RecruitmentMode[] = ['jd', 'screening', 'interview', 'comparison', 'offer'];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'Senior Cloud Solutions Architect - Hybrid Cloud & Multi-Cloud',
    'jd',
    VALID_MODES
  );

  const recruitMode = mode as RecruitmentMode;

  logger.header('Recruitment Agent');
  logger.info(`Topic: ${topic}`);
  logger.info(`Mode: ${recruitMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(recruitMode);

  const results = await runPipeline(stages, {
    topic,
    mode: recruitMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Bias & Compliance Check'] || results['Content Generation'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('RECRUITMENT OUTPUT', finalContent);

  const output: RecruitmentOutput = {
    topic,
    mode: recruitMode,
    roleAnalysis: results['Role Understanding'] || '',
    marketResearch: results['Market Research'] || '',
    content: results['Content Generation'] || '',
    biasCheck: results['Bias & Compliance Check'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `recruitment-${recruitMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `RECRUITMENT - ${recruitMode.toUpperCase()}`,
          'Recruitment Agent',
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
      agentName: 'Recruitment Agent',
      mode: recruitMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('Recruitment output generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate recruitment output:', error);
  process.exit(1);
});
