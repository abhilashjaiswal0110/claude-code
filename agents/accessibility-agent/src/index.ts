/**
 * Accessibility Compliance Agent
 *
 * An AI agent for digital accessibility auditing, WCAG compliance assessment,
 * remediation planning, and inclusive design guidance.
 *
 * Modes: wcag-audit, remediation-plan, alt-text, aria-review, compliance-report
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
import type { AccessibilityMode, AccessibilityOutput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const VALID_MODES: AccessibilityMode[] = [
  'wcag-audit',
  'remediation-plan',
  'alt-text',
  'aria-review',
  'compliance-report',
];

async function main(): Promise<void> {
  validateEnvironment();

  const { topic, mode, additionalContext } = parseCliArgs(
    'Audit our customer portal for WCAG 2.1 AA compliance',
    'wcag-audit',
    VALID_MODES
  );

  const accessibilityMode = mode as AccessibilityMode;

  logger.header('Accessibility Compliance Agent');
  logger.info(`Topic: ${topic}`);
  logger.info(`Mode: ${accessibilityMode}`);
  if (additionalContext) {
    logger.info(`Context: ${additionalContext}`);
  }

  const stages = buildStages(accessibilityMode);

  const results = await runPipeline(stages, {
    topic,
    mode: accessibilityMode,
    additionalContext,
    previousResults: {},
  });

  const finalContent = results['Compliance Verification'] || results['Recommendations'] || '';
  const generatedAt = new Date().toISOString();

  logger.result('ACCESSIBILITY ANALYSIS', finalContent);

  const output: AccessibilityOutput = {
    topic,
    mode: accessibilityMode,
    scopeAnalysis: results['Scope Analysis'] || '',
    technicalReview: results['Technical Review'] || '',
    recommendations: results['Recommendations'] || '',
    complianceVerification: results['Compliance Verification'] || '',
    generatedAt,
  };

  const outputPath = writeOutput(
    {
      directory: OUTPUT_DIR,
      filenamePrefix: `accessibility-${accessibilityMode}`,
      includeJson: true,
      formatOutput: (t, raw, meta) =>
        formatExecutiveSummary(
          `ACCESSIBILITY ANALYSIS - ${accessibilityMode.toUpperCase()}`,
          'Accessibility Compliance Agent',
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
      agentName: 'Accessibility Compliance Agent',
      mode: accessibilityMode,
      generatedAt,
      topic,
    }
  );

  logger.saved(outputPath);
  logger.done('Accessibility analysis generated successfully!');
}

main().catch((error) => {
  logger.error('Failed to generate accessibility analysis:', error);
  process.exit(1);
});
