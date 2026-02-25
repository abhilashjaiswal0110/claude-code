/**
 * Skill Executor
 *
 * Handles execution of skills within agent workflows,
 * including progressive disclosure and context management.
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/skills
 */

import { query } from '@anthropic-ai/claude-agent-sdk';

import type {
  LoadedSkill,
  SkillExecutionContext,
  SkillExecutionResult,
  DisclosureStage,
  GeneratedFile,
} from './types.js';
import { SkillLoader } from './skill-loader.js';

/**
 * Execution options
 */
export interface SkillExecutionOptions {
  /** Maximum tokens for skill context */
  maxContextTokens?: number;

  /** Enable progressive disclosure */
  progressiveDisclosure?: boolean;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Additional system prompt */
  systemPromptAppend?: string;

  /** Budget limit */
  maxBudgetUsd?: number;

  /** Maximum turns */
  maxTurns?: number;
}

/**
 * Default execution options
 */
const DEFAULT_OPTIONS: Required<SkillExecutionOptions> = {
  maxContextTokens: 8000,
  progressiveDisclosure: true,
  timeout: 120000, // 2 minutes
  systemPromptAppend: '',
  maxBudgetUsd: 2.0,
  maxTurns: 15,
};

/**
 * Skill Executor class
 *
 * Executes skills with proper context management and progressive disclosure.
 */
export class SkillExecutor {
  private loader: SkillLoader;
  private options: Required<SkillExecutionOptions>;

  constructor(options: SkillExecutionOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.loader = new SkillLoader();
  }

  /**
   * Execute a skill with the given prompt
   *
   * @param skill - Loaded skill to execute
   * @param prompt - User prompt/task
   * @param options - Execution options override
   * @returns Execution result
   */
  async execute(
    skill: LoadedSkill,
    prompt: string,
    options: SkillExecutionOptions = {}
  ): Promise<SkillExecutionResult> {
    const mergedOptions = { ...this.options, ...options };
    const startTime = Date.now();

    try {
      // Build skill context based on disclosure settings
      const skillContext = this.buildSkillContext(skill, mergedOptions);

      // Build system prompt with skill instructions
      const systemPrompt = this.buildSystemPrompt(skill, skillContext, mergedOptions);

      // Execute with timeout
      const result = await this.executeWithTimeout(
        prompt,
        systemPrompt,
        mergedOptions
      );

      const durationMs = Date.now() - startTime;

      return {
        success: true,
        output: result.output,
        files: result.files,
        durationMs,
        usage: result.usage,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;

      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs,
      };
    }
  }

  /**
   * Build skill context with progressive disclosure
   */
  private buildSkillContext(
    skill: LoadedSkill,
    options: Required<SkillExecutionOptions>
  ): string {
    if (!options.progressiveDisclosure) {
      // Load everything
      const parts: string[] = [skill.instructions];

      if (skill.reference) {
        parts.push('\n\n## Reference Documentation\n\n', skill.reference);
      }

      for (const [name, content] of skill.scripts) {
        parts.push(`\n\n## Script: ${name}\n\n\`\`\`\n${content}\n\`\`\``);
      }

      return parts.join('');
    }

    // Progressive disclosure: start with core instructions
    const stages = this.loader.buildDisclosureStages(skill);
    const parts: string[] = [];
    let tokenCount = 0;

    for (const stage of stages) {
      if (!stage.required && tokenCount + stage.tokens > options.maxContextTokens) {
        // Add note about available content
        parts.push(`\n\n[Additional content available: ${stage.name}]`);
        continue;
      }

      parts.push(stage.content);
      tokenCount += stage.tokens;
    }

    return parts.join('\n\n');
  }

  /**
   * Build system prompt with skill context
   */
  private buildSystemPrompt(
    skill: LoadedSkill,
    context: string,
    options: Required<SkillExecutionOptions>
  ): string {
    const parts: string[] = [
      `You are executing the "${skill.metadata.displayName}" skill.`,
      '',
      '## Skill Instructions',
      '',
      context,
    ];

    if (skill.metadata.requiredTools?.length) {
      parts.push(
        '',
        '## Required Tools',
        '',
        `This skill requires: ${skill.metadata.requiredTools.join(', ')}`
      );
    }

    if (options.systemPromptAppend) {
      parts.push('', options.systemPromptAppend);
    }

    return parts.join('\n');
  }

  /**
   * Execute query with timeout
   */
  private async executeWithTimeout(
    prompt: string,
    systemPrompt: string,
    options: Required<SkillExecutionOptions>
  ): Promise<{
    output: string;
    files?: GeneratedFile[];
    usage?: { inputTokens: number; outputTokens: number };
  }> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Skill execution timed out after ${options.timeout}ms`));
      }, options.timeout);

      try {
        let output = '';
        const files: GeneratedFile[] = [];
        let usage: { inputTokens: number; outputTokens: number } | undefined;

        for await (const message of query({
          prompt,
          options: {
            systemPrompt: {
              type: 'preset',
              preset: 'claude_code',
              append: systemPrompt,
            },
            permissionMode: 'bypassPermissions',
            allowDangerouslySkipPermissions: true,
            maxTurns: options.maxTurns,
            maxBudgetUsd: options.maxBudgetUsd,
          },
        })) {
          // Track usage
          if ('usage' in message && message.usage) {
            usage = {
              inputTokens: (message.usage as Record<string, number>).input_tokens || 0,
              outputTokens: (message.usage as Record<string, number>).output_tokens || 0,
            };
          }

          // Capture result
          if ('result' in message && message.type === 'result') {
            output = message.result as string;
          }

          // Look for generated files in tool results
          if (message.type === 'user' && 'content' in message.message) {
            const content = message.message.content;
            if (Array.isArray(content)) {
              for (const block of content) {
                if ('file_id' in block || 'output' in block) {
                  // Parse file information
                  const fileInfo = this.parseFileOutput(block);
                  if (fileInfo) {
                    files.push(fileInfo);
                  }
                }
              }
            }
          }
        }

        clearTimeout(timeoutId);
        resolve({ output, files: files.length > 0 ? files : undefined, usage });
      } catch (err) {
        clearTimeout(timeoutId);
        reject(err);
      }
    });
  }

  /**
   * Parse file output from tool result
   */
  private parseFileOutput(block: unknown): GeneratedFile | null {
    try {
      if (typeof block !== 'object' || block === null) return null;

      const obj = block as Record<string, unknown>;

      if (obj.file_id && typeof obj.file_id === 'string') {
        return {
          name: obj.filename as string || 'output',
          type: obj.type as string || 'unknown',
          content: obj.file_id, // File ID for later download
          isBase64: false,
          size: obj.size as number || 0,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Execute multiple skills in sequence
   */
  async executeSequence(
    skills: Array<{ skill: LoadedSkill; prompt: string }>,
    options: SkillExecutionOptions = {}
  ): Promise<SkillExecutionResult[]> {
    const results: SkillExecutionResult[] = [];

    for (const { skill, prompt } of skills) {
      const result = await this.execute(skill, prompt, options);
      results.push(result);

      // Stop on first failure
      if (!result.success) {
        break;
      }
    }

    return results;
  }
}

/**
 * Create a skill executor instance
 */
export function createSkillExecutor(options?: SkillExecutionOptions): SkillExecutor {
  return new SkillExecutor(options);
}
