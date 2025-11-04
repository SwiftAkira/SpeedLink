import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';
import jwt from '@fastify/jwt';
import { serverConfig, jwtConfig, getCorsOrigins } from '../config.js';
import { requestLogger, logger } from '../utils/logger.js';
import { db } from '../database/connection.js';
import { redis } from '../database/redis.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import partyRoutes from './routes/party.routes.js';
import healthRoutes from './routes/health.routes.js';

/**
 * Create and configure Fastify server
 */
export async function createServer() {
  const fastify = Fastify({
    logger: requestLogger,
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  });

  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Allow for development
  });

  await fastify.register(cors, {
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(compress, {
    encodings: ['gzip', 'deflate'],
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
  });

  await fastify.register(jwt, {
    secret: jwtConfig.secret,
  });

  // Authentication decorator
  fastify.decorate('authenticate', async function(request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }
  });

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/api/v1/health' });
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(userRoutes, { prefix: '/api/v1/user' });
  await fastify.register(partyRoutes, { prefix: '/api/v1/party' });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    logger.error({
      type: 'unhandled_error',
      error: error.message,
      stack: error.stack,
      path: request.url,
      method: request.method,
    });

    reply.code(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
      timestamp: new Date().toISOString(),
    });
  });

  return fastify;
}

/**
 * Start the REST API server
 */
export async function startServer() {
  try {
    // Connect to databases
    await redis.connect();
    logger.info('✅ Redis connected');

    const dbHealth = await db.healthCheck();
    if (dbHealth.status !== 'up') {
      throw new Error(`Database health check failed: ${dbHealth.error}`);
    }
    logger.info('✅ PostgreSQL connected');

    // Create and start server
    const fastify = await createServer();

    await fastify.listen({
      port: serverConfig.restApi.port,
      host: serverConfig.restApi.host,
    });

    logger.info(`🚀 REST API server listening on ${serverConfig.restApi.host}:${serverConfig.restApi.port}`);

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Shutting down REST API server...');
      await fastify.close();
      await redis.close();
      await db.close();
      logger.info('REST API server shut down complete');
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error({
      type: 'server_start_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

// Start server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
