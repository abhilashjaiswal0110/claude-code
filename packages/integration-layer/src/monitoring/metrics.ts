/**
 * Metrics Collector
 *
 * Collects and exposes application metrics for monitoring.
 * Compatible with Prometheus/Grafana stack.
 */

import { logger } from './logger.js';

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
}

interface HistogramBucket {
  le: number;
  count: number;
}

export class MetricsCollector {
  private counters: Map<string, { value: number; labels: Record<string, string> }> = new Map();
  private gauges: Map<string, { value: number; labels: Record<string, string> }> = new Map();
  private histograms: Map<string, { sum: number; count: number; buckets: HistogramBucket[] }> = new Map();

  private readonly defaultBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

  constructor() {
    // Initialize default metrics
    this.initializeDefaultMetrics();
  }

  private initializeDefaultMetrics(): void {
    // Agent execution metrics
    this.createCounter('agent_executions_total', { agent: '', mode: '', status: '' });
    this.createHistogram('agent_execution_duration_seconds', { agent: '', mode: '' });
    this.createGauge('agent_active_sessions', { agent: '' });

    // Integration metrics
    this.createCounter('integration_requests_total', { connector: '', operation: '', status: '' });
    this.createHistogram('integration_request_duration_seconds', { connector: '', operation: '' });
    this.createGauge('integration_circuit_breaker_state', { connector: '' });

    // Cache metrics
    this.createCounter('cache_operations_total', { operation: '', status: '' });
    this.createGauge('cache_size', {});

    // API metrics
    this.createCounter('http_requests_total', { method: '', path: '', status: '' });
    this.createHistogram('http_request_duration_seconds', { method: '', path: '' });

    logger.info('[MetricsCollector] Default metrics initialized');
  }

  private getKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  /**
   * Create a counter metric
   */
  createCounter(name: string, labels: Record<string, string>): void {
    const key = this.getKey(name, labels);
    if (!this.counters.has(key)) {
      this.counters.set(key, { value: 0, labels });
    }
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, labels: Record<string, string>, value = 1): void {
    const key = this.getKey(name, labels);
    const counter = this.counters.get(key);

    if (counter) {
      counter.value += value;
    } else {
      this.counters.set(key, { value, labels });
    }
  }

  /**
   * Create a gauge metric
   */
  createGauge(name: string, labels: Record<string, string>): void {
    const key = this.getKey(name, labels);
    if (!this.gauges.has(key)) {
      this.gauges.set(key, { value: 0, labels });
    }
  }

  /**
   * Set a gauge value
   */
  setGauge(name: string, labels: Record<string, string>, value: number): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, { value, labels });
  }

  /**
   * Create a histogram metric
   */
  createHistogram(name: string, labels: Record<string, string>, buckets = this.defaultBuckets): void {
    const key = this.getKey(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, {
        sum: 0,
        count: 0,
        buckets: buckets.map((le) => ({ le, count: 0 })),
      });
    }
  }

  /**
   * Observe a histogram value
   */
  observeHistogram(name: string, labels: Record<string, string>, value: number): void {
    const key = this.getKey(name, labels);
    let histogram = this.histograms.get(key);

    if (!histogram) {
      histogram = {
        sum: 0,
        count: 0,
        buckets: this.defaultBuckets.map((le) => ({ le, count: 0 })),
      };
      this.histograms.set(key, histogram);
    }

    histogram.sum += value;
    histogram.count++;

    for (const bucket of histogram.buckets) {
      if (value <= bucket.le) {
        bucket.count++;
      }
    }
  }

  /**
   * Record agent execution
   */
  recordAgentExecution(agent: string, mode: string, durationMs: number, success: boolean): void {
    this.incrementCounter('agent_executions_total', {
      agent,
      mode,
      status: success ? 'success' : 'error',
    });

    this.observeHistogram('agent_execution_duration_seconds', { agent, mode }, durationMs / 1000);
  }

  /**
   * Record integration request
   */
  recordIntegrationRequest(
    connector: string,
    operation: string,
    durationMs: number,
    success: boolean
  ): void {
    this.incrementCounter('integration_requests_total', {
      connector,
      operation,
      status: success ? 'success' : 'error',
    });

    this.observeHistogram('integration_request_duration_seconds', { connector, operation }, durationMs / 1000);
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method: string, path: string, status: number, durationMs: number): void {
    this.incrementCounter('http_requests_total', {
      method,
      path,
      status: String(status),
    });

    this.observeHistogram('http_request_duration_seconds', { method, path }, durationMs / 1000);
  }

  /**
   * Export metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    // Export counters
    for (const [key, { value }] of this.counters) {
      lines.push(`${key} ${value}`);
    }

    // Export gauges
    for (const [key, { value }] of this.gauges) {
      lines.push(`${key} ${value}`);
    }

    // Export histograms
    for (const [key, { sum, count, buckets }] of this.histograms) {
      const baseName = key.split('{')[0];
      const labelStr = key.includes('{') ? key.slice(key.indexOf('{')) : '{}';

      for (const bucket of buckets) {
        // Insert le label before the closing brace - use lastIndexOf to handle nested braces
        const lastBrace = labelStr.lastIndexOf('}');
        const bucketLabels = lastBrace >= 0
          ? `${labelStr.slice(0, lastBrace)},le="${bucket.le}"}`
          : `{le="${bucket.le}"}`;
        lines.push(`${baseName}_bucket${bucketLabels} ${bucket.count}`);
      }
      lines.push(`${baseName}_sum${labelStr} ${sum}`);
      lines.push(`${baseName}_count${labelStr} ${count}`);
    }

    return lines.join('\n');
  }

  /**
   * Extract metric name from key (format: "name{labels}")
   */
  private extractMetricName(key: string): string {
    const braceIndex = key.indexOf('{');
    return braceIndex > 0 ? key.substring(0, braceIndex) : key;
  }

  /**
   * Get metrics as JSON
   */
  getMetricsJson(): Metric[] {
    const metrics: Metric[] = [];
    const now = new Date();

    for (const [key, { value, labels }] of this.counters) {
      metrics.push({
        name: this.extractMetricName(key),
        type: 'counter',
        value,
        labels,
        timestamp: now,
      });
    }

    for (const [key, { value, labels }] of this.gauges) {
      metrics.push({
        name: this.extractMetricName(key),
        type: 'gauge',
        value,
        labels,
        timestamp: now,
      });
    }

    return metrics;
  }
}
