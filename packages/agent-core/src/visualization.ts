/**
 * Agent Visualization Utilities
 *
 * Shared visualization utilities for consistent agent response display
 * across all agents. Ported from Anthropic's claude-cookbooks with
 * TypeScript enhancements.
 *
 * @module visualization
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/claude_agent_sdk/utils
 */

import { logger } from './logger.js';

/**
 * Activity context for tracking agent operations
 */
interface ActivityContext {
  toolCalls: number;
  startTime: number;
  lastActivity: string;
  activities: ActivityEntry[];
}

/**
 * Individual activity entry
 */
interface ActivityEntry {
  timestamp: number;
  type: 'thinking' | 'tool_use' | 'tool_result' | 'response';
  description: string;
  duration?: number;
}

/**
 * Message type from agent response stream
 */
interface AgentMessage {
  type?: string;
  message?: {
    content?: Array<{
      type: string;
      text?: string;
      name?: string;
      input?: unknown;
    }>;
  };
  result?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

/**
 * Formatted response block for display
 */
interface ResponseBlock {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'text' | 'result';
  content: string;
  metadata?: Record<string, unknown>;
}

// Global activity context
let activityContext: ActivityContext = {
  toolCalls: 0,
  startTime: Date.now(),
  lastActivity: '',
  activities: [],
};

/**
 * Reset the activity context for a new conversation
 */
export function resetActivityContext(): void {
  activityContext = {
    toolCalls: 0,
    startTime: Date.now(),
    lastActivity: '',
    activities: [],
  };
}

/**
 * Get the current activity context
 */
export function getActivityContext(): ActivityContext {
  return { ...activityContext };
}

/**
 * Extract activity text from a message for logging/monitoring
 *
 * @param msg - A message object from the agent response stream
 * @returns A formatted activity string, or null if not applicable
 */
export function getActivityText(msg: AgentMessage): string | null {
  try {
    const className = msg.constructor?.name || '';

    if (className.includes('Assistant') || msg.type === 'assistant') {
      if (msg.message?.content) {
        const content = msg.message.content;
        const firstContent = Array.isArray(content) ? content[0] : content;

        if (firstContent && 'name' in firstContent && firstContent.name) {
          return `Using: ${firstContent.name}()`;
        }
      }
      return 'Thinking...';
    }

    if (className.includes('User') || msg.type === 'user') {
      return 'Tool completed';
    }

    if (msg.type === 'result') {
      return 'Response complete';
    }
  } catch {
    // Ignore extraction errors
  }

  return null;
}

/**
 * Print activity to console with formatting
 *
 * @param msg - Message from agent response stream
 */
export function printActivity(msg: AgentMessage): void {
  const activity = getActivityText(msg);
  if (activity) {
    const elapsed = Math.round((Date.now() - activityContext.startTime) / 1000);
    const icon = getActivityIcon(activity);
    logger.info(`${icon} [${elapsed}s] ${activity}`);
    activityContext.lastActivity = activity;
  }
}

/**
 * Get an icon for the activity type
 */
function getActivityIcon(activity: string): string {
  if (activity.includes('Using:')) return '\u{1F527}'; // wrench
  if (activity.includes('Thinking')) return '\u{1F914}'; // thinking face
  if (activity.includes('completed')) return '\u2705'; // check mark
  if (activity.includes('complete')) return '\u{1F389}'; // party popper
  return '\u25B6'; // play button
}

/**
 * Track a tool call in the activity context
 *
 * @param toolName - Name of the tool being called
 * @param input - Tool input parameters
 */
export function trackToolCall(toolName: string, input?: unknown): void {
  activityContext.toolCalls++;
  activityContext.activities.push({
    timestamp: Date.now(),
    type: 'tool_use',
    description: `${toolName}(${input ? JSON.stringify(input).slice(0, 50) : ''})`,
  });
}

/**
 * Parse agent messages into structured response blocks
 *
 * @param messages - Array of messages from agent response stream
 * @returns Array of formatted response blocks
 */
export function parseResponseBlocks(messages: AgentMessage[]): ResponseBlock[] {
  const blocks: ResponseBlock[] = [];

  for (const msg of messages) {
    const className = msg.constructor?.name || '';

    // Assistant messages
    if (className.includes('Assistant') || msg.type === 'assistant') {
      if (msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'text' && block.text) {
            // Check for thinking block markers
            const thinkingMatch = block.text.match(/<thinking>([\s\S]*?)<\/thinking>/);
            if (thinkingMatch) {
              blocks.push({
                type: 'thinking',
                content: thinkingMatch[1].trim(),
              });
              // Add remaining text if any
              const remaining = block.text.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
              if (remaining) {
                blocks.push({
                  type: 'text',
                  content: remaining,
                });
              }
            } else {
              blocks.push({
                type: 'text',
                content: block.text,
              });
            }
          } else if (block.type === 'tool_use' && block.name) {
            blocks.push({
              type: 'tool_call',
              content: block.name,
              metadata: { input: block.input },
            });
          }
        }
      }
    }

    // Result message
    if (msg.type === 'result' && msg.result) {
      blocks.push({
        type: 'result',
        content: msg.result,
      });
    }
  }

  return blocks;
}

