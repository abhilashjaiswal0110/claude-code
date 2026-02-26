/**
 * Memory Tool Handler - Production-ready memory system for agent persistence
 *
 * Ported from Anthropic's claude-cookbooks with TypeScript enhancements.
 * Provides secure, client-side execution of memory operations with path validation,
 * error handling, and comprehensive security measures.
 *
 * @module memory-tool
 * @see https://github.com/anthropics/claude-cookbooks/blob/main/tool_use/memory_tool.py
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Memory operation commands supported by the handler
 */
export type MemoryCommand = 'view' | 'create' | 'str_replace' | 'insert' | 'delete' | 'rename';

/**
 * Parameters for memory operations
 */
export interface MemoryParams {
  command: MemoryCommand;
  path?: string;
  file_text?: string;
  old_str?: string;
  new_str?: string;
  insert_line?: number;
  insert_text?: string;
  old_path?: string;
  new_path?: string;
  view_range?: [number, number];
}

/**
 * Result of a memory operation
 */
export interface MemoryResult {
  success?: string;
  error?: string;
}

/**
 * Allowed file extensions for memory storage
 */
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.json', '.yaml', '.yml', '.ts', '.js', '.py'];

/**
 * Memory Tool Handler
 *
 * Handles execution of memory tool commands for agent persistence.
 * The memory tool enables agents to read, write, and manage files in a memory
 * system through a standardized tool interface with security controls.
 *
 * @example
 * ```typescript
 * const memory = new MemoryToolHandler('./agent-memory');
 *
 * // Create a new memory file
 * const result = memory.execute({
 *   command: 'create',
 *   path: '/memories/notes/research.md',
 *   file_text: '# Research Notes\n\nKey findings...'
 * });
 *
 * // View directory contents
 * const listing = memory.execute({
 *   command: 'view',
 *   path: '/memories/notes'
 * });
 * ```
 */
export class MemoryToolHandler {
  private basePath: string;
  private memoryRoot: string;

  /**
   * Initialize the memory tool handler
   *
   * @param basePath - Root directory for all memory operations
   */
  constructor(basePath: string = './memory_storage') {
    this.basePath = path.resolve(basePath);
    this.memoryRoot = path.join(this.basePath, 'memories');

    // Ensure memory root exists
    if (!fs.existsSync(this.memoryRoot)) {
      fs.mkdirSync(this.memoryRoot, { recursive: true });
    }
  }

  /**
   * Validate and resolve memory paths to prevent directory traversal attacks
   *
   * @param memoryPath - The path to validate (must start with /memories)
   * @returns Resolved absolute path within memory_root
   * @throws Error if path is invalid or attempts to escape memory directory
   */
  private validatePath(memoryPath: string): string {
    if (!memoryPath.startsWith('/memories')) {
      throw new Error(
        `Path must start with /memories, got: ${memoryPath}. ` +
        'All memory operations must be confined to the /memories directory.'
      );
    }

    // Remove /memories prefix and any leading slashes
    const relativePath = memoryPath.slice('/memories'.length).replace(/^\/+/, '');

    // Resolve to absolute path within memory_root
    const fullPath = relativePath
      ? path.resolve(this.memoryRoot, relativePath)
      : path.resolve(this.memoryRoot);

    // Verify the resolved path is still within memory_root
    // Use path.relative to properly check containment, avoiding prefix bypass attacks
    const normalizedRoot = path.resolve(this.memoryRoot);
    const relativePath2 = path.relative(normalizedRoot, fullPath);
    if (relativePath2.startsWith('..') || path.isAbsolute(relativePath2)) {
      throw new Error(
        `Path '${memoryPath}' would escape /memories directory. ` +
        'Directory traversal attempts are not allowed.'
      );
    }

    return fullPath;
  }

  /**
   * Execute a memory tool command
   *
   * @param params - Command parameters from tool use
   * @returns Result object with either 'success' or 'error' key
   */
  execute(params: MemoryParams): MemoryResult {
    const { command } = params;

    try {
      switch (command) {
        case 'view':
          return this.view(params);
        case 'create':
          return this.create(params);
        case 'str_replace':
          return this.strReplace(params);
        case 'insert':
          return this.insert(params);
        case 'delete':
          return this.delete(params);
        case 'rename':
          return this.rename(params);
        default:
          return {
            error: `Unknown command: '${command}'. ` +
              'Valid commands are: view, create, str_replace, insert, delete, rename'
          };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: message };
    }
  }

