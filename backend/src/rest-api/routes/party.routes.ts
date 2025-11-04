import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PartyService } from '../../services/party.service.js';
import '../types.js'; // Import Fastify type extensions

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
}

const createPartySchema = z.object({
  name: z.string().min(3).max(100).optional(),
});

const joinPartySchema = z.object({
  code: z.string().length(6).regex(/^\d+$/),
});

export default async function partyRoutes(fastify: FastifyInstance) {
  // Create a new party
  fastify.post('/', {
    onRequest: [(fastify as any).authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = parseInt((request as AuthenticatedRequest).user.sub);
      const body = createPartySchema.parse(request.body);

      const party = await PartyService.createParty(userId, body.name);

      reply.code(201).send({
        success: true,
        data: {
          id: party.id,
          code: party.code,
          name: party.name,
          leader_id: party.leader_id,
          created_at: party.created_at,
          expires_at: party.expires_at,
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

  // Join a party by code
  fastify.post('/join', {
    onRequest: [(fastify as any).authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = parseInt((request as AuthenticatedRequest).user.sub);
      const body = joinPartySchema.parse(request.body);

      // Find party by code
      const party = await PartyService.getPartyByCode(body.code);

      if (!party) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PARTY_NOT_FOUND',
            message: 'Party not found or expired',
          },
        });
      }

      // Join party
      try {
        await PartyService.joinParty(party.id, userId);

        // Get full party state
        const partyState = await PartyService.getPartyState(party.id);

        reply.send({
          success: true,
          data: partyState,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Party is full') {
          return reply.code(409).send({
            success: false,
            error: {
              code: 'PARTY_FULL',
              message: 'Party has reached maximum capacity',
            },
          });
        }
        throw error;
      }
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

  // Get party details
  fastify.get('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = parseInt((request as AuthenticatedRequest).user.sub);
    const partyId = parseInt(request.params.id);

    // Check if user is in party
    const isMember = await PartyService.isUserInParty(partyId, userId);

    if (!isMember) {
      return reply.code(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not a member of this party',
        },
      });
    }

    // Get party state
    const partyState = await PartyService.getPartyState(partyId);

    if (!partyState) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'PARTY_NOT_FOUND',
          message: 'Party not found',
        },
      });
    }

    reply.send({
      success: true,
      data: partyState,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave a party
  fastify.delete('/:id/leave', {
    onRequest: [(fastify as any).authenticate],
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = parseInt((request as AuthenticatedRequest).user.sub);
    const partyId = parseInt(request.params.id);

    // Check if user is in party
    const isMember = await PartyService.isUserInParty(partyId, userId);

    if (!isMember) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'NOT_IN_PARTY',
          message: 'You are not a member of this party',
        },
      });
    }

    // Leave party
    await PartyService.leaveParty(partyId, userId);

    reply.send({
      success: true,
      data: {
        message: 'Successfully left party',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Get user's active parties
  fastify.get('/my/parties', {
    onRequest: [(fastify as any).authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = parseInt((request as AuthenticatedRequest).user.sub);

    const parties = await PartyService.getUserParties(userId);

    reply.send({
      success: true,
      data: parties,
      timestamp: new Date().toISOString(),
    });
  });
}
