/**
 * Health Checker
 *
 * Comprehensive health checks for application and dependencies.
 * Supports Kubernetes liveness and readiness probes.
 */

import { logger } from './logger.js';

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
}

export interface OverallHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  uptime: number;
  checks: HealthCheckResult[];
}

type HealthCheckFn = () => Promise<HealthCheckResult>;

export class HealthChecker {
  private checks: Map<string, HealthCheckFn> = new Map();
  private startTime: Date;
  private version: string;

  constructor(version = '1.0.0') {
    this.startTime = new Date();
    this.version = version;
  }

  /**
   * Register a health check
   */
  registerCheck(name: string, check: HealthCheckFn): void {
    this.checks.set(name, check);
    logger.debug(`[HealthChecker] Registered check: ${name}`);
  }

  /**
   * Run all health checks
   */
  async runChecks(): Promise<OverallHealth> {
    const results: HealthCheckResult[] = [];

    for (const [name, check] of this.checks) {
      try {
        const startTime = Date.now();
        const result = await check();
        result.latencyMs = Date.now() - startTime;
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Check failed',
        });
      }
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    for (const result of results) {
      if (result.status === 'unhealthy') {
        status = 'unhealthy';
        break;
      }
      if (result.status === 'degraded') {
        status = 'degraded';
      }
    }

    return {
      status,
      timestamp: new Date(),
      version: this.version,
      uptime: Date.now() - this.startTime.getTime(),
      checks: results,
    };
  }

  /**
   * Liveness probe (is the application running?)
   */
  async liveness(): Promise<{ alive: boolean }> {
    return { alive: true };
  }

  /**
   * Readiness probe (is the application ready to serve traffic?)
   */
  async readiness(): Promise<{ ready: boolean; details?: OverallHealth }> {
    const health = await this.runChecks();
    return {
      ready: health.status !== 'unhealthy',
      details: health,
    };
  }

  /**
   * Create common health checks
   */
  static createCommonChecks(): Record<string, HealthCheckFn> {
    return {
      memory: async (): Promise<HealthCheckResult> => {
        const used = process.memoryUsage();
        const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
        const usagePercent = Math.round((used.heapUsed / used.heapTotal) * 100);

        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        if (usagePercent > 90) status = 'unhealthy';
        else if (usagePercent > 75) status = 'degraded';

        return {
          name: 'memory',
          status,
          message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent}%)`,
          details: {
            heapUsedMB,
            heapTotalMB,
            usagePercent,
            rss: Math.round(used.rss / 1024 / 1024),
          },
        };
      },

      eventLoop: async (): Promise<HealthCheckResult> => {
        return new Promise((resolve) => {
          const start = Date.now();
          setImmediate(() => {
            const lag = Date.now() - start;
            let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
            if (lag > 100) status = 'unhealthy';
            else if (lag > 50) status = 'degraded';

            resolve({
              name: 'eventLoop',
              status,
              message: `Event loop lag: ${lag}ms`,
              details: { lagMs: lag },
            });
          });
        });
      },
    };
  }

  /**
   * Create integration health check
   */
  static createIntegrationCheck(
    name: string,
    testFn: () => Promise<boolean>
  ): HealthCheckFn {
    return async (): Promise<HealthCheckResult> => {
      try {
        const startTime = Date.now();
        const success = await testFn();
        const latencyMs = Date.now() - startTime;

        return {
          name,
          status: success ? 'healthy' : 'unhealthy',
          message: success ? 'Connected' : 'Connection failed',
          latencyMs,
        };
      } catch (error) {
        return {
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Check failed',
        };
      }
    };
  }
}
