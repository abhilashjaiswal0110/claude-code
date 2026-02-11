/**
 * Audit Logger
 *
 * Comprehensive audit logging for compliance and security.
 * Tracks user actions, data access, and system events.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.js';
import type { AuditLog } from '../types.js';

export type AuditAction =
  | 'agent.execute'
  | 'agent.configure'
  | 'session.create'
  | 'session.delete'
  | 'data.read'
  | 'data.write'
  | 'data.delete'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed'
  | 'permission.denied'
  | 'config.change'
  | 'integration.access';

export interface AuditContext {
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  traceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  private logs: AuditLog[] = [];
  private maxLogs = 10000;
  private persistFn?: (log: AuditLog) => Promise<void>;

  constructor(options?: {
    maxLogs?: number;
    persistFn?: (log: AuditLog) => Promise<void>;
  }) {
    if (options?.maxLogs) this.maxLogs = options.maxLogs;
    if (options?.persistFn) this.persistFn = options.persistFn;
  }

  /**
   * Log an audit event
   */
  async log(
    action: AuditAction,
    resource: string,
    context: AuditContext,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date(),
      action,
      actor: context.userEmail ?? context.userId ?? 'system',
      resource,
      details: {
        ...details,
        sessionId: context.sessionId,
        traceId: context.traceId,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    // Add to in-memory log
    this.logs.push(auditLog);

    // Trim if over limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to main logger
    logger.info(`[Audit] ${action} on ${resource} by ${auditLog.actor}`, {
      auditId: auditLog.id,
      ...details,
    });

    // Persist if configured
    if (this.persistFn) {
      try {
        await this.persistFn(auditLog);
      } catch (error) {
        logger.error('[Audit] Failed to persist audit log:', error);
      }
    }
  }

  /**
   * Log agent execution
   */
  async logAgentExecution(
    agentId: string,
    mode: string,
    context: AuditContext,
    details: { input?: string; success: boolean; durationMs?: number }
  ): Promise<void> {
    await this.log('agent.execute', `agents/${agentId}/${mode}`, context, details);
  }

  /**
   * Log data access
   */
  async logDataAccess(
    resource: string,
    operation: 'read' | 'write' | 'delete',
    context: AuditContext,
    details?: Record<string, unknown>
  ): Promise<void> {
    const action: AuditAction = `data.${operation}`;
    await this.log(action, resource, context, details);
  }

  /**
   * Log authentication event
   */
  async logAuth(
    event: 'login' | 'logout' | 'failed',
    context: AuditContext,
    details?: { reason?: string }
  ): Promise<void> {
    const action: AuditAction = `auth.${event}`;
    await this.log(action, 'auth', context, details);
  }

  /**
   * Log permission denied
   */
  async logPermissionDenied(
    resource: string,
    context: AuditContext,
    details: { requiredPermission: string }
  ): Promise<void> {
    await this.log('permission.denied', resource, context, details);
  }

  /**
   * Log integration access
   */
  async logIntegrationAccess(
    integration: string,
    operation: string,
    context: AuditContext,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.log('integration.access', `integrations/${integration}`, context, {
      operation,
      ...details,
    });
  }

  /**
   * Query audit logs
   */
  query(filter: {
    action?: AuditAction;
    actor?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLog[] {
    let results = this.logs;

    if (filter.action) {
      results = results.filter((l) => l.action === filter.action);
    }

    if (filter.actor) {
      results = results.filter((l) => l.actor === filter.actor);
    }

    if (filter.resource) {
      results = results.filter((l) => l.resource.includes(filter.resource));
    }

    if (filter.startDate) {
      results = results.filter((l) => l.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      results = results.filter((l) => l.timestamp <= filter.endDate!);
    }

    if (filter.limit) {
      results = results.slice(-filter.limit);
    }

    return results;
  }

  /**
   * Get recent logs for user
   */
  getRecentForUser(userId: string, limit = 100): AuditLog[] {
    return this.query({ actor: userId, limit });
  }

  /**
   * Get security events (failed auth, permission denied)
   */
  getSecurityEvents(limit = 100): AuditLog[] {
    return this.logs
      .filter((l) => l.action === 'auth.failed' || l.action === 'permission.denied')
      .slice(-limit);
  }

  /**
   * Export logs as JSON
   */
  export(filter?: Parameters<typeof this.query>[0]): string {
    const logs = filter ? this.query(filter) : this.logs;
    return JSON.stringify(logs, null, 2);
  }
}
