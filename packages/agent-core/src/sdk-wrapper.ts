/**
 * Typed wrapper around the Claude Agent SDK query() with streaming and progress
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { logProgress } from './logger.js';
import type { QueryOptions } from './types.js';

export async function runQuery(prompt: string, options: QueryOptions): Promise<string> {
  let result = '';

  for await (const message of query({
    prompt,
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: options.systemPromptAppend,
      },
      allowedTools: options.allowedTools,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: options.maxTurns,
      ...(options.maxBudgetUsd ? { maxBudgetUsd: options.maxBudgetUsd } : {}),
    },
  })) {
    if (message.type === 'assistant' && message.message.content) {
      for (const block of message.message.content) {
        if (block.type === 'text') {
          logProgress();
        }
      }
    }
    if ('result' in message && message.type === 'result') {
      result = message.result;
    }
  }

  return result;
}
