import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { PipelineStage } from '../stores/chatStore';

interface PipelineProgressProps {
  stages: PipelineStage[];
  currentStage: number;
}

export function PipelineProgress({ stages, currentStage }: PipelineProgressProps) {
  if (stages.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        Pipeline Progress
      </h3>

      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center gap-3">
            {/* Status Icon */}
            <div
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full',
                stage.status === 'completed' && 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                stage.status === 'running' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                stage.status === 'error' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                stage.status === 'pending' && 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              )}
            >
              {stage.status === 'completed' && <Check className="h-3.5 w-3.5" />}
              {stage.status === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {stage.status === 'error' && <AlertCircle className="h-3.5 w-3.5" />}
              {stage.status === 'pending' && <Circle className="h-3.5 w-3.5" />}
            </div>

            {/* Stage Name */}
            <span
              className={clsx(
                'text-sm',
                stage.status === 'completed' && 'text-green-700 dark:text-green-400',
                stage.status === 'running' && 'font-medium text-blue-700 dark:text-blue-400',
                stage.status === 'error' && 'text-red-700 dark:text-red-400',
                stage.status === 'pending' && 'text-gray-500 dark:text-gray-400'
              )}
            >
              {stage.name}
            </span>

            {/* Progress line */}
            {index < stages.length - 1 && (
              <div className="flex-1">
                <div
                  className={clsx(
                    'h-0.5 rounded-full',
                    index < currentStage
                      ? 'bg-green-400 dark:bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
