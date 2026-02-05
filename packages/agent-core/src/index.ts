/**
 * @enterprise-agents/core
 *
 * Shared SDK utilities for enterprise AI agents.
 * Extracted from the LinkedIn Content Generator agent.
 */

export { runQuery } from './sdk-wrapper.js';
export { runPipeline } from './stage-runner.js';
export { writeOutput } from './output-writer.js';
export { validateEnvironment } from './env-validator.js';
export { parseCliArgs } from './cli-parser.js';
export type { ParsedArgs } from './cli-parser.js';
export { logger } from './logger.js';
export { buildPersonaContext } from './persona-base.js';
export type {
  AgentConfig,
  StageConfig,
  StageContext,
  OutputConfig,
  OutputMetadata,
  PersonaBase,
  PipelineResult,
  QueryOptions,
} from './types.js';
