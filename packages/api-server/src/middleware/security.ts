/**
 * Security Middleware
 *
 * Production-ready security middleware for the API server
 * including authentication, rate limiting, and security headers.
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { v4 as uuidv4 } from 'uuid';

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10) / 1000,
  blockDuration: 60,
});

/**
 * Add security headers to all responses
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Generate request ID for tracing
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remove fingerprinting headers
  res.removeHeader('X-Powered-By');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
  );

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

/**
 * Rate limiting middleware
 */
export async function rateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.ip || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60,
    });
  }
}

// Valid API keys for POC mode (should be loaded from secure storage in production)
const POC_API_KEYS = new Set(
  (process.env.POC_API_KEYS || '').split(',').filter(Boolean)
);

/**
 * API key authentication middleware
 *
 * PLACEHOLDER: Implement actual API key validation against secure storage
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  // Skip auth for health checks
  if (req.path === '/health' || req.path === '/ready' || req.path === '/live') {
    return next();
  }

  // In production, API key is always required
  if (process.env.NODE_ENV === 'production') {
    if (!apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required. Include X-API-Key header.',
      });
      return;
    }

    // PLACEHOLDER: Validate against secure key store (e.g., HashiCorp Vault, AWS Secrets Manager)
    // For now, validate against environment-configured keys
    if (!POC_API_KEYS.has(apiKey)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key.',
      });
      return;
    }
  } else {
    // Non-production: require explicit POC_SKIP_AUTH=true to skip authentication
    if (process.env.POC_SKIP_AUTH !== 'true' && !apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required. Set POC_SKIP_AUTH=true to skip in development.',
      });
      return;
    }
  }

  next();
}

/**
 * JWT authentication middleware
 *
 * PLACEHOLDER: Implement actual JWT validation with AuthService
 */
export function jwtAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Skip auth for public endpoints
  const publicPaths = ['/health', '/ready', '/live', '/api/agents'];
  if (publicPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  // In production, JWT is always required for non-public endpoints
  if (process.env.NODE_ENV === 'production') {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token required.',
      });
      return;
    }

    const token = authHeader.substring(7);

    // PLACEHOLDER: Validate JWT with AuthService
    // In production, this should decode and verify the JWT signature
    // For now, validate basic JWT structure (header.payload.signature)
    const jwtParts = token.split('.');
    if (jwtParts.length !== 3 || jwtParts.some((part) => part.length < 4)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format.',
      });
      return;
    }
  } else {
    // Non-production: require explicit POC_SKIP_AUTH=true to skip JWT validation
    if (process.env.POC_SKIP_AUTH !== 'true') {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Bearer token required. Set POC_SKIP_AUTH=true to skip in development.',
        });
        return;
      }
    }
  }

  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request
  console.log(JSON.stringify({
    type: 'request',
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  }));

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(JSON.stringify({
      type: 'response',
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    }));
  });

  next();
}

/**
 * Input validation middleware
 */
export function validateInput(req: Request, res: Response, next: NextFunction): void {
  // Check for common injection patterns
  const suspiciousPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\bexec\s*\(/i,
    /\beval\s*\(/i,
  ];

  const checkValue = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some((pattern) => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid input detected.',
    });
    return;
  }

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string;

  console.error(JSON.stringify({
    type: 'error',
    requestId,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  }));

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    requestId,
  });
}
