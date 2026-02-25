/**
 * Knowledge Base Management
 *
 * Provides document storage, chunking, and retrieval
 * for RAG-enhanced generation.
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/capabilities/retrieval_augmented_generation
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@enterprise-agents/core';

import type {
  Document,
  DocumentChunk,
  DocumentMetadata,
  KnowledgeBaseConfig,
  ChunkingConfig,
  RetrievalResult,
} from './types.js';

/**
 * Default chunking configuration
 */
const DEFAULT_CHUNKING: Required<ChunkingConfig> = {
  maxChunkSize: 1000,
  chunkOverlap: 200,
  strategy: 'paragraph',
  separator: '\n\n',
};

/**
 * Default knowledge base configuration
 */
const DEFAULT_CONFIG: Partial<KnowledgeBaseConfig> = {
  storage: 'memory',
  computeEmbeddings: false,
  chunking: DEFAULT_CHUNKING,
};

/**
 * Knowledge Base class
 *
 * Manages document storage, chunking, and retrieval.
 */
export class KnowledgeBase {
  private config: KnowledgeBaseConfig;
  private documents: Map<string, Document> = new Map();
  private chunks: Map<string, DocumentChunk> = new Map();
  private chunkIndex: Map<string, string[]> = new Map(); // docId -> chunkIds

  constructor(config: KnowledgeBaseConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      chunking: { ...DEFAULT_CHUNKING, ...config.chunking },
    } as KnowledgeBaseConfig;

