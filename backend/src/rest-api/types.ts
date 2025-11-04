/**
 * Fastify Type Extensions
 * Extends Fastify JWT to use our JWTPayload type
 */

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      iat: number;
      exp: number;
    };
    user: {
      sub: string;
      email: string;
      iat: number;
      exp: number;
    };
  }
}
