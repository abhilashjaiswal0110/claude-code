import { useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';

interface StreamOptions {
  onThinking?: (content: string) => void;
  onToolCall?: (tool: string, status: 'running' | 'completed' | 'error') => void;
  onStageUpdate?: (stage: number, name: string, status: string) => void;
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
}

export function useStream() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      sessionId: string,
      content: string,
      mode: string,
      files: string[] = [],
      options: StreamOptions = {}
    ) => {
      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Get fresh store state
      const store = useChatStore.getState();
      store.setIsStreaming(true);
      store.setConnectionStatus('connected');

      // Add user message
      store.addMessage({ role: 'user', content });

      // Add placeholder assistant message
      store.addMessage({
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      // Get the assistant message ID (it's the last message in the array)
      const messagesAfter = useChatStore.getState().messages;
      const assistantMessageId = messagesAfter[messagesAfter.length - 1]?.id;

      let fullContent = '';
      let thinking = '';

      try {
        const response = await fetch(`/api/chat/${sessionId}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            mode,
            files,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                continue;
              }

              try {
                const event = JSON.parse(data);

                switch (event.type) {
                  case 'content':
                    fullContent += event.content;
                    useChatStore.getState().updateMessage(assistantMessageId, { content: fullContent });
                    break;

                  case 'thinking':
                    thinking += event.content;
                    useChatStore.getState().updateMessage(assistantMessageId, { thinking });
                    options.onThinking?.(thinking);
                    break;

                  case 'tool_call':
                    options.onToolCall?.(event.tool, event.status);
                    break;

                  case 'stage':
                    options.onStageUpdate?.(event.index, event.name, event.status);
                    break;

                  case 'error':
                    throw new Error(event.message);

                  case 'done':
                    useChatStore.getState().updateMessage(assistantMessageId, {
                      content: fullContent,
                      thinking,
                      isStreaming: false,
                    });
                    options.onComplete?.(fullContent);
                    break;
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
                if (!(e instanceof SyntaxError)) {
                  throw e;
                }
              }
            }
          }
        }

        // Ensure final state is set
        useChatStore.getState().updateMessage(assistantMessageId, {
          content: fullContent || 'Response completed.',
          thinking,
          isStreaming: false,
        });

        if (fullContent) {
          options.onComplete?.(fullContent);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // User cancelled - update the message to show it was stopped
          useChatStore.getState().updateMessage(assistantMessageId, {
            content: fullContent || 'Generation stopped.',
            isStreaming: false,
          });
          return;
        }

        console.error('Stream error:', error);
        useChatStore.getState().setConnectionStatus('disconnected');
        options.onError?.(error as Error);

        // Update message with error
        useChatStore.getState().updateMessage(assistantMessageId, {
          content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}. Please check if the API server is running.`,
          isStreaming: false,
        });
      } finally {
        useChatStore.getState().setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      useChatStore.getState().setIsStreaming(false);
    }
  }, []);

  return {
    sendMessage,
    stopStream,
  };
}
