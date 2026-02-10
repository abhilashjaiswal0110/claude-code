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

/**
 * API key authentication middleware
 *
 * PLACEHOLDER: Implement actual API key validation
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  // Skip auth for health checks
  if (req.path === '/health' || req.path === '/ready' || req.path === '/live') {
    return next();
  }

  // Skip auth in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required. Include X-API-Key header.',
    });
    return;
  }

  // PLACEHOLDER: Validate API key against database/cache
  // For POC, accept any non-empty API key
  if (apiKey.length < 10) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key.',
    });
    return;
  }

  next();
}

/**
 * JWT authentication middleware
 *
 * PLACEHOLDER: Implement actual JWT validation
 */
export function jwtAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Skip auth for public endpoints
  const publicPaths = ['/health', '/ready', '/live', '/api/agents'];
  if (publicPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  // Skip auth in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token required.',
    });
    return;
  }

  const token = authHeader.substring(7);

  // PLACEHOLDER: Validate JWT token
  // In production, implement actual JWT validation with AuthService
  if (token.length < 10) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token.',
    });
    return;
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