    // Load from file if configured
    if (this.config.storage === 'file' && this.config.storagePath) {
      this.loadFromFile();
    }
  }

  /**
   * Add a document to the knowledge base
   *
   * @param doc - Document to add
   * @returns Created chunk IDs
   */
  async addDocument(doc: Document): Promise<string[]> {
    logger.info(`Adding document: ${doc.id}`);

    // Store document
    this.documents.set(doc.id, doc);

    // Chunk document
    const chunks = this.chunkDocument(doc);
    const chunkIds: string[] = [];

    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
      chunkIds.push(chunk.id);
    }

    // Update index
    this.chunkIndex.set(doc.id, chunkIds);

    // Persist if file-based
    if (this.config.storage === 'file') {
      this.saveToFile();
    }

    logger.info(`Document ${doc.id} added with ${chunks.length} chunks`);

    return chunkIds;
  }

  /**
   * Add multiple documents
   */
  async addDocuments(docs: Document[]): Promise<Map<string, string[]>> {
    const results = new Map<string, string[]>();

    for (const doc of docs) {
      const chunkIds = await this.addDocument(doc);
      results.set(doc.id, chunkIds);
    }

    return results;
  }

  /**
   * Get a document by ID
   */
  getDocument(docId: string): Document | undefined {
    return this.documents.get(docId);
  }

  /**
   * Get a chunk by ID
   */
  getChunk(chunkId: string): DocumentChunk | undefined {
    return this.chunks.get(chunkId);
  }

  /**
   * Get all chunks for a document
   */
  getDocumentChunks(docId: string): DocumentChunk[] {
    const chunkIds = this.chunkIndex.get(docId) || [];
    return chunkIds.map(id => this.chunks.get(id)!).filter(Boolean);
  }

  /**
   * Search for relevant chunks using keyword matching
   *
   * @param query - Search query
   * @param topK - Number of results to return
   * @returns Retrieval results sorted by relevance
   */
  search(query: string, topK: number = 5): RetrievalResult[] {
    const queryTerms = this.tokenize(query);
    const results: RetrievalResult[] = [];

    for (const chunk of this.chunks.values()) {
      const score = this.computeTextSimilarity(queryTerms, chunk.content);

      if (score > 0) {
        results.push({ chunk, score });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }

  /**
   * Search with embedding similarity (if embeddings available)
   */
  searchByEmbedding(
    queryEmbedding: number[],
    topK: number = 5
  ): RetrievalResult[] {
    const results: RetrievalResult[] = [];

    for (const chunk of this.chunks.values()) {
      if (chunk.embedding) {
        const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);

        results.push({
          chunk,
          score,
          distance: 1 - score,
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }

  /**
   * Delete a document and its chunks
   */
  deleteDocument(docId: string): boolean {
    const chunkIds = this.chunkIndex.get(docId);

    if (!chunkIds) {
      return false;
    }

    // Delete chunks
    for (const chunkId of chunkIds) {
      this.chunks.delete(chunkId);
    }

    // Delete document and index
    this.documents.delete(docId);
    this.chunkIndex.delete(docId);

    // Persist if file-based
    if (this.config.storage === 'file') {
      this.saveToFile();
    }

    return true;
  }

  /**
   * Clear all documents and chunks
   */
  clear(): void {
    this.documents.clear();
    this.chunks.clear();
    this.chunkIndex.clear();

    if (this.config.storage === 'file') {
      this.saveToFile();
    }
  }

  /**
   * Get knowledge base statistics
   */
  getStats(): {
    documentCount: number;
    chunkCount: number;
    totalCharacters: number;
  } {
    let totalChars = 0;
    for (const chunk of this.chunks.values()) {
      totalChars += chunk.content.length;
    }

    return {
      documentCount: this.documents.size,
      chunkCount: this.chunks.size,
      totalCharacters: totalChars,
    };
  }

  /**
   * Chunk a document according to configuration
   */
  private chunkDocument(doc: Document): DocumentChunk[] {
    const config = this.config.chunking as Required<ChunkingConfig>;
    const chunks: DocumentChunk[] = [];

    let textChunks: string[];

    switch (config.strategy) {
      case 'sentence':
        textChunks = this.chunkBySentence(doc.content, config);
        break;
      case 'paragraph':
        textChunks = this.chunkByParagraph(doc.content, config);
        break;
      case 'semantic':
        textChunks = this.chunkSemantic(doc.content, config);
        break;
      case 'fixed':
      default:
        textChunks = this.chunkFixed(doc.content, config);
    }

    for (let i = 0; i < textChunks.length; i++) {
      chunks.push({
        id: `${doc.id}-chunk-${i}`,
        documentId: doc.id,
        content: textChunks[i],
        position: i,
        totalChunks: textChunks.length,
        metadata: doc.metadata,
      });
    }

    return chunks;
  }

  /**
   * Fixed-size chunking
   */
  private chunkFixed(text: string, config: Required<ChunkingConfig>): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + config.maxChunkSize, text.length);
      chunks.push(text.slice(start, end).trim());
      start = end - config.chunkOverlap;

      if (start < 0) start = 0;
    }

    return chunks.filter(c => c.length > 0);
  }

  /**
   * Sentence-based chunking
   */
  private chunkBySentence(text: string, config: Required<ChunkingConfig>): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > config.maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Paragraph-based chunking
   */
  private chunkByParagraph(text: string, config: Required<ChunkingConfig>): string[] {
    const paragraphs = text.split(config.separator).filter(p => p.trim());
    const chunks: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
      if (currentChunk.length + para.length > config.maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // If single paragraph exceeds max, split it
        if (para.length > config.maxChunkSize) {
          chunks.push(...this.chunkFixed(para, config));
          currentChunk = '';
        } else {
          currentChunk = para;
        }
      } else {
        currentChunk += (currentChunk ? config.separator : '') + para;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Semantic chunking (simplified - groups related content)
   */
  private chunkSemantic(text: string, config: Required<ChunkingConfig>): string[] {
    // Simplified: Use headers/sections as semantic boundaries
    const sections = text.split(/(?=^#{1,3}\s)/m);

    const chunks: string[] = [];

    for (const section of sections) {
      if (section.length <= config.maxChunkSize) {
        chunks.push(section.trim());
      } else {
        // Fall back to paragraph chunking for long sections
        chunks.push(...this.chunkByParagraph(section, config));
      }
    }

    return chunks.filter(c => c.length > 0);
  }

  /**
   * Simple tokenization
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  /**
   * Compute text similarity using term overlap
   */
  private computeTextSimilarity(queryTerms: string[], content: string): number {
    const contentTerms = new Set(this.tokenize(content));
    let matches = 0;

    for (const term of queryTerms) {
      if (contentTerms.has(term)) {
        matches++;
      }
    }

    return queryTerms.length > 0 ? matches / queryTerms.length : 0;
  }

  /**
   * Compute cosine similarity between vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * Load knowledge base from file
   */
  private loadFromFile(): void {
    if (!this.config.storagePath) return;

    const filePath = path.resolve(this.config.storagePath, `${this.config.name}.json`);

    if (!fs.existsSync(filePath)) return;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const doc of data.documents || []) {
        this.documents.set(doc.id, doc);
      }

      for (const chunk of data.chunks || []) {
        this.chunks.set(chunk.id, chunk);
      }

      for (const [docId, chunkIds] of Object.entries(data.index || {})) {
        this.chunkIndex.set(docId, chunkIds as string[]);
      }

      logger.info(`Loaded knowledge base from ${filePath}`);
    } catch (err) {
      logger.warning(`Failed to load knowledge base: ${err}`);
    }
  }

  /**
   * Save knowledge base to file
   */
  private saveToFile(): void {
    if (!this.config.storagePath) return;

    const dirPath = path.resolve(this.config.storagePath);
    const filePath = path.join(dirPath, `${this.config.name}.json`);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const data = {
      documents: Array.from(this.documents.values()),
      chunks: Array.from(this.chunks.values()),
      index: Object.fromEntries(this.chunkIndex),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

/**
 * Create a knowledge base instance
 */
export function createKnowledgeBase(config: KnowledgeBaseConfig): KnowledgeBase {
  return new KnowledgeBase(config);
}

/**
 * Create a document from text
 */
export function createDocument(
  id: string,
  content: string,
  metadata: Partial<DocumentMetadata> = {}
): Document {
  return {
    id,
    content,
    metadata: {
      ...metadata,
      createdAt: new Date().toISOString(),
    },
  };
}
