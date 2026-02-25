/**
 * RAG (Retrieval-Augmented Generation) Type Definitions
 *
 * Types for knowledge base management, document retrieval,
 * and context-enhanced generation.
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/capabilities/retrieval_augmented_generation
 */

/**
 * Document to be stored in the knowledge base
 */
export interface Document {
  /** Unique document identifier */
  id: string;

  /** Document content */
  content: string;

  /** Document metadata */
  metadata: DocumentMetadata;

  /** Optional pre-computed embedding */
  embedding?: number[];
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
  /** Document title */
  title?: string;

  /** Document source/origin */
  source?: string;

  /** Document URL */
  url?: string;

  /** Document type */
  type?: 'text' | 'markdown' | 'html' | 'pdf' | 'code';

  /** Creation timestamp */
  createdAt?: string;

  /** Last modified timestamp */
  updatedAt?: string;

  /** Author/creator */
  author?: string;

  /** Tags for categorization */
  tags?: string[];

  /** Custom metadata fields */
  [key: string]: unknown;
}

/**
 * Document chunk after splitting
 */
export interface DocumentChunk {
  /** Unique chunk identifier */
  id: string;

  /** Parent document ID */
  documentId: string;

  /** Chunk content */
  content: string;

  /** Chunk position in document */
  position: number;

  /** Total chunks in document */
  totalChunks: number;

  /** Chunk embedding */
  embedding?: number[];

  /** Inherited metadata */
  metadata: DocumentMetadata;
}

/**
 * Retrieval result
 */
export interface RetrievalResult {
  /** Retrieved chunk */
  chunk: DocumentChunk;

  /** Similarity score (0-1) */
  score: number;

  /** Distance in vector space */
  distance?: number;
}

/**
 * Text chunking configuration
 */
export interface ChunkingConfig {
  /** Maximum chunk size in characters */
  maxChunkSize?: number;

  /** Overlap between chunks */
  chunkOverlap?: number;

  /** Chunking strategy */
  strategy?: 'fixed' | 'sentence' | 'paragraph' | 'semantic';

  /** Separator for splitting */
  separator?: string;
}

/**
 * Knowledge base configuration
 */
export interface KnowledgeBaseConfig {
  /** Knowledge base name */
  name: string;

  /** Storage type */
  storage: 'memory' | 'file';

  /** Storage path for file-based storage */
  storagePath?: string;

  /** Chunking configuration */
  chunking?: ChunkingConfig;

  /** Whether to compute embeddings */
  computeEmbeddings?: boolean;

  /** Embedding model/service */
  embeddingService?: 'claude' | 'voyage' | 'openai' | 'local';
}

/**
 * RAG query configuration
 */
export interface RAGQueryConfig {
  /** Number of chunks to retrieve */
  topK?: number;

  /** Minimum similarity threshold */
  minScore?: number;

  /** Whether to rerank results */
  rerank?: boolean;

  /** Whether to include context from surrounding chunks */
  includeContext?: boolean;

  /** System prompt for generation */
  systemPrompt?: string;

  /** Maximum tokens for generation */
  maxTokens?: number;
}

/**
 * RAG query result
 */
export interface RAGResult {
  /** Generated response */
  response: string;

  /** Retrieved context chunks */
  context: RetrievalResult[];

  /** Sources used */
  sources: DocumentMetadata[];

  /** Query duration in ms */
  durationMs: number;

  /** Tokens used */
  tokensUsed?: number;
}

/**
 * Embedding service interface
 */
export interface EmbeddingService {
  /** Service name */
  name: string;

  /** Embed a single text */
  embed(text: string): Promise<number[]>;

  /** Embed multiple texts */
  embedBatch(texts: string[]): Promise<number[][]>;

  /** Get embedding dimension */
  getDimension(): number;
}

/**
 * Vector store interface
 */
export interface VectorStore {
  /** Add vectors with IDs */
  add(ids: string[], vectors: number[], metadata?: Record<string, unknown>[]): Promise<void>;

  /** Search for similar vectors */
  search(query: number[], topK: number): Promise<Array<{ id: string; score: number }>>;

  /** Delete vectors by ID */
  delete(ids: string[]): Promise<void>;

  /** Clear all vectors */
  clear(): Promise<void>;

  /** Get total vector count */
  count(): Promise<number>;
}

/**
 * Contextual embedding configuration
 */
export interface ContextualEmbeddingConfig {
  /** Whether to use document context */
  useDocumentContext?: boolean;

  /** Context window size (chunks before/after) */
  contextWindow?: number;

  /** Context prompt template */
  contextPromptTemplate?: string;
}
