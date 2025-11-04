/**
 * Fastify Type Augmentation
 * Extends Fastify types with custom auth properties
 */

import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
    };
  }
}
