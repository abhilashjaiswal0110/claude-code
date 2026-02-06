import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import clsx from 'clsx';

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:text-purple-300 dark:hover:bg-purple-900/30"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <Brain className={clsx('h-4 w-4', isStreaming && 'animate-pulse')} />
        <span>Thinking{isStreaming && '...'}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-purple-200 px-3 py-2 dark:border-purple-800">
          <pre className="whitespace-pre-wrap text-xs text-purple-800 dark:text-purple-200">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}
