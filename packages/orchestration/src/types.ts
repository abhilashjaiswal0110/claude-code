/**
 * Orchestration Pattern Type Definitions
 *
 * Types for agent orchestration workflows including:
 * - Orchestrator-Workers
 * - Evaluator-Optimizer
 * - Prompt Chaining
 * - Routing
 *
 * @see https://anthropic.com/research/building-effective-agents
 */

/**
 * Base task definition
 */
export interface Task {
  /** Unique task identifier */
  id: string;

  /** Task description */
  description: string;

  /** Task input data */
  input: unknown;

  /** Expected output type */
  expectedOutputType?: string;

  /** Task priority (higher = more important) */
  priority?: number;

  /** Task dependencies (IDs of tasks that must complete first) */
  dependencies?: string[];

  /** Maximum execution time in ms */
  timeout?: number;

  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier?: number;
  };
}

/**
 * Task execution result
 */
export interface TaskResult {
  /** Task ID */
  taskId: string;

  /** Whether task succeeded */
  success: boolean;

  /** Task output */
  output?: unknown;

  /** Error message if failed */
  error?: string;

  /** Execution duration in ms */
  durationMs: number;

  /** Number of attempts */
  attempts: number;

  /** Worker that executed the task */
  workerId?: string;
}

/**
 * Worker definition for orchestrator-workers pattern
 */
export interface WorkerDefinition {
  /** Unique worker identifier */
  id: string;

  /** Worker name/description */
  name: string;

  /** Worker capabilities/specialization */
  capabilities: string[];

  /** System prompt for this worker */
  systemPrompt: string;

  /** Allowed tools for this worker */
  allowedTools: string[];

  /** Maximum concurrent tasks */
  maxConcurrent?: number;

  /** Maximum turns per task */
  maxTurns?: number;

  /** Budget limit per task */
  maxBudgetUsd?: number;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  /** Orchestrator system prompt */
  systemPrompt: string;

  /** Available workers */
  workers: WorkerDefinition[];

  /** Maximum parallel workers */
  maxParallel?: number;

  /** Task decomposition strategy */
  decompositionStrategy?: 'auto' | 'sequential' | 'parallel' | 'dag';

  /** Whether to synthesize final result */
  synthesizeResults?: boolean;

  /** Synthesis prompt template */
  synthesisPrompt?: string;

  /** Maximum total budget */
  maxTotalBudgetUsd?: number;

  /** Overall timeout in ms */
  timeout?: number;
}

/**
 * Orchestration execution state
 */
export interface OrchestrationState {
  /** Current phase */
  phase: 'decomposing' | 'executing' | 'synthesizing' | 'complete' | 'failed';

  /** All tasks */
  tasks: Task[];

  /** Completed task results */
  results: TaskResult[];

  /** Currently executing task IDs */
  executing: string[];

  /** Pending task IDs */
  pending: string[];

  /** Failed task IDs */
  failed: string[];

  /** Start timestamp */
  startedAt: string;

  /** Completion timestamp */
  completedAt?: string;

  /** Total tokens used */
  totalTokens?: number;

  /** Total cost */
  totalCost?: number;
}

/**
 * Evaluator-Optimizer configuration
 */
export interface EvaluatorOptimizerConfig {
  /** Generator system prompt */
  generatorPrompt: string;

  /** Evaluator system prompt */
  evaluatorPrompt: string;

  /** Evaluation criteria */
  criteria: EvaluationCriterion[];

  /** Minimum acceptable score (0-1) */
  minScore?: number;

  /** Maximum optimization iterations */
  maxIterations?: number;

  /** Whether to include feedback in optimization */
  includeFeedback?: boolean;

  /** Allowed tools for generator */
  generatorTools?: string[];

  /** Allowed tools for evaluator */
  evaluatorTools?: string[];
}

/**
 * Evaluation criterion
 */
export interface EvaluationCriterion {
  /** Criterion name */
  name: string;

  /** Criterion description */
  description: string;

  /** Weight for scoring (0-1) */
  weight: number;

  /** Minimum acceptable value */
  minValue?: number;
}

/**
 * Evaluation result
 */
export interface EvaluationResult {
  /** Overall score (0-1) */
  score: number;

  /** Per-criterion scores */
  criterionScores: Record<string, number>;

  /** Feedback for improvement */
  feedback: string;

  /** Whether result passes minimum threshold */
  passes: boolean;

  /** Specific improvement suggestions */
  suggestions?: string[];
}

/**
 * Optimizer iteration result
 */
export interface OptimizationIteration {
  /** Iteration number */
  iteration: number;

  /** Generated content */
  content: string;

  /** Evaluation result */
  evaluation: EvaluationResult;

  /** Duration in ms */
  durationMs: number;
}

/**
 * Prompt chain step
 */
export interface ChainStep {
  /** Step name */
  name: string;

  /** Step prompt template */
  promptTemplate: string;

  /** System prompt for this step */
  systemPrompt?: string;

  /** Allowed tools */
  allowedTools?: string[];

  /** Transform function for input */
  transformInput?: (input: unknown, previousResults: Record<string, unknown>) => unknown;

  /** Transform function for output */
  transformOutput?: (output: string) => unknown;

  /** Maximum turns */
  maxTurns?: number;

  /** Condition for executing this step */
  condition?: (previousResults: Record<string, unknown>) => boolean;
}

/**
 * Prompt chain configuration
 */
export interface PromptChainConfig {
  /** Chain steps */
  steps: ChainStep[];

  /** Whether to stop on first error */
  stopOnError?: boolean;

  /** Overall timeout */
  timeout?: number;

  /** Maximum total budget */
  maxBudgetUsd?: number;
}

/**
 * Chain execution result
 */
export interface ChainResult {
  /** Whether chain completed successfully */
  success: boolean;

  /** Results from each step */
  stepResults: Record<string, unknown>;

  /** Final output */
  finalOutput: unknown;

  /** Steps that were skipped */
  skippedSteps: string[];

  /** Error if failed */
  error?: string;

  /** Total duration */
  totalDurationMs: number;
}

/**
 * Router configuration
 */
export interface RouterConfig {
  /** Routes with their conditions and handlers */
  routes: Route[];

  /** Default route if no match */
  defaultRoute?: RouteHandler;

  /** Routing strategy */
  strategy?: 'first-match' | 'best-match' | 'llm-classify';

  /** System prompt for LLM classification */
  classificationPrompt?: string;
}

/**
 * Route definition
 */
export interface Route {
  /** Route name */
  name: string;

  /** Description for LLM classification */
  description: string;

  /** Condition function for pattern matching */
  condition?: (input: string) => boolean;

  /** Keywords for simple matching */
  keywords?: string[];

  /** Handler for this route */
  handler: RouteHandler;
}

/**
 * Route handler
 */
export interface RouteHandler {
  /** Handler name */
  name: string;

  /** System prompt */
  systemPrompt: string;

  /** Allowed tools */
  allowedTools?: string[];

  /** Maximum turns */
  maxTurns?: number;

  /** Budget limit */
  maxBudgetUsd?: number;
}

/**
 * Routing result
 */
export interface RoutingResult {
  /** Selected route name */
  routeName: string;

  /** Confidence score for selection */
  confidence?: number;

  /** Handler output */
  output: string;

  /** Duration */
  durationMs: number;
}