/**
 * Display agent response with formatting
 *
 * @param messages - Array of messages from agent response stream
 * @param options - Display options
 */
export function displayAgentResponse(
  messages: AgentMessage[],
  options: {
    showThinking?: boolean;
    showToolCalls?: boolean;
    maxContentLength?: number;
  } = {}
): void {
  const {
    showThinking = false,
    showToolCalls = true,
    maxContentLength = 2000,
  } = options;

  const blocks = parseResponseBlocks(messages);

  console.log('\n' + '='.repeat(60));
  console.log('Agent Response');
  console.log('='.repeat(60) + '\n');

  for (const block of blocks) {
    switch (block.type) {
      case 'thinking':
        if (showThinking) {
          console.log('\u{1F914} THINKING:');
          console.log('-'.repeat(40));
          console.log(truncateText(block.content, maxContentLength));
          console.log();
        }
        break;

      case 'tool_call':
        if (showToolCalls) {
          console.log(`\u{1F527} TOOL: ${block.content}`);
          if (block.metadata?.input) {
            const inputStr = JSON.stringify(block.metadata.input, null, 2);
            console.log('   Input:', truncateText(inputStr, 200));
          }
          console.log();
        }
        break;

      case 'text':
        console.log(block.content);
        console.log();
        break;

      case 'result':
        console.log('-'.repeat(60));
        console.log('\u{1F389} FINAL RESULT:');
        console.log('-'.repeat(60));
        console.log(truncateText(block.content, maxContentLength));
        break;
    }
  }

  // Summary
  const elapsed = Math.round((Date.now() - activityContext.startTime) / 1000);
  console.log('\n' + '-'.repeat(60));
  console.log(`Completed in ${elapsed}s with ${activityContext.toolCalls} tool calls`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format a response for terminal display with colors
 *
 * @param response - The response text to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatTerminalResponse(
  response: string,
  options: {
    width?: number;
    indent?: number;
    highlight?: string[];
  } = {}
): string {
  const { width = 80, indent = 0, highlight = [] } = options;

  const indentStr = ' '.repeat(indent);
  const lines = response.split('\n');
  const formatted: string[] = [];

  for (const line of lines) {
    // Word wrap
    if (line.length > width - indent) {
      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        if ((currentLine + word).length > width - indent) {
          formatted.push(indentStr + currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }

      if (currentLine.trim()) {
        formatted.push(indentStr + currentLine.trim());
      }
    } else {
      formatted.push(indentStr + line);
    }
  }

  let result = formatted.join('\n');

  // Apply highlights (simple approach without ANSI codes for broad compatibility)
  for (const term of highlight) {
    result = result.replace(new RegExp(term, 'gi'), `**${term}**`);
  }

  return result;
}

/**
 * Create a progress bar string
 *
 * @param current - Current progress value
 * @param total - Total value
 * @param width - Width of the progress bar
 * @returns Formatted progress bar string
 */
export function createProgressBar(current: number, total: number, width: number = 40): string {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
  return `[${bar}] ${percentage}%`;
}

/**
 * Format token usage statistics
 *
 * @param usage - Token usage object
 * @returns Formatted string
 */
export function formatTokenUsage(usage: {
  inputTokens?: number;
  outputTokens?: number;
  thinkingTokens?: number;
}): string {
  const parts: string[] = [];

  if (usage.inputTokens !== undefined) {
    parts.push(`Input: ${usage.inputTokens.toLocaleString()}`);
  }

  if (usage.outputTokens !== undefined) {
    parts.push(`Output: ${usage.outputTokens.toLocaleString()}`);
  }

  if (usage.thinkingTokens !== undefined) {
    parts.push(`Thinking: ${usage.thinkingTokens.toLocaleString()}`);
  }

  const total = (usage.inputTokens || 0) + (usage.outputTokens || 0);
  if (total > 0) {
    parts.push(`Total: ${total.toLocaleString()}`);
  }

  return parts.join(' | ');
}

/**
 * Generate a summary of agent activity
 *
 * @returns Formatted activity summary
 */
export function generateActivitySummary(): string {
  const ctx = activityContext;
  const elapsed = Math.round((Date.now() - ctx.startTime) / 1000);

  const lines: string[] = [
    'Activity Summary',
    '='.repeat(40),
    `Duration: ${elapsed}s`,
    `Tool Calls: ${ctx.toolCalls}`,
  ];

  if (ctx.activities.length > 0) {
    lines.push('', 'Activity Timeline:');
    for (const activity of ctx.activities.slice(-10)) { // Last 10 activities
      const relativeTime = Math.round((activity.timestamp - ctx.startTime) / 1000);
      lines.push(`  [${relativeTime}s] ${activity.description}`);
    }
  }

  return lines.join('\n');
}

/**
 * Create an async activity handler for streaming responses
 *
 * @param callback - Callback for each activity update
 * @returns Activity handler function
 */
export function createActivityHandler(
  callback: (activity: string, context: ActivityContext) => void | Promise<void>
): (msg: AgentMessage) => Promise<void> {
  return async (msg: AgentMessage): Promise<void> => {
    const activity = getActivityText(msg);
    if (activity) {
      activityContext.lastActivity = activity;
      await callback(activity, getActivityContext());
    }
  };
}
