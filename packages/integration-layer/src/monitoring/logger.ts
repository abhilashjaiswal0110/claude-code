/**
 * Structured Logger
 *
 * Production-ready logging with structured output,
 * log levels, and optional JSON formatting.
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL ?? 'info';
const logFormat = process.env.LOG_FORMAT ?? 'simple'; // 'simple' | 'json'

const simpleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat === 'json' ? jsonFormat : simpleFormat,
  transports: [
    new winston.transports.Console(),
  ],
  defaultMeta: {
    service: 'enterprise-agents',
  },
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
    })
  );
}
