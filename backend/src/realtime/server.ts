import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createHttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { serverConfig, getCorsOrigins } from '../config.js';
import { redis } from '../database/redis.js';
import { db } from '../database/connection.js';
import { logger } from '../utils/logger.js';
import { AuthService } from '../services/auth.service.js';
import { PartyService } from '../services/party.service.js';
import type {
  PartyCreateEvent,
  PartyJoinEvent,
  PartyUpdateEvent,
  PartyMessageEvent,
  LocationBroadcast,
  MessageBroadcast,
} from '../shared/types.js';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  email?: string;
}

/**
 * Create and configure Socket.IO server
 */
export async function createRealtimeServer() {
  const httpServer = createHttpServer();
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Setup Redis adapter for horizontal scaling
  const pubClient = redis.getClient();
  const subClient = redis.getSubscriber();
  io.adapter(createAdapter(pubClient, subClient));

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next: any) => {
    try {
      const token = socket.handshake.auth['token'] || socket.handshake.query['token'];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const payload = AuthService.verifyAccessToken(token as string);

      if (!payload) {
        return next(new Error('Invalid or expired token'));
      }

      // Attach user info to socket
      socket.userId = parseInt(payload.sub);
      socket.email = payload.email;

      logger.debug({
        type: 'socket_authenticated',
        userId: socket.userId,
        socketId: socket.id,
      });

      next();
    } catch (error) {
      logger.error({
        type: 'socket_auth_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    logger.info({
      type: 'socket_connected',
      userId,
      socketId: socket.id,
    });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Get user's active parties and rejoin them
    const userParties = await PartyService.getUserParties(userId);
    for (const party of userParties) {
      socket.join(`party:${party.id}`);
      await PartyService.updateMemberOnlineStatus(party.id, userId, true);
      
      // Broadcast user online status to party
      io.to(`party:${party.id}`).emit('party:member-online', {
        userId,
        timestamp: new Date().toISOString(),
      });
    }

    // Party create event
    socket.on('party:create', async (data: PartyCreateEvent) => {
      try {
        const party = await PartyService.createParty(userId, data.name);
        
        // Join party room
        socket.join(`party:${party.id}`);

        // Send party details to creator
        socket.emit('party:created', {
          id: party.id,
          code: party.code,
          name: party.name,
          leader_id: party.leader_id,
          created_at: party.created_at,
          expires_at: party.expires_at,
        });

        logger.info({
          type: 'party_created',
          partyId: party.id,
          userId,
        });
      } catch (error) {
        socket.emit('error', {
          code: 'PARTY_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create party',
        });
      }
    });

    // Party join event
    socket.on('party:join', async (data: PartyJoinEvent): Promise<void> => {
      try {
        const party = await PartyService.getPartyByCode(data.code);

        if (!party) {
          socket.emit('error', {
            code: 'PARTY_NOT_FOUND',
            message: 'Party not found or expired',
          });
          return;
        }

        // Join party
        await PartyService.joinParty(party.id, userId);
        
        // Join party room
        socket.join(`party:${party.id}`);

        // Get party state
        const partyState = await PartyService.getPartyState(party.id);

        // Send party state to user
        socket.emit('party:joined', partyState);

        // Broadcast to other party members
        socket.to(`party:${party.id}`).emit('party:member-joined', {
          userId,
          timestamp: new Date().toISOString(),
        });

        logger.info({
          type: 'party_joined',
          partyId: party.id,
          userId,
        });
      } catch (error) {
        socket.emit('error', {
          code: 'PARTY_JOIN_ERROR',
          message: error instanceof Error ? error.message : 'Failed to join party',
        });
      }
    });

    // Party leave event
    socket.on('party:leave', async (data: { partyId: number }) => {
      try {
        await PartyService.leaveParty(data.partyId, userId);
        
        // Leave party room
        socket.leave(`party:${data.partyId}`);

        // Broadcast to remaining party members
        socket.to(`party:${data.partyId}`).emit('party:member-left', {
          userId,
          timestamp: new Date().toISOString(),
        });

        socket.emit('party:left', {
          partyId: data.partyId,
          timestamp: new Date().toISOString(),
        });

        logger.info({
          type: 'party_left',
          partyId: data.partyId,
          userId,
        });
      } catch (error) {
        socket.emit('error', {
          code: 'PARTY_LEAVE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to leave party',
        });
      }
    });

    // Location update event
    socket.on('party:update', async (data: PartyUpdateEvent): Promise<void> => {
      try {
        // Verify user is in party
        const isMember = await PartyService.isUserInParty(data.partyId, userId);

        if (!isMember) {
          socket.emit('error', {
            code: 'NOT_IN_PARTY',
            message: 'You are not a member of this party',
          });
          return;
        }

        // Store location update in Redis
        await PartyService.storeLocationUpdate({
          userId,
          partyId: data.partyId,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          speed: data.location.speed,
          heading: data.location.heading,
          accuracy: data.location.accuracy,
          timestamp: new Date(),
        });

        // Get user info for broadcast
        const userResult = await db.query(
          'SELECT display_name FROM users WHERE id = $1',
          [userId]
        );

        const broadcast: LocationBroadcast = {
          userId,
          displayName: userResult.rows[0]?.display_name || 'Unknown',
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          speed: data.location.speed,
          heading: data.location.heading,
          accuracy: data.location.accuracy,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to all party members (including sender for confirmation)
        io.to(`party:${data.partyId}`).emit('party:location-update', broadcast);
      } catch (error) {
        socket.emit('error', {
          code: 'LOCATION_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update location',
        });
      }
    });

    // Party message event
    socket.on('party:message', async (data: PartyMessageEvent): Promise<void> => {
      try {
        // Verify user is in party
        const isMember = await PartyService.isUserInParty(data.partyId, userId);

        if (!isMember) {
          socket.emit('error', {
            code: 'NOT_IN_PARTY',
            message: 'You are not a member of this party',
          });
          return;
        }

        // Store message in database
        const result = await db.query(
          `INSERT INTO party_messages (party_id, user_id, message)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [data.partyId, userId, data.message]
        );

        const messageId = result.rows[0]!.id;

        // Get user info for broadcast
        const userResult = await db.query(
          'SELECT display_name FROM users WHERE id = $1',
          [userId]
        );

        const broadcast: MessageBroadcast = {
          messageId,
          userId,
          displayName: userResult.rows[0]?.display_name || 'Unknown',
          message: data.message,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to all party members
        io.to(`party:${data.partyId}`).emit('party:message-received', broadcast);

        logger.debug({
          type: 'party_message',
          partyId: data.partyId,
          userId,
        });
      } catch (error) {
        socket.emit('error', {
          code: 'MESSAGE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send message',
        });
      }
    });

    // Disconnect handler
    socket.on('disconnect', async () => {
      logger.info({
        type: 'socket_disconnected',
        userId,
        socketId: socket.id,
      });

      // Update online status in all user's parties
      const userParties = await PartyService.getUserParties(userId);
      for (const party of userParties) {
        await PartyService.updateMemberOnlineStatus(party.id, userId, false);
        
        // Broadcast user offline status to party
        io.to(`party:${party.id}`).emit('party:member-offline', {
          userId,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  return { io, httpServer };
}

/**
 * Start the real-time server
 */
export async function startRealtimeServer() {
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
    const { io, httpServer } = await createRealtimeServer();

    httpServer.listen(serverConfig.realtime.port, serverConfig.realtime.host, () => {
      logger.info(`🚀 Real-time server listening on ${serverConfig.realtime.host}:${serverConfig.realtime.port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Shutting down real-time server...');
      io.close();
      await redis.close();
      await db.close();
      logger.info('Real-time server shut down complete');
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error({
      type: 'realtime_server_start_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

// Start server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startRealtimeServer();
}
