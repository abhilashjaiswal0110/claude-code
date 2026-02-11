import Anthropic from '@anthropic-ai/sdk';
import type { AgentInfo, StreamEvent } from '../types.js';

export interface AdapterContext {
  topic: string;
  mode: string;
  additionalContext?: string;
  files?: string[];
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929';

export abstract class BaseAdapter {
  abstract readonly agentInfo: AgentInfo;

  abstract processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<string>;

  /**
   * Call Claude API with streaming and emit content events.
   * Pass an AbortSignal to support cancellation via the /stop endpoint.
   */
  protected async callClaudeStream(
    systemPrompt: string,
    userMessage: string,
    onEvent: (event: StreamEvent) => void,
    maxTokens = 4096,
    signal?: AbortSignal
  ): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      const msg = 'ANTHROPIC_API_KEY is not set. Configure it in the api-server environment before using AI agents.';
      this.emitError(onEvent, msg);
      throw new Error(msg);
    }

    let fullContent = '';

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }, { signal });

    for await (const event of stream) {
      if (signal?.aborted) break;
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const chunk = event.delta.text;
        fullContent += chunk;
        this.emitContent(onEvent, chunk);
      }
    }

    return fullContent;
  }

  protected emitContent(onEvent: (event: StreamEvent) => void, content: string): void {
    onEvent({ type: 'content', content });
  }

  protected emitThinking(onEvent: (event: StreamEvent) => void, content: string): void {
    onEvent({ type: 'thinking', content });
  }

  protected emitToolCall(
    onEvent: (event: StreamEvent) => void,
    tool: string,
    status: 'running' | 'completed' | 'error'
  ): void {
    onEvent({ type: 'tool_call', tool, status });
  }

  protected emitStage(
    onEvent: (event: StreamEvent) => void,
    index: number,
    name: string,
    status: string
  ): void {
    onEvent({ type: 'stage', index, name, status });
  }

  protected emitError(onEvent: (event: StreamEvent) => void, message: string): void {
    onEvent({ type: 'error', message });
  }

  protected emitDone(onEvent: (event: StreamEvent) => void): void {
    onEvent({ type: 'done' });
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
