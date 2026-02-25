/**
 * @enterprise-agents/rag
 *
 * Retrieval-Augmented Generation (RAG) capabilities for enterprise agents.
 *
 * Features:
 * - Knowledge base management with document chunking
 * - Multiple chunking strategies (fixed, sentence, paragraph, semantic)
 * - Text and embedding-based retrieval
 * - Context-enhanced generation with Claude
 * - File-based persistence
 *
 * @see https://github.com/anthropics/claude-cookbooks/tree/main/capabilities/retrieval_augmented_generation
 */

// Types
export type {
  Document,
  DocumentMetadata,
  DocumentChunk,
  RetrievalResult,
  ChunkingConfig,
  KnowledgeBaseConfig,
  RAGQueryConfig,
  RAGResult,
  EmbeddingService,
  VectorStore,
  ContextualEmbeddingConfig,
} from './types.js';

// Knowledge Base
export {
  KnowledgeBase,
  createKnowledgeBase,
  createDocument,
} from './knowledge-base.js';

// RAG Engine
export {
  RAGEngine,
  createRAGEngine,
  RAG_PROMPTS,
} from './rag-engine.js';

/**
 * Quick RAG setup helper
 *
 * Creates a RAG engine with an in-memory knowledge base.
 *
 * @param name - Knowledge base name
 * @returns Configured RAG engine
 *
 * @example
 * ```typescript
 * const rag = createQuickRAG('my-kb');
 *
 * // Add documents
 * await rag.getKnowledgeBase().addDocument({
 *   id: 'doc1',
 *   content: 'Document content...',
 *   metadata: { title: 'My Document' }
 * });
 *
 * // Query
 * const result = await rag.query('What is...?');
 * console.log(result.response);
 * ```
 */
export function createQuickRAG(name: string = 'default'): import('./rag-engine.js').RAGEngine {
  const { KnowledgeBase } = require('./knowledge-base.js');
  const { RAGEngine } = require('./rag-engine.js');

  const kb = new KnowledgeBase({
    name,
    storage: 'memory',
  });

  return new RAGEngine(kb);
}

/**
 * Create a file-backed RAG system
 *
 * @param name - Knowledge base name
 * @param storagePath - Path for storage
 * @returns Configured RAG engine with persistence
 *
 * @example
 * ```typescript
 * const rag = createPersistentRAG('company-docs', './data/kb');
 *
 * // Documents persist across restarts
 * await rag.getKnowledgeBase().addDocument({
 *   id: 'policy-1',
 *   content: 'Company policy content...',
 *   metadata: { title: 'HR Policy', type: 'policy' }
 * });
 * ```
 */
export function createPersistentRAG(
  name: string,
  storagePath: string
): import('./rag-engine.js').RAGEngine {
  const { KnowledgeBase } = require('./knowledge-base.js');
  const { RAGEngine } = require('./rag-engine.js');

  const kb = new KnowledgeBase({
    name,
    storage: 'file',
    storagePath,
  });

  return new RAGEngine(kb);
}

/**
 * Batch add documents to a knowledge base
 *
 * @param kb - Knowledge base instance
 * @param documents - Array of document data
 * @returns Map of document IDs to chunk IDs
 *
 * @example
 * ```typescript
 * const results = await batchAddDocuments(kb, [
 *   { id: 'doc1', content: 'First document...', metadata: { title: 'Doc 1' } },
 *   { id: 'doc2', content: 'Second document...', metadata: { title: 'Doc 2' } },
 * ]);
 * ```
 */
export async function batchAddDocuments(
  kb: import('./knowledge-base.js').KnowledgeBase,
  documents: Array<{
    id: string;
    content: string;
    metadata?: import('./types.js').DocumentMetadata;
  }>
): Promise<Map<string, string[]>> {
  const { createDocument } = await import('./knowledge-base.js');

  const docs = documents.map(d => createDocument(d.id, d.content, d.metadata));
  return kb.addDocuments(docs);
}

/**
 * Load documents from a directory into a knowledge base
 *
 * @param kb - Knowledge base instance
 * @param dirPath - Directory path
 * @param extensions - File extensions to include
 * @returns Number of documents loaded
 */
export async function loadDocumentsFromDirectory(
  kb: import('./knowledge-base.js').KnowledgeBase,
  dirPath: string,
  extensions: string[] = ['.txt', '.md']
): Promise<number> {
  const fs = await import('fs');
  const path = await import('path');
  const { createDocument } = await import('./knowledge-base.js');

  const resolvedPath = path.resolve(dirPath);
  let count = 0;

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(resolvedPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (!extensions.includes(ext)) continue;

    const filePath = path.join(resolvedPath, file);
    const stats = fs.statSync(filePath);

    if (!stats.isFile()) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const doc = createDocument(file, content, {
      title: path.basename(file, ext),
      source: filePath,
      type: ext === '.md' ? 'markdown' : 'text',
    });

    await kb.addDocument(doc);
    count++;
  }

  return count;
}
