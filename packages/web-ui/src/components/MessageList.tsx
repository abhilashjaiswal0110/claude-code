import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';
import clsx from 'clsx';
import type { Message } from '../stores/chatStore';
import { ThinkingBlock } from './ThinkingBlock';

interface MessageListProps {
  messages: Message[];
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      <div className="typing-dot h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
      <div className="typing-dot h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
      <div className="typing-dot h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={clsx(
        'animate-message-in flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div
        className={clsx(
          'flex max-w-[80%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Thinking Block (for assistant) */}
        {!isUser && message.thinking && (
          <ThinkingBlock
            content={message.thinking}
            isStreaming={message.isStreaming}
          />
        )}

        {/* Message Bubble */}
        <div
          className={clsx(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
          )}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <div
              className={clsx(
                'prose-chat',
                isUser && 'prose-invert'
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="px-2 text-xs text-gray-400 dark:text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
