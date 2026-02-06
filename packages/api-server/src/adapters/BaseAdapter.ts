import type { AgentInfo, StreamEvent } from '../types.js';

export interface AdapterContext {
  topic: string;
  mode: string;
  additionalContext?: string;
  files?: string[];
}

export abstract class BaseAdapter {
  abstract readonly agentInfo: AgentInfo;

  abstract processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string>;

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

  protected async simulateStreaming(
    text: string,
    onEvent: (event: StreamEvent) => void,
    chunkSize: number = 20,
    delayMs: number = 30
  ): Promise<void> {
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, Math.min(i + chunkSize, text.length));
      this.emitContent(onEvent, chunk);
      await this.delay(delayMs);
    }
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
