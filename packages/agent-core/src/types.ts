/**
 * Base type definitions for enterprise AI agents
 */

export interface AgentConfig {
  name: string;
  description: string;
  version: string;
  defaultMode: string;
  modes: string[];
}

export interface StageConfig {
  name: string;
  description: string;
  systemPromptAppend: string;
  allowedTools: string[];
  maxTurns: number;
  maxBudgetUsd?: number;
  buildPrompt: (context: StageContext) => string;
}

export interface StageContext {
  topic: string;
  mode: string;
  additionalContext?: string;
  previousResults: Record<string, string>;
}

export interface OutputConfig {
  directory: string;
  filenamePrefix: string;
  includeJson: boolean;
  formatOutput: (topic: string, rawContent: string, metadata: OutputMetadata) => string;
}

export interface OutputMetadata {
  agentName: string;
  mode: string;
  generatedAt: string;
  topic: string;
  [key: string]: string;
}

export interface PersonaBase {
  name: string;
  title: string;
  company: string;
  expertise: string[];
  voiceGuidelines: string[];
}

export interface PipelineResult {
  topic: string;
  mode: string;
  stageResults: Record<string, string>;
  finalContent: string;
  outputPath: string;
  generatedAt: string;
}

export interface QueryOptions {
  systemPromptAppend: string;
  allowedTools: string[];
  maxTurns: number;
  maxBudgetUsd?: number;
}
