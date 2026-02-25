/**
 * @enterprise-agents/core
 *
 * Shared SDK utilities for enterprise AI agents.
 * Enhanced with patterns from Anthropic claude-cookbooks.
 *
 * @see https://github.com/anthropics/claude-cookbooks
 */

// Core SDK utilities
export { runQuery } from './sdk-wrapper.js';
export { runPipeline } from './stage-runner.js';
export { writeOutput } from './output-writer.js';
export { validateEnvironment } from './env-validator.js';
export { parseCliArgs } from './cli-parser.js';
export type { ParsedArgs } from './cli-parser.js';
export { logger } from './logger.js';
export { buildPersonaContext } from './persona-base.js';

// Memory Tool System
export {
  MemoryToolHandler,
  createMemoryTool,
  type MemoryCommand,
  type MemoryParams,
  type MemoryResult,
} from './memory-tool.js';

// Extended Thinking Support
export {
  runExtendedThinking,
  runStructuredAnalysis,
  runProblemSolving,
  runCodeReview,
  type ExtendedThinkingConfig,
  type ExtendedThinkingResult,
} from './extended-thinking.js';

// Agent Visualization Utilities
export {
  resetActivityContext,
  getActivityContext,
  getActivityText,
  printActivity,
  trackToolCall,
  parseResponseBlocks,
  displayAgentResponse,
  formatTerminalResponse,
  createProgressBar,
  formatTokenUsage,
  generateActivitySummary,
  createActivityHandler,
} from './visualization.js';

// Core Types
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