  /**
   * View directory contents or file contents
   */
  private view(params: MemoryParams): MemoryResult {
    const { path: memoryPath, view_range } = params;

    if (!memoryPath) {
      return { error: 'Missing required parameter: path' };
    }

    const fullPath = this.validatePath(memoryPath);

    try {
      const stats = fs.statSync(fullPath);

      // Handle directory listing
      if (stats.isDirectory()) {
        const items = fs.readdirSync(fullPath)
          .filter(item => !item.startsWith('.'))
          .sort()
          .map(item => {
            const itemPath = path.join(fullPath, item);
            const itemStats = fs.statSync(itemPath);
            return itemStats.isDirectory() ? `${item}/` : item;
          });

        if (items.length === 0) {
          return { success: `Directory: ${memoryPath}\n(empty)` };
        }

        return {
          success: `Directory: ${memoryPath}\n` +
            items.map(item => `- ${item}`).join('\n')
        };
      }

      // Handle file reading - attempt read inside try-catch to handle race conditions
      if (stats.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          let lines = content.split('\n');
          let startNum = 1;

          // Apply view range if specified
          if (view_range) {
            const startLine = Math.max(1, view_range[0]) - 1; // Convert to 0-indexed
            const endLine = view_range[1] === -1 ? lines.length : view_range[1];
            lines = lines.slice(startLine, endLine);
            startNum = startLine + 1;
          }

          // Format with line numbers
          const numberedLines = lines.map((line, i) => {
            const lineNum = String(i + startNum).padStart(4, ' ');
            return `${lineNum}: ${line}`;
          });

          return { success: numberedLines.join('\n') };
        } catch (readErr) {
          // Handle file being deleted/changed between stat and read
          if ((readErr as NodeJS.ErrnoException).code === 'ENOENT') {
            return { error: `File no longer exists: ${memoryPath}` };
          }
          throw readErr;
        }
      }

      return { error: `Path not found: ${memoryPath}` };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return { error: `Path not found: ${memoryPath}` };
      }
      throw err;
    }
  }

  /**
   * Create or overwrite a file
   */
  private create(params: MemoryParams): MemoryResult {
    const { path: memoryPath, file_text = '' } = params;

    if (!memoryPath) {
      return { error: 'Missing required parameter: path' };
    }

    // Validate file extension
    const ext = path.extname(memoryPath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        error: `Cannot create ${memoryPath}: Only text files are supported. ` +
          `Use file extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      };
    }

    const fullPath = this.validatePath(memoryPath);

    try {
      // Create parent directories if needed
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      // Write the file
      fs.writeFileSync(fullPath, file_text, 'utf-8');
      return { success: `File created successfully at ${memoryPath}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Cannot create file ${memoryPath}: ${message}` };
    }
  }

  /**
   * Replace text in a file
   */
  private strReplace(params: MemoryParams): MemoryResult {
    const { path: memoryPath, old_str, new_str = '' } = params;

    if (!memoryPath || old_str === undefined) {
      return { error: 'Missing required parameters: path, old_str' };
    }

    const fullPath = this.validatePath(memoryPath);

    try {
      // Read file directly - handle errors in catch block to avoid race conditions
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Verify it's a file (after successful read)
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        return { error: `Path is not a file: ${memoryPath}` };
      }

      // Check if old_str exists
      const count = (content.match(new RegExp(this.escapeRegex(old_str), 'g')) || []).length;

      if (count === 0) {
        return {
          error: `String not found in ${memoryPath}. The exact text must exist in the file.`
        };
      }

      if (count > 1) {
        return {
          error: `String appears ${count} times in ${memoryPath}. ` +
            'The string must be unique. Use more specific context.'
        };
      }

      // Perform replacement
      const newContent = content.replace(old_str, new_str);
      fs.writeFileSync(fullPath, newContent, 'utf-8');

      return { success: `File ${memoryPath} has been edited successfully` };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return { error: `File not found: ${memoryPath}` };
      }
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Cannot edit file ${memoryPath}: ${message}` };
    }
  }

  /**
   * Escape special regex characters in a string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Insert text at a specific line
   */
  private insert(params: MemoryParams): MemoryResult {
    const { path: memoryPath, insert_line, insert_text = '' } = params;

    if (!memoryPath || insert_line === undefined) {
      return { error: 'Missing required parameters: path, insert_line' };
    }

    const fullPath = this.validatePath(memoryPath);

    try {
      // Read file directly - handle errors in catch block to avoid race conditions
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      // Verify it's a file (after successful read)
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        return { error: `Path is not a file: ${memoryPath}` };
      }

      // Validate insert_line
      if (insert_line < 0 || insert_line > lines.length) {
        return {
          error: `Invalid insert_line ${insert_line}. Must be between 0 and ${lines.length}`
        };
      }

      // Insert the text
      lines.splice(insert_line, 0, insert_text.replace(/\n$/, ''));

      // Write back
      fs.writeFileSync(fullPath, lines.join('\n'), 'utf-8');

      return { success: `Text inserted at line ${insert_line} in ${memoryPath}` };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return { error: `File not found: ${memoryPath}` };
      }
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Cannot insert into ${memoryPath}: ${message}` };
    }
  }

  /**
   * Delete a file or directory
   */
  private delete(params: MemoryParams): MemoryResult {
    const { path: memoryPath } = params;

    if (!memoryPath) {
      return { error: 'Missing required parameter: path' };
    }

    // Prevent deletion of root memories directory
    if (memoryPath === '/memories') {
      return { error: 'Cannot delete the /memories directory itself' };
    }

    const fullPath = this.validatePath(memoryPath);

    // Verify the path is within /memories
    const normalizedRoot = path.resolve(this.memoryRoot);
    if (!fullPath.startsWith(normalizedRoot)) {
      return {
        error: `Invalid operation: Path '${memoryPath}' is not within /memories directory. ` +
          'Only paths within /memories can be deleted.'
      };
    }

    if (!fs.existsSync(fullPath)) {
      return { error: `Path not found: ${memoryPath}` };
    }

    try {
      const stats = fs.statSync(fullPath);

      if (stats.isFile()) {
        fs.unlinkSync(fullPath);
        return { success: `File deleted: ${memoryPath}` };
      }

      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true });
        return { success: `Directory deleted: ${memoryPath}` };
      }

      return { error: `Unknown file type at ${memoryPath}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Cannot delete ${memoryPath}: ${message}` };
    }
  }

  /**
   * Rename or move a file/directory
   */
  private rename(params: MemoryParams): MemoryResult {
    const { old_path, new_path } = params;

    if (!old_path || !new_path) {
      return { error: 'Missing required parameters: old_path, new_path' };
    }

    const oldFullPath = this.validatePath(old_path);
    const newFullPath = this.validatePath(new_path);

    if (!fs.existsSync(oldFullPath)) {
      return { error: `Source path not found: ${old_path}` };
    }

    if (fs.existsSync(newFullPath)) {
      return {
        error: `Destination already exists: ${new_path}. ` +
          'Cannot overwrite existing files/directories.'
      };
    }

    try {
      // Create parent directories if needed
      const parentDir = path.dirname(newFullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      // Perform rename/move
      fs.renameSync(oldFullPath, newFullPath);

      return { success: `Renamed ${old_path} to ${new_path}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Cannot rename ${old_path} to ${new_path}: ${message}` };
    }
  }

  /**
   * Clear all memory files (useful for testing or starting fresh)
   *
   * @warning This permanently removes all stored knowledge
   * @returns Result indicating success or failure
   */
  clearAllMemory(): MemoryResult {
    try {
      if (fs.existsSync(this.memoryRoot)) {
        fs.rmSync(this.memoryRoot, { recursive: true });
      }
      fs.mkdirSync(this.memoryRoot, { recursive: true });
      return { success: 'All memory cleared successfully' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Cannot clear memory: ${message}` };
    }
  }

  /**
   * Get the base path for this memory handler
   */
  getBasePath(): string {
    return this.basePath;
  }

  /**
   * Get the memory root directory path
   */
  getMemoryRoot(): string {
    return this.memoryRoot;
  }

  /**
   * Check if a path exists in memory
   *
   * @param memoryPath - Path to check (must start with /memories)
   * @returns True if path exists
   */
  exists(memoryPath: string): boolean {
    try {
      const fullPath = this.validatePath(memoryPath);
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  }

  /**
   * List all files in memory recursively
   *
   * @returns Array of file paths relative to /memories
   */
  listAllFiles(): string[] {
    const files: string[] = [];

    const walk = (dir: string, prefix: string = '') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item.startsWith('.')) continue;

        const fullPath = path.join(dir, item);
        const relativePath = prefix ? `${prefix}/${item}` : item;
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          walk(fullPath, relativePath);
        } else {
          files.push(`/memories/${relativePath}`);
        }
      }
    };

    if (fs.existsSync(this.memoryRoot)) {
      walk(this.memoryRoot);
    }

    return files;
  }
}

/**
 * Create a default memory tool handler instance
 *
 * @param basePath - Optional custom base path
 * @returns Configured MemoryToolHandler instance
 */
export function createMemoryTool(basePath?: string): MemoryToolHandler {
  return new MemoryToolHandler(basePath);
}
