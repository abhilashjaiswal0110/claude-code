import { Clock, Zap, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { Agent } from '../config/agents';
import { useChatStore, type Session } from '../stores/chatStore';
import { PipelineProgress } from './PipelineProgress';

interface SidePanelProps {
  agent: Agent;
  onQuickAction: (action: string) => void;
}

function SessionHistoryItem({
  session,
  isActive,
  onLoad,
  onDelete,
}: {
  session: Session;
  isActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const firstMessage = session.messages.find((m) => m.role === 'user');
  const preview = firstMessage?.content.slice(0, 50) || 'Empty session';

  return (
    <div
      className={clsx(
        'group flex items-start gap-2 rounded-lg border p-2 transition-colors',
        isActive
          ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30'
          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      <button onClick={onLoad} className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-900 line-clamp-1 dark:text-white">
          {preview}...
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(session.updatedAt).toLocaleDateString()}
        </p>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-gray-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function SidePanel({ agent, onQuickAction }: SidePanelProps) {
  const {
    sessionId,
    pipelineStages,
    currentStage,
    sessionHistory,
    loadSession,
    deleteSession,
  } = useChatStore();

  const agentSessions = sessionHistory.filter((s) => s.agentId === agent.id);

  return (
    <aside className="flex h-full w-80 flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Agent Info */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{agent.icon}</div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {agent.name}
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {agent.category}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {agent.description}
        </p>

        {/* Mode Badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          {agent.modes.map((mode) => (
            <span
              key={mode.id}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              title={mode.description}
            >
              {mode.label}
            </span>
          ))}
        </div>
      </div>

      {/* Pipeline Progress */}
      {pipelineStages.length > 0 && (
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <PipelineProgress stages={pipelineStages} currentStage={currentStage} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <Zap className="h-4 w-4 text-yellow-500" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          {agent.quickActions.map((action) => (
            <button
              key={action}
              onClick={() => onQuickAction(action)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Session History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <Clock className="h-4 w-4 text-gray-500" />
          Session History
        </h3>

        {agentSessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No previous sessions with this agent.
          </p>
        ) : (
          <div className="space-y-1">
            {agentSessions.slice(0, 10).map((session) => (
              <SessionHistoryItem
                key={session.id}
                session={session}
                isActive={session.id === sessionId}
                onLoad={() => loadSession(session.id)}
                onDelete={() => deleteSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
