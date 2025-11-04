import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../../database/connection.js';
import type { UserProfile } from '../../shared/types.js';
import '../types.js'; // Import Fastify type extensions

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
}

const updateUserSchema = z.object({
  display_name: z.string().min(3).max(100).optional(),
  vehicle_type: z.enum(['motorcycle', 'car', 'truck', 'other']).optional(),
  privacy_mode: z.enum(['visible', 'hidden']).optional(),
});

export default async function userRoutes(fastify: FastifyInstance) {
  // Get user profile
  fastify.get('/profile', {
    onRequest: [(fastify as any).authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = parseInt((request as AuthenticatedRequest).user.sub);

    const result = await db.query<UserProfile>(`
      SELECT id, email, display_name, vehicle_type, privacy_mode, created_at
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

    reply.send({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  });

  // Update user profile
  fastify.put('/profile', {
    onRequest: [(fastify as any).authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = parseInt((request as AuthenticatedRequest).user.sub);
      const body = updateUserSchema.parse(request.body);

      if (Object.keys(body).length === 0) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update',
          },
        });
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (body.display_name) {
        updates.push(`display_name = $${paramIndex++}`);
        values.push(body.display_name);
      }
      if (body.vehicle_type) {
        updates.push(`vehicle_type = $${paramIndex++}`);
        values.push(body.vehicle_type);
      }
      if (body.privacy_mode) {
        updates.push(`privacy_mode = $${paramIndex++}`);
        values.push(body.privacy_mode);
      }

      values.push(userId);

      const result = await db.query<UserProfile>(`
        UPDATE users
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING id, email, display_name, vehicle_type, privacy_mode, created_at, updated_at
      `, values);

      reply.send({
        success: true,
        data: result.rows[0],
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
}
