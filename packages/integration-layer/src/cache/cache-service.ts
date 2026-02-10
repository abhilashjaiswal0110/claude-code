/**
 * Cache Service
 *
 * Unified cache interface with automatic fallback between
 * Redis (production) and in-memory (development) caches.
 */

import { logger } from '../monitoring/logger.js';
import { RedisCache } from './redis-cache.js';
import { MemoryCache } from './memory-cache.js';
import type { CacheProvider, CacheOptions, CacheStats } from './types.js';

export class CacheService implements CacheProvider {
  private primary: CacheProvider;
  private fallback: MemoryCache;
  private useFallback = false;

  constructor(config?: {
    redisUrl?: string;
    prefix?: string;
    disableRedis?: boolean;
  }) {
    // Initialize fallback memory cache
    this.fallback = new MemoryCache();

    // Initialize primary Redis cache unless disabled
    if (config?.disableRedis) {
      this.primary = this.fallback;
      this.useFallback = true;
      logger.info('[CacheService] Using in-memory cache (Redis disabled)');
    } else {
      const redis = new RedisCache({
        url: config?.redisUrl,
        prefix: config?.prefix,
      });

      // Check Redis connection after a short delay
      setTimeout(() => {
        if (!redis.isConnected()) {
          logger.warn('[CacheService] Redis not available, using memory cache');
          this.useFallback = true;
          this.primary = this.fallback;
        }
      }, 2000);

      this.primary = redis;
    }
  }

  private getProvider(): CacheProvider {
    return this.useFallback ? this.fallback : this.primary;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.getProvider().get<T>(key);
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    return this.getProvider().set(key, value, options);
  }

  async delete(key: string): Promise<boolean> {
    return this.getProvider().delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.getProvider().exists(key);
  }

  async clear(pattern?: string): Promise<number> {
    return this.getProvider().clear(pattern);
  }

  async getStats(): Promise<CacheStats> {
    return this.getProvider().getStats();
  }

  /**
   * Cache wrapper for expensive operations
   */
  async cached<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute factory and cache result
    const result = await factory();
    await this.set(key, result, options);
    return result;
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidate(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      await this.clear(pattern);
    }
  }

  /**
   * Check cache provider status
   */
  isUsingRedis(): boolean {
    return !this.useFallback;
  }
}
