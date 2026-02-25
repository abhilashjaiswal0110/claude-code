/**
 * @enterprise-agents/orchestration
 *
 * Agent orchestration patterns for complex workflows including:
 * - Orchestrator-Workers: Task decomposition and delegation
 * - Evaluator-Optimizer: Iterative content refinement
 * - Prompt Chaining: Sequential prompt execution
 * - Routing: Dynamic input classification and handling
 *
 * Inspired by Anthropic's "Building Effective Agents" research.
 *
 * @see https://anthropic.com/research/building-effective-agents
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/patterns/agents
 */

// Types
export type {
  Task,
  TaskResult,
  WorkerDefinition,
  OrchestratorConfig,
  OrchestrationState,
  EvaluatorOptimizerConfig,
  EvaluationResult,
  EvaluationCriterion,
  OptimizationIteration,
  ChainStep,
  PromptChainConfig,
  ChainResult,
  RouterConfig,
  Route,
  RouteHandler,
  RoutingResult,
} from './types.js';

// Orchestrator-Workers Pattern
export {
  Orchestrator,
  createEnterpriseOrchestrator,
} from './orchestrator.js';

// Evaluator-Optimizer Pattern
export {
  EvaluatorOptimizer,
  createContentOptimizer,
  createCodeOptimizer,
} from './evaluator-optimizer.js';

// Prompt Chaining Pattern
export {
  PromptChain,
  createResearchWritingChain,
  createAnalysisChain,
} from './prompt-chain.js';

// Routing Pattern
export {
  Router,
  createCustomerServiceRouter,
  createTaskRouter,
} from './router.js';

/**
 * Quick orchestration helper
 *
 * @param task - Complex task to orchestrate
 * @returns Orchestration result
 *
 * @example
 * ```typescript
 * const result = await orchestrate('Analyze our Q4 performance and create a presentation');
 * console.log(result.result);
 * ```
 */
export async function orchestrate(task: string): Promise<{
  success: boolean;
  result: string;
}> {
  const orchestrator = (await import('./orchestrator.js')).createEnterpriseOrchestrator();
  const executionResult = await orchestrator.execute(task);
  return {
    success: executionResult.success,
    result: executionResult.result,
  };
}

/**
 * Quick optimization helper
 *
 * @param task - Content generation task
 * @returns Optimized content
 *
 * @example
 * ```typescript
 * const result = await optimize('Write an executive summary of our Q4 results');
 * console.log(result.finalContent);
 * ```
 */
export async function optimize(task: string): Promise<{
  success: boolean;
  content: string;
  score: number;
}> {
  const optimizer = (await import('./evaluator-optimizer.js')).createContentOptimizer();
  const result = await optimizer.optimize(task);
  return {
    success: result.success,
    content: result.finalContent,
    score: result.finalScore,
  };
}

/**
 * Quick routing helper
 *
 * @param input - Input to route
 * @returns Routed response
 *
 * @example
 * ```typescript
 * const result = await routeInput('I need help fixing a bug in my code');
 * console.log(result.routeName); // 'coding'
 * console.log(result.output);
 * ```
 */
export async function routeInput(input: string): Promise<{
  routeName: string;
  output: string;
}> {
  const router = (await import('./router.js')).createTaskRouter();
  const result = await router.route(input);
  return {
    routeName: result.routeName,
    output: result.output,
  };
}

/**
 * Quick chain execution helper
 *
 * @param topic - Research topic
 * @returns Chain execution result
 *
 * @example
 * ```typescript
 * const result = await researchAndWrite('The future of enterprise automation');
 * console.log(result.finalOutput);
 * ```
 */
export async function researchAndWrite(topic: string): Promise<{
  success: boolean;
  article: unknown;
}> {
  const chain = (await import('./prompt-chain.js')).createResearchWritingChain();
  const result = await chain.execute(topic);
  return {
    success: result.success,
    article: result.finalOutput,
  };
}
