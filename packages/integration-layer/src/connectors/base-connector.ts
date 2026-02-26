/**
 * Base Connector with Circuit Breaker, Rate Limiting, and Retry Logic
 *
 * All enterprise connectors extend this base class for consistent
 * fault tolerance and observability patterns.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
// @ts-expect-error - opossum lacks type declarations
import CircuitBreaker from 'opossum';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../monitoring/logger.js';
import type { IntegrationConfig, ConnectorHealth, AuthConfig } from '../types.js';
import { DEFAULT_CIRCUIT_BREAKER_CONFIG, DEFAULT_RATE_LIMIT_CONFIG } from '../config.js';

export abstract class BaseConnector {
  protected readonly name: string;
  protected readonly client: AxiosInstance;
  protected readonly circuitBreaker: CircuitBreaker;
  protected readonly rateLimiter: RateLimiterMemory;
  protected health: ConnectorHealth;
  protected authConfig?: AuthConfig;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(name: string, config: IntegrationConfig) {
    this.name = name;
    this.authConfig = config.auth;

    // Initialize axios client
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Initialize circuit breaker
    const cbConfig = config.circuitBreaker ?? DEFAULT_CIRCUIT_BREAKER_CONFIG;
    this.circuitBreaker = new CircuitBreaker(
      async (requestFn: () => Promise<AxiosResponse>) => requestFn(),
      {
        timeout: cbConfig.timeout,
        errorThresholdPercentage: cbConfig.errorThresholdPercentage,
        resetTimeout: cbConfig.resetTimeout,
        volumeThreshold: cbConfig.volumeThreshold,
      }
    );

    // Circuit breaker event handlers
    this.circuitBreaker.on('open', () => {
      logger.warn(`[${this.name}] Circuit breaker OPENED`);
      this.health.circuitState = 'open';
    });

    this.circuitBreaker.on('close', () => {
      logger.info(`[${this.name}] Circuit breaker CLOSED`);
      this.health.circuitState = 'closed';
    });

    this.circuitBreaker.on('halfOpen', () => {
      logger.info(`[${this.name}] Circuit breaker HALF-OPEN`);
      this.health.circuitState = 'half-open';
    });

    // Initialize rate limiter
    const rlConfig = config.rateLimit ?? DEFAULT_RATE_LIMIT_CONFIG;
    this.rateLimiter = new RateLimiterMemory({
      points: rlConfig.points,
      duration: rlConfig.duration,
      blockDuration: rlConfig.blockDuration,
    });

    // Initialize health status
    this.health = {
      status: 'healthy',
      latencyMs: 0,
      lastCheck: new Date(),
      errorCount: 0,
      circuitState: 'closed',
    };
  }

  /**
   * Execute a request with circuit breaker and rate limiting
   */
  protected async execute<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    operation: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Check rate limit
      await this.rateLimiter.consume(operation);

      // Execute with circuit breaker
      const response = await this.circuitBreaker.fire(requestFn);

      // Update health metrics
      this.health.latencyMs = Date.now() - startTime;
      this.health.lastCheck = new Date();
      this.health.status = 'healthy';

      logger.debug(`[${this.name}] ${operation} completed in ${this.health.latencyMs}ms`);

      return response.data;
    } catch (error) {
      this.health.errorCount++;
      this.health.status = this.health.errorCount > 5 ? 'unhealthy' : 'degraded';

      logger.error(`[${this.name}] ${operation} failed:`, error);
      throw error;
    }
  }

  /**
   * Get or refresh access token
   *
   * PLACEHOLDER: Implement actual OAuth2/SAML token refresh logic
   * based on the specific integration requirements.
   */
  protected async getAccessToken(): Promise<string | undefined> {
    if (!this.authConfig) return undefined;

    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    // PLACEHOLDER: Token refresh logic
    // In production, implement actual token refresh based on auth type
    switch (this.authConfig.type) {
      case 'oauth2':
        // TODO: Implement OAuth2 token refresh
        logger.info(`[${this.name}] OAuth2 token refresh required`);
        break;
      case 'api_key':
        this.accessToken = this.authConfig.credentials.apiKey;
        break;
      case 'basic':
        // Basic auth handled in request config
        break;
      case 'jwt':
        // TODO: Implement JWT token generation
        break;
      case 'saml':
        // TODO: Implement SAML assertion
        break;
    }

    return this.accessToken;
  }

  /**
   * Get connector health status
   */
  getHealth(): ConnectorHealth {
    return { ...this.health };
  }

  /**
   * Test connectivity to the integration endpoint
   */
  abstract testConnection(): Promise<boolean>;
}
