/**
 * In-Memory Cache Implementation
 *
 * Suitable for development and single-instance deployments.
 * For production multi-instance deployments, use RedisCache.
 */

import { logger } from '../monitoring/logger.js';
import type { CacheProvider, CacheOptions, CacheStats } from './types.js';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

export class MemoryCache implements CacheProvider {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private hits = 0;
  private misses = 0;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(cleanupIntervalMs = 60000) {
    // Start cleanup scheduler
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);

    logger.info('[MemoryCache] Initialized with cleanup interval');
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: options?.ttl ? Date.now() + options.ttl * 1000 : undefined,
    };

    this.cache.set(key, entry);
    logger.debug(`[MemoryCache] Set key: ${key}, ttl: ${options?.ttl ?? 'none'}`);
  }

  async delete(key: string): Promise<boolean> {
    const result = this.cache.delete(key);
    if (result) {
      logger.debug(`[MemoryCache] Deleted key: ${key}`);
    }
    return result;
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async clear(pattern?: string): Promise<number> {
    let count = 0;

    if (!pattern) {
      count = this.cache.size;
      this.cache.clear();
    } else {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          count++;
        }
      }
    }

    logger.info(`[MemoryCache] Cleared ${count} keys`);
    return count;
  }

  async getStats(): Promise<CacheStats> {
    return {
      hits: this.hits,
      misses: this.misses,
      keys: this.cache.size,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`[MemoryCache] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Stop the cleanup scheduler
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    logger.info('[MemoryCache] Destroyed');
  }
}
