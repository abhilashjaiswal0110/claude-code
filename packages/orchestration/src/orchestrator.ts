/**
 * Orchestrator-Workers Pattern
 *
 * Implements the orchestrator-workers pattern where a central orchestrator
 * decomposes tasks and delegates to specialized worker agents.
 *
 * @see https://anthropic.com/research/building-effective-agents
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { logger } from '@enterprise-agents/core';

import type {
  Task,
  TaskResult,
  WorkerDefinition,
  OrchestratorConfig,
  OrchestrationState,
} from './types.js';

/**
 * Default orchestrator configuration
 */
const DEFAULT_CONFIG: Partial<OrchestratorConfig> = {
  maxParallel: 3,
  decompositionStrategy: 'auto',
  synthesizeResults: true,
  maxTotalBudgetUsd: 10.0,
  timeout: 300000, // 5 minutes
};

/**
 * Orchestrator class
 *
 * Central coordinator that decomposes tasks and delegates to workers.
 */
export class Orchestrator {
  private config: OrchestratorConfig;
  private state: OrchestrationState;
  private workers: Map<string, WorkerDefinition>;

  constructor(config: OrchestratorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as OrchestratorConfig;
    this.workers = new Map(config.workers.map(w => [w.id, w]));
    this.state = this.createInitialState();
  }

  /**
   * Execute a complex task using orchestrator-workers pattern
   *
   * @param task - The main task to execute
   * @returns Final result after synthesis
   */
  async execute(task: string): Promise<{
    success: boolean;
    result: string;
    state: OrchestrationState;
  }> {
    logger.info('Orchestrator starting execution');
    this.state = this.createInitialState();
    this.state.phase = 'decomposing';

    try {
      // Phase 1: Decompose task into subtasks
      const subtasks = await this.decomposeTask(task);
      this.state.tasks = subtasks;
      this.state.pending = subtasks.map(t => t.id);

      logger.info(`Decomposed into ${subtasks.length} subtasks`);

      // Phase 2: Execute subtasks
      this.state.phase = 'executing';
      await this.executeSubtasks();

      // Check for failures
      if (this.state.failed.length > 0) {
        const failedCount = this.state.failed.length;
        const successCount = this.state.results.filter(r => r.success).length;

        if (successCount === 0) {
          this.state.phase = 'failed';
          return {
            success: false,
            result: `All ${failedCount} subtasks failed`,
            state: this.state,
          };
        }

        logger.warning(`${failedCount} subtasks failed, continuing with partial results`);
      }

      // Phase 3: Synthesize results
      this.state.phase = 'synthesizing';
      const finalResult = await this.synthesizeResults(task);

      this.state.phase = 'complete';
      this.state.completedAt = new Date().toISOString();

      return {
        success: true,
        result: finalResult,
        state: this.state,
      };
    } catch (err) {
      this.state.phase = 'failed';
      return {
        success: false,
        result: `Orchestration failed: ${err instanceof Error ? err.message : String(err)}`,
        state: this.state,
      };
    }
  }

