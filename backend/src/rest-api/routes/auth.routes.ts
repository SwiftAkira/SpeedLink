import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../../database/connection.js';
import { AuthService } from '../../services/auth.service.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { AuthResponse, UserProfile } from '../../shared/types.js';

// Request schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  display_name: z.string().min(3).max(100).optional(),
  vehicle_type: z.enum(['motorcycle', 'car', 'truck', 'other']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Register new user
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = registerSchema.parse(request.body);

      // Check if user already exists
      const existing = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [body.email]
      );

      if ((existing.rowCount ?? 0) > 0) {
        return reply.code(409).send({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists',
          },
        });
      }

      // Hash password
      const password_hash = await AuthService.hashPassword(body.password);

      // Create user
      const result = await db.query<UserProfile>(`
        INSERT INTO users (email, password_hash, display_name, vehicle_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, display_name, vehicle_type, privacy_mode, created_at
      `, [
        body.email,
        password_hash,
        body.display_name || body.email.split('@')[0],
        body.vehicle_type || 'other',
      ]);

      const user = result.rows[0]!;

      // Generate tokens
      const tokens = await AuthService.generateAuthTokens(user.id, user.email);

      const response: AuthResponse = {
        userId: user.id,
        email: user.email,
        display_name: user.display_name,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };

      reply.code(201).send({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = loginSchema.parse(request.body);

      // Find user
      const result = await db.query<UserProfile & { password_hash: string }>(`
        SELECT id, email, password_hash, display_name, vehicle_type, privacy_mode, created_at
        FROM users
        WHERE email = $1
      `, [body.email]);

      if (result.rowCount === 0) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      const user = result.rows[0]!;

      // Verify password
      const isValidPassword = await AuthService.verifyPassword(
        body.password,
        user.password_hash
      );

      if (!isValidPassword) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      // Generate tokens
      const tokens = await AuthService.generateAuthTokens(user.id, user.email);

      const response: AuthResponse = {
        userId: user.id,
        email: user.email,
        display_name: user.display_name,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };

      reply.code(200).send({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = refreshSchema.parse(request.body);

      // Verify refresh token
      const userId = await AuthService.verifyRefreshToken(body.refreshToken);

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
      }

      // Get user
      const result = await db.query<UserProfile>(`
        SELECT id, email, display_name
        FROM users
        WHERE id = $1
      `, [userId]);

      if (result.rowCount === 0) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const user = result.rows[0]!;

      // Generate new tokens
      const tokens = await AuthService.generateAuthTokens(user.id, user.email);

      reply.code(200).send({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  // Logout (revoke current session)
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const authReq = request as AuthenticatedRequest;
    // Authenticate first
    await authenticate(authReq, reply);
    if (reply.sent) return;

    try {
      const body = z.object({
        refreshToken: z.string(),
      }).parse(authReq.body);

      // Revoke refresh token
      await AuthService.revokeRefreshToken(body.refreshToken);

      // Blacklist access token
      const authHeader = authReq.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.substring(7);
        await AuthService.blacklistToken(accessToken, 900); // 15 minutes
      }

      // Log logout event
      if (authReq.user) {
        await AuthService.logAuthEvent(authReq.user.id, 'logout', {
          ip: authReq.ip,
          userAgent: authReq.headers['user-agent'],
        });
      }

      reply.code(200).send({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  // Logout from all devices
  fastify.post('/logout-all', async (request: FastifyRequest, reply: FastifyReply) => {
    const authReq = request as AuthenticatedRequest;
    // Authenticate first
    await authenticate(authReq, reply);
    if (reply.sent) return;

    if (!authReq.user) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // Revoke all refresh tokens
    await AuthService.revokeAllUserTokens(authReq.user.id);

    // Blacklist current access token
    const authHeader = authReq.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      await AuthService.blacklistToken(accessToken, 900);
    }

    // Log logout event
    await AuthService.logAuthEvent(authReq.user.id, 'logout', {
      type: 'all_devices',
      ip: authReq.ip,
      userAgent: authReq.headers['user-agent'],
    });

    reply.code(200).send({
      success: true,
      message: 'Logged out from all devices successfully',
      timestamp: new Date().toISOString(),
    });
  });

  // Get active sessions
  fastify.get('/sessions', async (request: FastifyRequest, reply: FastifyReply) => {
    const authReq = request as AuthenticatedRequest;
    // Authenticate first
    await authenticate(authReq, reply);
    if (reply.sent) return;

    if (!authReq.user) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const sessions = await AuthService.getUserSessions(authReq.user.id);

    reply.code(200).send({
      success: true,
      data: {
        sessions,
        count: sessions.length,
      },
      timestamp: new Date().toISOString(),
    });
  });
}
