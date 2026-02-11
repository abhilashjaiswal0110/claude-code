/**
 * Request Tracer
 *
 * Distributed tracing for request tracking across services.
 * Compatible with OpenTelemetry and Jaeger.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.js';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
  baggage: Record<string, string>;
}

export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'ok' | 'error';
  tags: Record<string, string | number | boolean>;
  logs: Array<{ timestamp: Date; message: string; fields?: Record<string, unknown> }>;
}

export class RequestTracer {
  private activeSpans: Map<string, Span> = new Map();
  private completedSpans: Span[] = [];
  private maxCompletedSpans = 1000;

  /**
   * Start a new trace
   */
  startTrace(operationName: string, parentContext?: TraceContext): TraceContext {
    const traceId = parentContext?.traceId ?? uuidv4().replace(/-/g, '');
    const spanId = uuidv4().replace(/-/g, '').substring(0, 16);

    const span: Span = {
      spanId,
      traceId,
      parentSpanId: parentContext?.spanId,
      operationName,
      startTime: new Date(),
      status: 'ok',
      tags: {},
      logs: [],
    };

    this.activeSpans.set(spanId, span);

    logger.debug(`[Tracer] Started span: ${operationName}`, { traceId, spanId });

    return {
      traceId,
      spanId,
      parentSpanId: parentContext?.spanId,
      sampled: true,
      baggage: parentContext?.baggage ?? {},
    };
  }

  /**
   * Start a child span
   */
  startSpan(operationName: string, parentContext: TraceContext): TraceContext {
    return this.startTrace(operationName, parentContext);
  }

  /**
   * Add tag to span
   */
  addTag(spanId: string, key: string, value: string | number | boolean): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  /**
   * Add log to span
   */
  addLog(spanId: string, message: string, fields?: Record<string, unknown>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: new Date(),
        message,
        fields,
      });
    }
  }

  /**
   * Set span error status
   */
  setError(spanId: string, error: Error): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.status = 'error';
      span.tags['error'] = true;
      span.tags['error.message'] = error.message;
      span.tags['error.type'] = error.name;
    }
  }

  /**
   * End span
   */
  endSpan(spanId: string): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();

    this.activeSpans.delete(spanId);
    this.completedSpans.push(span);

    // Trim completed spans if at or over limit
    if (this.completedSpans.length >= this.maxCompletedSpans) {
      this.completedSpans = this.completedSpans.slice(-this.maxCompletedSpans + 1);
    }

    logger.debug(`[Tracer] Ended span: ${span.operationName}`, {
      traceId: span.traceId,
      spanId,
      duration: span.duration,
    });

    return span;
  }

  /**
   * Get active spans
   */
  getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  /**
   * Get completed spans for a trace
   */
  getTraceSpans(traceId: string): Span[] {
    return this.completedSpans.filter((s) => s.traceId === traceId);
  }

  /**
   * Extract trace context from headers
   */
  extractContext(headers: Record<string, string | undefined>): TraceContext | undefined {
    // Support W3C Trace Context format
    const traceparent = headers['traceparent'];
    if (traceparent) {
      const parts = traceparent.split('-');
      if (parts.length === 4) {
        return {
          traceId: parts[1],
          spanId: parts[2],
          sampled: parts[3] === '01',
          baggage: {},
        };
      }
    }

    // Support custom header format
    const traceId = headers['x-trace-id'];
    const spanId = headers['x-span-id'];
    if (traceId) {
      return {
        traceId,
        spanId: spanId ?? uuidv4().replace(/-/g, '').substring(0, 16),
        sampled: true,
        baggage: {},
      };
    }

    return undefined;
  }

  /**
   * Inject trace context into headers
   */
  injectContext(context: TraceContext, headers: Record<string, string>): void {
    // W3C Trace Context format
    headers['traceparent'] = `00-${context.traceId}-${context.spanId}-${context.sampled ? '01' : '00'}`;

    // Custom headers for compatibility
    headers['x-trace-id'] = context.traceId;
    headers['x-span-id'] = context.spanId;
  }
}
