/**
 * Routing Pattern
 *
 * Implements dynamic routing of inputs to specialized handlers
 * based on content classification.
 *
 * @see https://anthropic.com/research/building-effective-agents
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { logger } from '@enterprise-agents/core';

import type {
  RouterConfig,
  Route,
  RouteHandler,
  RoutingResult,
} from './types.js';

/**
 * Router class
 *
 * Routes inputs to appropriate handlers based on classification.
 */
export class Router {
  private config: RouterConfig;

  constructor(config: RouterConfig) {
    this.config = {
      strategy: 'first-match',
      ...config,
    };
  }

  /**
   * Route an input to the appropriate handler
   *
   * @param input - The input to route
   * @returns Routing result with handler output
   */
  async route(input: string): Promise<RoutingResult> {
    const startTime = Date.now();

    logger.info('Routing input...');

    let selectedRoute: Route | undefined;
    let confidence: number | undefined;

    switch (this.config.strategy) {
      case 'first-match':
        selectedRoute = this.firstMatch(input);
        break;

      case 'best-match':
        const bestResult = this.bestMatch(input);
        selectedRoute = bestResult.route;
        confidence = bestResult.confidence;
        break;

      case 'llm-classify':
        const classifyResult = await this.llmClassify(input);
        selectedRoute = classifyResult.route;
        confidence = classifyResult.confidence;
        break;
    }

    // Use default route if no match
    if (!selectedRoute && this.config.defaultRoute) {
      selectedRoute = {
        name: 'default',
        description: 'Default route',
        handler: this.config.defaultRoute,
      };
      confidence = 0.5;
    }

    if (!selectedRoute) {
      return {
        routeName: 'none',
        output: 'No matching route found',
        durationMs: Date.now() - startTime,
      };
    }

    logger.info(`Selected route: ${selectedRoute.name}`);

    // Execute handler
    const output = await this.executeHandler(selectedRoute.handler, input);

    return {
      routeName: selectedRoute.name,
      confidence,
      output,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * First-match routing strategy
   */
  private firstMatch(input: string): Route | undefined {
    const inputLower = input.toLowerCase();

    for (const route of this.config.routes) {
      // Check custom condition
      if (route.condition && route.condition(input)) {
        return route;
      }

      // Check keywords
      if (route.keywords) {
        for (const keyword of route.keywords) {
          if (inputLower.includes(keyword.toLowerCase())) {
            return route;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Best-match routing strategy (highest keyword match count)
   */
  private bestMatch(input: string): { route?: Route; confidence?: number } {
    const inputLower = input.toLowerCase();
    let bestRoute: Route | undefined;
    let bestScore = 0;

    for (const route of this.config.routes) {
      let score = 0;

      // Custom condition is high priority
      if (route.condition && route.condition(input)) {
        score += 100;
      }

      // Count keyword matches
      if (route.keywords) {
        for (const keyword of route.keywords) {
          if (inputLower.includes(keyword.toLowerCase())) {
            score += 10;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestRoute = route;
      }
    }

    const maxPossibleScore = 100 + (bestRoute?.keywords?.length || 0) * 10;
    const confidence = maxPossibleScore > 0 ? bestScore / maxPossibleScore : 0;

    return {
      route: bestRoute,
      confidence: bestRoute ? confidence : undefined,
    };
  }

  /**
   * LLM-based classification strategy
   */
  private async llmClassify(input: string): Promise<{ route?: Route; confidence?: number }> {
    const routeDescriptions = this.config.routes
      .map((r, i) => `${i + 1}. ${r.name}: ${r.description}`)
      .join('\n');

    const classificationPrompt = this.config.classificationPrompt || `Classify the following input into one of these categories:

${routeDescriptions}

Input:
${input}

Respond with JSON:
{
  "category_number": <number>,
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>"
}`;

    let result = '';

    for await (const message of query({
      prompt: classificationPrompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: 'You are a classification specialist. Analyze inputs and categorize them accurately.',
        },
        allowedTools: [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 3,
        maxBudgetUsd: 0.2,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        result = message.result as string;
      }
    }

    // Parse classification - use indexOf/lastIndexOf to avoid ReDoS
    try {
      const startIdx = result.indexOf('{');
      const endIdx = result.lastIndexOf('}');

      if (startIdx !== -1 && endIdx > startIdx && result.includes('"category_number"')) {
        const jsonStr = result.slice(startIdx, endIdx + 1);
        const parsed = JSON.parse(jsonStr);
        const categoryIndex = parsed.category_number - 1;

        if (categoryIndex >= 0 && categoryIndex < this.config.routes.length) {
          return {
            route: this.config.routes[categoryIndex],
            confidence: parsed.confidence,
          };
        }
      }
    } catch {
      logger.warning('Failed to parse LLM classification');
    }

    return { route: undefined };
  }

  /**
   * Execute a route handler
   */
  private async executeHandler(handler: RouteHandler, input: string): Promise<string> {
    let result = '';

    for await (const message of query({
      prompt: input,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: handler.systemPrompt,
        },
        allowedTools: handler.allowedTools || [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: handler.maxTurns || 15,
        maxBudgetUsd: handler.maxBudgetUsd || 2.0,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        result = message.result as string;
      }
    }

    return result;
  }
}

/**
 * Create a customer service router
 */
export function createCustomerServiceRouter(): Router {
  return new Router({
    strategy: 'llm-classify',
    routes: [
      {
        name: 'technical-support',
        description: 'Technical issues, bugs, errors, how-to questions',
        keywords: ['error', 'bug', 'not working', 'help', 'how to', 'problem'],
        handler: {
          name: 'Technical Support Agent',
          systemPrompt: 'You are a helpful technical support agent. Provide clear, step-by-step solutions.',
          allowedTools: ['Read', 'WebSearch'],
          maxTurns: 15,
        },
      },
      {
        name: 'billing',
        description: 'Billing, payments, invoices, refunds, pricing',
        keywords: ['bill', 'payment', 'invoice', 'refund', 'price', 'charge', 'cost'],
        handler: {
          name: 'Billing Support Agent',
          systemPrompt: 'You are a billing support agent. Help with payment and billing inquiries professionally.',
          allowedTools: [],
          maxTurns: 10,
        },
      },
      {
        name: 'sales',
        description: 'Product information, features, purchasing, upgrades',
        keywords: ['buy', 'purchase', 'feature', 'upgrade', 'plan', 'subscription'],
        handler: {
          name: 'Sales Agent',
          systemPrompt: 'You are a helpful sales agent. Provide product information and guide purchase decisions.',
          allowedTools: ['WebSearch'],
          maxTurns: 10,
        },
      },
      {
        name: 'feedback',
        description: 'Feedback, suggestions, feature requests, complaints',
        keywords: ['feedback', 'suggest', 'feature request', 'complaint', 'improve'],
        handler: {
          name: 'Feedback Handler',
          systemPrompt: 'You are a customer success agent. Acknowledge feedback warmly and document concerns.',
          allowedTools: [],
          maxTurns: 5,
        },
      },
    ],
    defaultRoute: {
      name: 'General Support',
      systemPrompt: 'You are a general customer support agent. Help with any inquiries professionally.',
      allowedTools: ['WebSearch'],
      maxTurns: 15,
    },
  });
}

/**
 * Create a task routing system
 */
export function createTaskRouter(): Router {
  return new Router({
    strategy: 'llm-classify',
    routes: [
      {
        name: 'research',
        description: 'Research tasks, information gathering, fact-finding',
        keywords: ['research', 'find', 'search', 'information', 'what is', 'explain'],
        handler: {
          name: 'Research Agent',
          systemPrompt: 'You are a research specialist. Provide thorough, well-sourced information.',
          allowedTools: ['WebSearch', 'Read'],
          maxTurns: 20,
          maxBudgetUsd: 3.0,
        },
      },
      {
        name: 'writing',
        description: 'Content creation, writing, editing, documentation',
        keywords: ['write', 'create', 'draft', 'document', 'article', 'content'],
        handler: {
          name: 'Writing Agent',
          systemPrompt: 'You are a professional writer. Create clear, engaging content.',
          allowedTools: ['Read'],
          maxTurns: 10,
          maxBudgetUsd: 1.5,
        },
      },
      {
        name: 'analysis',
        description: 'Data analysis, comparison, evaluation',
        keywords: ['analyze', 'compare', 'evaluate', 'assess', 'review'],
        handler: {
          name: 'Analysis Agent',
          systemPrompt: 'You are an analytical expert. Provide thorough, data-driven analysis.',
          allowedTools: ['Read', 'Glob', 'Grep'],
          maxTurns: 15,
          maxBudgetUsd: 2.0,
        },
      },
      {
        name: 'coding',
        description: 'Programming, code generation, debugging',
        keywords: ['code', 'program', 'function', 'implement', 'debug', 'fix'],
        handler: {
          name: 'Coding Agent',
          systemPrompt: 'You are an expert programmer. Write clean, efficient, well-documented code.',
          allowedTools: ['Read', 'Glob', 'Grep', 'Write', 'Edit'],
          maxTurns: 20,
          maxBudgetUsd: 3.0,
        },
      },
    ],
    defaultRoute: {
      name: 'General Agent',
      systemPrompt: 'You are a helpful assistant. Complete tasks efficiently and effectively.',
      allowedTools: ['WebSearch', 'Read'],
      maxTurns: 15,
    },
  });
}
