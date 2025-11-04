import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../database/connection.js';
import { redis } from '../../database/redis.js';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    redis: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
  };
  uptime: number;
  version: string;
}

export default async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const dbHealth = await db.healthCheck();
    const redisHealth = await redis.healthCheck();

    const isHealthy = dbHealth.status === 'up' && redisHealth.status === 'up';

    const response: HealthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
      uptime: process.uptime(),
      version: '1.0.0',
    };

    reply.code(isHealthy ? 200 : 503).send(response);
  });

  // Readiness probe
  fastify.get('/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    const dbHealth = await db.healthCheck();
    const redisHealth = await redis.healthCheck();

    if (dbHealth.status === 'up' && redisHealth.status === 'up') {
      reply.code(200).send({ status: 'ready' });
    } else {
      reply.code(503).send({ status: 'not ready' });
    }
  });

  // Liveness probe
  fastify.get('/live', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.code(200).send({ status: 'alive' });
  });
}
