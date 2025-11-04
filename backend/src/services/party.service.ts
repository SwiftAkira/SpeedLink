import { customAlphabet } from 'nanoid';
import { db } from '../database/connection.js';
import { redis } from '../database/redis.js';
import { partyConfig } from '../config.js';
import { logger } from '../utils/logger.js';
import type { Party, PartyState, PartyMemberState, LocationUpdate } from '../shared/types.js';

/**
 * Generate numeric party code
 */
const generatePartyCode = customAlphabet('0123456789', partyConfig.codeLength);

/**
 * Party Service
 * Handles party creation, management, and state synchronization
 */
export class PartyService {
  /**
   * Create a new party
   */
  static async createParty(leaderId: number, name?: string): Promise<Party> {
    // Generate unique party code
    let code = generatePartyCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await db.query(
        'SELECT id FROM parties WHERE code = $1',
        [code]
      );

      if (existing.rowCount === 0) break;
      
      code = generatePartyCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Failed to generate unique party code');
    }

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + partyConfig.expiryHours);

    // Create party in database
    const result = await db.query<Party>(
      `INSERT INTO parties (code, name, leader_id, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [code, name || `Party ${code}`, leaderId, expiresAt]
    );

    const party = result.rows[0]!;

    // Add leader as first member
    await db.query(
      `INSERT INTO party_members (party_id, user_id)
       VALUES ($1, $2)`,
      [party.id, leaderId]
    );

    logger.info({
      type: 'party_created',
      partyId: party.id,
      code: party.code,
      leaderId,
    });

    return party;
  }

  /**
   * Get party by ID
   */
  static async getPartyById(partyId: number): Promise<Party | null> {
    const result = await db.query<Party>(
      'SELECT * FROM parties WHERE id = $1',
      [partyId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get party by code
   */
  static async getPartyByCode(code: string): Promise<Party | null> {
    const result = await db.query<Party>(
      'SELECT * FROM parties WHERE code = $1 AND is_active = true AND expires_at > NOW()',
      [code]
    );

    return result.rows[0] || null;
  }

  /**
   * Join a party
   */
  static async joinParty(partyId: number, userId: number): Promise<boolean> {
    try {
      // Check if party is full
      const memberCount = await this.getPartyMemberCount(partyId);
      if (memberCount >= partyConfig.maxSize) {
        throw new Error('Party is full');
      }

      // Add member to party
      await db.query(
        `INSERT INTO party_members (party_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (party_id, user_id) DO NOTHING`,
        [partyId, userId]
      );

      logger.info({
        type: 'party_joined',
        partyId,
        userId,
      });

      return true;
    } catch (error) {
      logger.error({
        type: 'party_join_error',
        partyId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Leave a party
   */
  static async leaveParty(partyId: number, userId: number): Promise<void> {
    await db.query(
      'DELETE FROM party_members WHERE party_id = $1 AND user_id = $2',
      [partyId, userId]
    );

    // Check if party is empty
    const memberCount = await this.getPartyMemberCount(partyId);
    if (memberCount === 0) {
      // Deactivate empty party
      await db.query(
        'UPDATE parties SET is_active = false WHERE id = $1',
        [partyId]
      );

      // Clean up Redis state
      await redis.del(`party:${partyId}:state`);
    }

    logger.info({
      type: 'party_left',
      partyId,
      userId,
    });
  }

  /**
   * Get party member count
   */
  static async getPartyMemberCount(partyId: number): Promise<number> {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM party_members WHERE party_id = $1',
      [partyId]
    );

    return parseInt(result.rows[0]!.count);
  }

  /**
   * Get party members
   */
  static async getPartyMembers(partyId: number): Promise<PartyMemberState[]> {
    const result = await db.query(`
      SELECT 
        pm.user_id as "userId",
        u.display_name as "displayName",
        u.vehicle_type as "vehicleType",
        pm.is_online as "isOnline",
        pm.joined_at as "joinedAt",
        pm.last_seen_at as "lastSeenAt"
      FROM party_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.party_id = $1
    `, [partyId]);

    return result.rows;
  }

  /**
   * Update member online status
   */
  static async updateMemberOnlineStatus(
    partyId: number,
    userId: number,
    isOnline: boolean
  ): Promise<void> {
    await db.query(
      `UPDATE party_members 
       SET is_online = $3, last_seen_at = NOW()
       WHERE party_id = $1 AND user_id = $2`,
      [partyId, userId, isOnline]
    );
  }

  /**
   * Store location update in Redis
   */
  static async storeLocationUpdate(location: LocationUpdate): Promise<void> {
    const key = `party:${location.partyId}:location:${location.userId}`;
    const value = JSON.stringify(location);
    
    // Store with 5-minute expiry
    await redis.set(key, value, 300);
  }

  /**
   * Get location updates for party
   */
  static async getPartyLocations(partyId: number): Promise<Map<number, LocationUpdate>> {
    const pattern = `party:${partyId}:location:*`;
    const client = redis.getClient();
    const keys = await client.keys(pattern);
    
    const locations = new Map<number, LocationUpdate>();
    
    for (const key of keys) {
      const value = await client.get(key);
      if (value) {
        const location = JSON.parse(value) as LocationUpdate;
        locations.set(location.userId, location);
      }
    }
    
    return locations;
  }

  /**
   * Get full party state (for broadcasting)
   */
  static async getPartyState(partyId: number): Promise<PartyState | null> {
    const party = await this.getPartyById(partyId);
    if (!party) return null;

    const members = await this.getPartyMembers(partyId);
    const locations = await this.getPartyLocations(partyId);

    // Attach location data to members
    const membersWithLocations = members.map(member => ({
      ...member,
      location: locations.get(member.userId),
    }));

    return {
      id: party.id,
      code: party.code,
      name: party.name,
      leader_id: party.leader_id,
      members: membersWithLocations,
      created_at: party.created_at,
      expires_at: party.expires_at,
    };
  }

  /**
   * Check if user is in party
   */
  static async isUserInParty(partyId: number, userId: number): Promise<boolean> {
    const result = await db.query(
      'SELECT 1 FROM party_members WHERE party_id = $1 AND user_id = $2',
      [partyId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get user's active parties
   */
  static async getUserParties(userId: number): Promise<Party[]> {
    const result = await db.query<Party>(`
      SELECT p.*
      FROM parties p
      JOIN party_members pm ON p.id = pm.party_id
      WHERE pm.user_id = $1
        AND p.is_active = true
        AND p.expires_at > NOW()
    `, [userId]);

    return result.rows;
  }
}
