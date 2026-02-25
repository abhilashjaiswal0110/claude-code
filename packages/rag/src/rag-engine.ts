/**
 * RAG Query Engine
 *
 * Combines knowledge base retrieval with Claude generation
 * for context-enhanced responses.
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/capabilities/retrieval_augmented_generation
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { logger } from '@enterprise-agents/core';

import type {
  RAGQueryConfig,
  RAGResult,
  RetrievalResult,
  DocumentMetadata,
} from './types.js';
import { KnowledgeBase } from './knowledge-base.js';

/**
 * Default RAG query configuration
 */
const DEFAULT_CONFIG: Required<RAGQueryConfig> = {
  topK: 5,
  minScore: 0.1,
  rerank: false,
  includeContext: true,
  systemPrompt: 'You are a helpful assistant that answers questions based on the provided context.',
  maxTokens: 2000,
};

/**
 * RAG Engine class
 *
 * Orchestrates retrieval and generation for RAG queries.
 */
export class RAGEngine {
  private knowledgeBase: KnowledgeBase;
  private defaultConfig: Required<RAGQueryConfig>;

  constructor(knowledgeBase: KnowledgeBase, config: RAGQueryConfig = {}) {
    this.knowledgeBase = knowledgeBase;
    this.defaultConfig = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Query the RAG system
   *
   * @param userQuery - User's question
   * @param config - Query configuration override
   * @returns RAG result with response and sources
   */
  async query(userQuery: string, config: RAGQueryConfig = {}): Promise<RAGResult> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();

    logger.info(`RAG query: ${userQuery.slice(0, 50)}...`);

    // Retrieve relevant chunks
    const retrieved = this.knowledgeBase.search(userQuery, mergedConfig.topK);

    // Filter by minimum score
    const filtered = retrieved.filter(r => r.score >= mergedConfig.minScore);

    logger.info(`Retrieved ${filtered.length} relevant chunks`);

    // Build context from retrieved chunks
    const context = this.buildContext(filtered, mergedConfig);

    // Generate response
    const response = await this.generate(userQuery, context, mergedConfig);

    // Extract unique sources
    const sources = this.extractSources(filtered);

    return {
      response,
      context: filtered,
      sources,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Query with custom context (for testing or override)
   */
  async queryWithContext(
    userQuery: string,
    customContext: string,
    config: RAGQueryConfig = {}
  ): Promise<RAGResult> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();

    const response = await this.generate(userQuery, customContext, mergedConfig);

    return {
      response,
      context: [],
      sources: [],
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Build context string from retrieved chunks
   */
  private buildContext(results: RetrievalResult[], config: Required<RAGQueryConfig>): string {
    if (results.length === 0) {
      return 'No relevant information found in the knowledge base.';
    }

    const contextParts: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const { chunk, score } = results[i];
      const source = chunk.metadata.title || chunk.metadata.source || `Document ${chunk.documentId}`;

      contextParts.push(`[Source ${i + 1}: ${source} (relevance: ${(score * 100).toFixed(1)}%)]`);
      contextParts.push(chunk.content);
      contextParts.push('');
    }

    return contextParts.join('\n');
  }

  /**
   * Generate response using Claude
   */
  private async generate(
    userQuery: string,
    context: string,
    config: Required<RAGQueryConfig>
  ): Promise<string> {
    const prompt = `Based on the following context, answer the user's question.
If the context doesn't contain enough information to answer, say so.
Always cite which sources you used in your answer.

CONTEXT:
${context}

USER QUESTION:
${userQuery}

Provide a comprehensive answer based on the context above.`;

    let response = '';

    for await (const message of query({
      prompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: config.systemPrompt,
        },
        allowedTools: [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 5,
        maxBudgetUsd: 0.5,
      },
    })) {
      if ('result' in message && message.type === 'result') {
        response = message.result as string;
      }
    }

    return response;
  }

  /**
   * Extract unique sources from results
   */
  private extractSources(results: RetrievalResult[]): DocumentMetadata[] {
    const seen = new Set<string>();
    const sources: DocumentMetadata[] = [];

    for (const result of results) {
      const docId = result.chunk.documentId;

      if (!seen.has(docId)) {
        seen.add(docId);
        sources.push(result.chunk.metadata);
      }
    }

    return sources;
  }

  /**
   * Get the underlying knowledge base
   */
  getKnowledgeBase(): KnowledgeBase {
    return this.knowledgeBase;
  }
}

/**
 * Create a RAG engine with a knowledge base
 */
export function createRAGEngine(
  knowledgeBase: KnowledgeBase,
  config?: RAGQueryConfig
): RAGEngine {
  return new RAGEngine(knowledgeBase, config);
}

/**
 * RAG system prompt templates
 */
export const RAG_PROMPTS = {
  default: `You are a helpful assistant that answers questions based on the provided context.
Always cite your sources and indicate confidence level.
If information is not in the context, clearly state that.`,

  technical: `You are a technical expert assistant.
Answer questions using the provided documentation context.
Include code examples when relevant.
Be precise and cite specific sections.`,

  research: `You are a research assistant.
Synthesize information from the provided sources.
Note any conflicting information.
Cite sources using numbered references.`,

  support: `You are a customer support assistant.
Answer questions using the provided knowledge base.
Be helpful and concise.
If you can't find the answer, suggest escalation.`,
};
