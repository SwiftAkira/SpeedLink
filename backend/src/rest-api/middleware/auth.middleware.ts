import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../services/auth.service.js';
import { logger } from '../../utils/logger.js';
import { redis } from '../../database/redis.js';

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user information to request
 */

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user?: AuthUser;
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token is required',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = AuthService.verifyAccessToken(token);

    if (!payload) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Check if token is blacklisted (revoked)
    const client = redis.getClient();
    const isBlacklisted = await client.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      logger.warn({
        type: 'blacklisted_token_used',
        userId: payload.sub,
        ip: request.ip,
      });

      return reply.code(401).send({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Token has been revoked',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Attach user info to request
    request.user = {
      id: parseInt(payload.sub),
      email: payload.email,
    };

    // Log authentication success
    logger.debug({
      type: 'auth_success',
      userId: request.user.id,
      endpoint: request.url,
      method: request.method,
    });

  } catch (error) {
    logger.error({
      type: 'auth_middleware_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return reply.code(500).send({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Optional authentication - attach user if token is valid, but don't require it
 */
export async function optionalAuthenticate(
  request: AuthenticatedRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return; // No token provided, that's okay
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyAccessToken(token);

    if (payload) {
      const client = redis.getClient();
      const isBlacklisted = await client.exists(`blacklist:${token}`);
      if (!isBlacklisted) {
        request.user = {
          id: parseInt(payload.sub),
          email: payload.email,
        };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug({
      type: 'optional_auth_failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Check if user matches the requested user ID (for profile operations)
 */
export function requireSelfOrAdmin(
  request: AuthenticatedRequest,
  reply: FastifyReply,
  userId: number
): boolean {
  if (!request.user) {
    reply.code(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
      timestamp: new Date().toISOString(),
    });
    return false;
  }

  if (request.user.id !== userId) {
    reply.code(403).send({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied - you can only modify your own profile',
      },
      timestamp: new Date().toISOString(),
    });
    return false;
  }

  return true;
}

/**
 * Rate limiting per user (prevents abuse from authenticated users)
 */
export async function userRateLimit(
  request: AuthenticatedRequest,
  reply: FastifyReply,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<boolean> {
  if (!request.user) {
    return true; // Not authenticated, global rate limit applies
  }

  const client = redis.getClient();
  const key = `rate_limit:user:${request.user.id}`;
  const current = await client.incr(key);

  if (current === 1) {
    await client.expire(key, windowSeconds);
  }

  if (current > limit) {
    logger.warn({
      type: 'user_rate_limit_exceeded',
      userId: request.user.id,
      limit,
      windowSeconds,
    });

    reply.code(429).send({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
      timestamp: new Date().toISOString(),
    });
    return false;
  }

  return true;
}

/**
 * Validate request origin and prevent CSRF attacks
 */
export function validateOrigin(
  request: FastifyRequest,
  reply: FastifyReply,
  allowedOrigins: string[]
): boolean {
  const origin = request.headers.origin;
  const referer = request.headers.referer;

  // For non-browser clients, origin/referer might not be present
  if (!origin && !referer) {
    return true;
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
    logger.warn({
      type: 'invalid_origin',
      origin: requestOrigin,
      ip: request.ip,
    });

    reply.code(403).send({
      success: false,
      error: {
        code: 'INVALID_ORIGIN',
        message: 'Request origin not allowed',
      },
      timestamp: new Date().toISOString(),
    });
    return false;
  }

  return true;
}