  /**
   * Decompose a task into subtasks
   */
  private async decomposeTask(task: string): Promise<Task[]> {
    const workerDescriptions = Array.from(this.workers.values())
      .map(w => `- ${w.name} (${w.id}): ${w.capabilities.join(', ')}`)
      .join('\n');

    const decompositionPrompt = `You are an orchestrator that breaks down complex tasks into subtasks for specialized workers.

Available Workers:
${workerDescriptions}

Task to decompose:
${task}

Analyze the task and decompose it into subtasks that can be delegated to the available workers.
For each subtask, specify:
1. A unique ID (subtask-1, subtask-2, etc.)
2. A clear description of what needs to be done
3. Which worker should handle it (by ID)
4. Any dependencies on other subtasks (by ID)

Format your response as JSON:
{
  "subtasks": [
    {
      "id": "subtask-1",
      "description": "...",
      "workerId": "worker-id",
      "dependencies": []
    }
  ]
}`;

    let decompositionResult = '';

    for await (const message of query({
      prompt: decompositionPrompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: this.config.systemPrompt,
        },
        allowedTools: [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 5,
        maxBudgetUsd: 0.5,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        decompositionResult = message.result as string;
      }
    }

    // Parse subtasks from response
    return this.parseSubtasks(decompositionResult);
  }

  /**
   * Parse subtasks from decomposition result
   */
  private parseSubtasks(result: string): Task[] {
    try {
      // Extract JSON from response - use safer approach to avoid ReDoS
      const startIdx = result.indexOf('{');
      const endIdx = result.lastIndexOf('}');
      const jsonMatch = startIdx !== -1 && endIdx > startIdx && result.includes('"subtasks"')
        ? [result.slice(startIdx, endIdx + 1)]
        : null;
      if (!jsonMatch) {
        throw new Error('No subtasks JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const subtasks: Task[] = [];

      for (const item of parsed.subtasks || []) {
        subtasks.push({
          id: item.id || `subtask-${subtasks.length + 1}`,
          description: item.description,
          input: { workerId: item.workerId, task: item.description },
          dependencies: item.dependencies || [],
        });
      }

      return subtasks;
    } catch (err) {
      // Fallback: create a single task
      logger.warning('Failed to parse subtasks, creating single task');
      return [{
        id: 'subtask-1',
        description: result,
        input: { task: result },
        dependencies: [],
      }];
    }
  }

  /**
   * Execute all subtasks with worker delegation
   */
  private async executeSubtasks(): Promise<void> {
    const maxParallel = this.config.maxParallel || 3;

    while (this.state.pending.length > 0 || this.state.executing.length > 0) {
      // Start new tasks if we have capacity
      while (
        this.state.executing.length < maxParallel &&
        this.state.pending.length > 0
      ) {
        const nextTaskId = this.getNextExecutableTask();
        if (!nextTaskId) break;

        // Move to executing
        this.state.pending = this.state.pending.filter(id => id !== nextTaskId);
        this.state.executing.push(nextTaskId);

        // Execute asynchronously with error handling
        const task = this.state.tasks.find(t => t.id === nextTaskId)!;
        this.executeWorkerTask(task)
          .then(result => {
            this.state.executing = this.state.executing.filter(id => id !== nextTaskId);
            this.state.results.push(result);

            if (!result.success) {
              this.state.failed.push(nextTaskId);
            }
          })
          .catch(error => {
            // Ensure task is removed from executing on error
            this.state.executing = this.state.executing.filter(id => id !== nextTaskId);
            this.state.failed.push(nextTaskId);
            logger.error({ err: error, taskId: nextTaskId }, 'Error executing worker task');
          });
      }

      // Wait a bit before checking again
      if (this.state.executing.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Get the next task that can be executed (dependencies met)
   */
  private getNextExecutableTask(): string | null {
    const completedIds = new Set(this.state.results.map(r => r.taskId));

    for (const taskId of this.state.pending) {
      const task = this.state.tasks.find(t => t.id === taskId);
      if (!task) continue;

      const depsCompleted = (task.dependencies || []).every(depId =>
        completedIds.has(depId)
      );

      if (depsCompleted) {
        return taskId;
      }
    }

    return null;
  }

  /**
   * Execute a single task with the appropriate worker
   */
  private async executeWorkerTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();
    const input = task.input as { workerId?: string; task: string };

    // Get worker
    const worker = input.workerId
      ? this.workers.get(input.workerId)
      : this.selectBestWorker(task.description);

    if (!worker) {
      return {
        taskId: task.id,
        success: false,
        error: 'No suitable worker found',
        durationMs: Date.now() - startTime,
        attempts: 1,
      };
    }

    logger.info(`Worker ${worker.id} executing: ${task.description.slice(0, 50)}...`);

    try {
      let result = '';

      for await (const message of query({
        prompt: `Task: ${task.description}

Execute this task to the best of your abilities.`,
        options: {
          systemPrompt: {
            type: 'preset',
            preset: 'claude_code',
            append: worker.systemPrompt,
          },
          allowedTools: worker.allowedTools,
          permissionMode: 'bypassPermissions',
          allowDangerouslySkipPermissions: true,
          maxTurns: worker.maxTurns || 10,
          maxBudgetUsd: worker.maxBudgetUsd || 1.0,
        },
      })) {
        if ('result' in message && message.type === 'result') {
          result = message.result as string;
        }
      }

      return {
        taskId: task.id,
        success: true,
        output: result,
        durationMs: Date.now() - startTime,
        attempts: 1,
        workerId: worker.id,
      };
    } catch (err) {
      return {
        taskId: task.id,
        success: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startTime,
        attempts: 1,
        workerId: worker.id,
      };
    }
  }

  /**
   * Select the best worker for a task based on capabilities
   */
  private selectBestWorker(taskDescription: string): WorkerDefinition | undefined {
    const taskLower = taskDescription.toLowerCase();

    // Simple keyword matching
    for (const worker of this.workers.values()) {
      for (const capability of worker.capabilities) {
        if (taskLower.includes(capability.toLowerCase())) {
          return worker;
        }
      }
    }

    // Return first worker as fallback
    return this.workers.values().next().value;
  }

  /**
   * Synthesize results from all completed subtasks
   */
  private async synthesizeResults(originalTask: string): Promise<string> {
    if (!this.config.synthesizeResults) {
      // Just concatenate results
      return this.state.results
        .filter(r => r.success)
        .map(r => `## ${r.taskId}\n${r.output}`)
        .join('\n\n');
    }

    const successfulResults = this.state.results
      .filter(r => r.success)
      .map(r => `### ${r.taskId}\n${r.output}`)
      .join('\n\n');

    const synthesisPrompt = this.config.synthesisPrompt || `You are synthesizing results from multiple workers into a coherent final response.

Original Task:
${originalTask}

Worker Results:
${successfulResults}

Synthesize these results into a comprehensive, well-organized response that fully addresses the original task.
Ensure the response is coherent and eliminates any redundancy.`;

    let synthesizedResult = '';

    for await (const message of query({
      prompt: synthesisPrompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: this.config.systemPrompt,
        },
        allowedTools: [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 5,
        maxBudgetUsd: 0.5,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        synthesizedResult = message.result as string;
      }
    }

    return synthesizedResult;
  }

  /**
   * Create initial orchestration state
   */
  private createInitialState(): OrchestrationState {
    return {
      phase: 'decomposing',
      tasks: [],
      results: [],
      executing: [],
      pending: [],
      failed: [],
      startedAt: new Date().toISOString(),
    };
  }

  /**
   * Get current orchestration state
   */
  getState(): OrchestrationState {
    return { ...this.state };
  }
}

/**
 * Create an orchestrator with common enterprise workers
 */
export function createEnterpriseOrchestrator(
  additionalWorkers: WorkerDefinition[] = []
): Orchestrator {
  const defaultWorkers: WorkerDefinition[] = [
    {
      id: 'researcher',
      name: 'Research Specialist',
      capabilities: ['research', 'analysis', 'data gathering', 'fact-checking'],
      systemPrompt: 'You are a research specialist who gathers and analyzes information thoroughly.',
      allowedTools: ['WebSearch', 'Read'],
      maxTurns: 15,
      maxBudgetUsd: 2.0,
    },
    {
      id: 'writer',
      name: 'Content Writer',
      capabilities: ['writing', 'documentation', 'content creation', 'editing'],
      systemPrompt: 'You are a professional content writer who creates clear, engaging content.',
      allowedTools: ['Read'],
      maxTurns: 10,
      maxBudgetUsd: 1.0,
    },
    {
      id: 'analyst',
      name: 'Data Analyst',
      capabilities: ['data analysis', 'statistics', 'metrics', 'reporting'],
      systemPrompt: 'You are a data analyst who provides insightful analysis with supporting evidence.',
      allowedTools: ['Read', 'Glob', 'Grep'],
      maxTurns: 10,
      maxBudgetUsd: 1.5,
    },
    {
      id: 'developer',
      name: 'Software Developer',
      capabilities: ['coding', 'development', 'programming', 'technical'],
      systemPrompt: 'You are a skilled software developer who writes clean, efficient code.',
      allowedTools: ['Read', 'Glob', 'Grep', 'Write', 'Edit'],
      maxTurns: 15,
      maxBudgetUsd: 2.0,
    },
  ];

  return new Orchestrator({
    systemPrompt: `You are an enterprise orchestrator that coordinates complex tasks by delegating to specialized workers.
Your role is to:
1. Break down complex tasks into manageable subtasks
2. Assign subtasks to the most appropriate workers
3. Synthesize results into a coherent final response`,
    workers: [...defaultWorkers, ...additionalWorkers],
  });
}
