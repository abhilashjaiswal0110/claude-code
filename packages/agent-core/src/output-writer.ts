/**
 * Dual-format output (txt + json) with timestamped filenames
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { OutputConfig, OutputMetadata } from './types.js';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function writeOutput(
  config: OutputConfig,
  topic: string,
  rawContent: string,
  jsonData: Record<string, unknown>,
  metadata: OutputMetadata
): string {
  if (!existsSync(config.directory)) {
    mkdirSync(config.directory, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const slug = generateSlug(topic);
  const baseFilename = `${timestamp}_${config.filenamePrefix}_${slug}`;

  // Write formatted text output
  const formattedContent = config.formatOutput(topic, rawContent, metadata);
  const txtPath = join(config.directory, `${baseFilename}.txt`);
  writeFileSync(txtPath, formattedContent, 'utf-8');

  // Write JSON output if enabled
  if (config.includeJson) {
    const jsonPath = join(config.directory, `${baseFilename}.json`);
    writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  }

  return txtPath;
}
