import clsx from 'clsx';
import type { Agent } from '../config/agents';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  'agent-hr': {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600',
    text: 'text-violet-600 dark:text-violet-400',
  },
  'agent-it': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  'agent-marketing': {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600',
    text: 'text-orange-600 dark:text-orange-400',
  },
  'agent-recruitment': {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600',
    text: 'text-pink-600 dark:text-pink-400',
  },
  'agent-presales': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  'agent-learning': {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  'agent-linkedin': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
  },
  'agent-sustainability': {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600',
    text: 'text-green-600 dark:text-green-400',
  },
  'agent-cloud': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const colors = colorClasses[agent.color] || colorClasses['agent-hr'];

  return (
    <button
      onClick={() => onSelect(agent)}
      className={clsx(
        'group relative flex flex-col items-start rounded-xl border-2 p-5 text-left transition-all',
        'hover:shadow-lg hover:-translate-y-1',
        colors.bg,
        colors.border
      )}
    >
      {/* Icon */}
      <div className="mb-3 text-3xl">{agent.icon}</div>

      {/* Name & Category */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {agent.name}
        </h3>
        <span className={clsx('text-xs font-medium', colors.text)}>
          {agent.category}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
        {agent.description}
      </p>

      {/* Modes */}
      <div className="mt-auto flex flex-wrap gap-1">
        {agent.modes.slice(0, 3).map((mode) => (
          <span
            key={mode.id}
            className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800/60 dark:text-gray-400"
          >
            {mode.label}
          </span>
        ))}
        {agent.modes.length > 3 && (
          <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800/60">
            +{agent.modes.length - 3}
          </span>
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <svg className={clsx('h-5 w-5', colors.text)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
