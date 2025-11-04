import pino from 'pino';
import { config } from '../config.js';

/**
 * Structured logger using Pino
 * Provides high-performance logging with structured output
 */
export const logger = pino.default({
  level: config.LOG_LEVEL,
  transport: config.LOG_PRETTY_PRINT
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: config.NODE_ENV,
  },
});

/**
 * Create a child logger with additional context
 */
export const createLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

/**
 * Request logger for Fastify
 */
export const requestLogger = {
  logger: logger,
  disableRequestLogging: false,
  customLogLevel: (_req: any, res: any, _err: any) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'info';
    return 'debug';
  },
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      hostname: req.hostname,
      remoteAddress: req.ip,
      remotePort: req.socket?.remotePort,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
    }),
  },
};
