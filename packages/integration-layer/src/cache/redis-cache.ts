/**
 * Redis Cache Implementation
 *
 * Production-ready distributed cache for multi-instance deployments.
 *
 * PLACEHOLDER: Configure REDIS_URL environment variable
 * for production deployment.
 */

import Redis from 'ioredis';
import { logger } from '../monitoring/logger.js';
import type { CacheProvider, CacheOptions, CacheStats } from './types.js';

export class RedisCache implements CacheProvider {
  private client: Redis | null = null;
  private readonly prefix: string;
  private hits = 0;
  private misses = 0;

  constructor(config?: {
    url?: string;
    prefix?: string;
    password?: string;
  }) {
    this.prefix = config?.prefix ?? 'ea:';

    const redisUrl = config?.url ?? process.env.REDIS_URL ?? 'redis://localhost:6379';

    try {
      this.client = new Redis(redisUrl, {
        password: config?.password ?? process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('[RedisCache] Max retries reached, falling back to memory cache');
            return null;
          }
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        logger.info('[RedisCache] Connected to Redis');
      });

      this.client.on('error', (error) => {
        logger.error('[RedisCache] Redis error:', error);
      });

      // Attempt connection
      this.client.connect().catch((error) => {
        logger.warn('[RedisCache] Failed to connect to Redis:', error.message);
        this.client = null;
      });
    } catch (error) {
      logger.warn('[RedisCache] Redis initialization failed, cache disabled');
      this.client = null;
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) {
      this.misses++;
      return null;
    }

    try {
      const data = await this.client.get(this.getKey(key));

      if (data === null) {
        this.misses++;
        return null;
      }

      this.hits++;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`[RedisCache] Get error for key ${key}:`, error);
      this.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.client) return;

    try {
      const data = JSON.stringify(value);
      const fullKey = this.getKey(key);

      if (options?.ttl) {
        await this.client.setex(fullKey, options.ttl, data);
      } else {
        await this.client.set(fullKey, data);
      }

      logger.debug(`[RedisCache] Set key: ${key}, ttl: ${options?.ttl ?? 'none'}`);
    } catch (error) {
      logger.error(`[RedisCache] Set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.del(this.getKey(key));
      return result > 0;
    } catch (error) {
      logger.error(`[RedisCache] Delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.exists(this.getKey(key));
      return result > 0;
    } catch (error) {
      logger.error(`[RedisCache] Exists error for key ${key}:`, error);
      return false;
    }
  }

  async clear(pattern?: string): Promise<number> {
    if (!this.client) return 0;

    try {
      const searchPattern = pattern
        ? `${this.prefix}${pattern.replace(/\*/g, '*')}`
        : `${this.prefix}*`;

      const keys = await this.client.keys(searchPattern);

      if (keys.length === 0) return 0;

      const result = await this.client.del(...keys);
      logger.info(`[RedisCache] Cleared ${result} keys matching: ${searchPattern}`);
      return result;
    } catch (error) {
      logger.error('[RedisCache] Clear error:', error);
      return 0;
    }
  }

  async getStats(): Promise<CacheStats> {
    const stats: CacheStats = {
      hits: this.hits,
      misses: this.misses,
      keys: 0,
    };

    if (this.client) {
      try {
        const info = await this.client.info('keyspace');
        const match = info.match(/keys=(\d+)/);
        if (match) {
          stats.keys = parseInt(match[1], 10);
        }

        const memory = await this.client.info('memory');
        const memMatch = memory.match(/used_memory:(\d+)/);
        if (memMatch) {
          stats.memoryUsage = parseInt(memMatch[1], 10);
        }
      } catch {
        // Ignore stats errors
      }
    }

    return stats;
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.client?.status === 'ready';
  }

  /**
   * Close Redis connection
   */
  async destroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      logger.info('[RedisCache] Disconnected from Redis');
    }
  }
}
