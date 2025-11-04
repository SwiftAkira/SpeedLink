import bcrypt from 'bcrypt';
import jwt, { Algorithm } from 'jsonwebtoken';
import crypto from 'crypto';
import { config, jwtConfig } from '../config.js';
import { db } from '../database/connection.js';
import { redis } from '../database/redis.js';
import { logger } from '../utils/logger.js';
import { validatePasswordStrength } from '../utils/password.utils.js';
import type { AuthTokens, JWTPayload } from '../shared/types.js';

/**
 * Authentication Service
 * Handles user authentication, JWT tokens, and session management
 */
export class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate access token (JWT)
   */
  static generateAccessToken(userId: number, email: string): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: userId.toString(),
      email,
      iss: 'speedlink-api',
      aud: 'speedlink-client',
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiry,
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token (opaque random string)
   */
  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('base64url');
  }

  /**
   * Hash refresh token for storage
   */
  static hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algorithm as Algorithm],
        issuer: 'speedlink-api',
        audience: 'speedlink-client',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      logger.debug({
        type: 'jwt_verification_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Store refresh token in database
   */
  static async storeRefreshToken(userId: number, token: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(token);
    const expiryDate = new Date();
    
    // Parse expiry string (e.g., "7d" -> 7 days)
    const expiryMatch = jwtConfig.refreshTokenExpiry.match(/^(\d+)([dhms])$/);
    if (expiryMatch && expiryMatch[1] && expiryMatch[2]) {
      const value = parseInt(expiryMatch[1]);
      const unit = expiryMatch[2];
      
      switch (unit) {
        case 'd': expiryDate.setDate(expiryDate.getDate() + value); break;
        case 'h': expiryDate.setHours(expiryDate.getHours() + value); break;
        case 'm': expiryDate.setMinutes(expiryDate.getMinutes() + value); break;
        case 's': expiryDate.setSeconds(expiryDate.getSeconds() + value); break;
      }
    }

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiryDate]
    );
  }

  /**
   * Verify refresh token and get user ID
   */
  static async verifyRefreshToken(token: string): Promise<number | null> {
    const tokenHash = this.hashRefreshToken(token);

    const result = await db.query<{ user_id: number }>(
      `SELECT user_id FROM refresh_tokens
       WHERE token_hash = $1
         AND expires_at > NOW()
         AND revoked = false`,
      [tokenHash]
    );

    if (result.rowCount === 0) {
      return null;
    }

    // Revoke the used refresh token (one-time use)
    await db.query(
      `UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`,
      [tokenHash]
    );

    return result.rows[0]!.user_id;
  }

  /**
   * Revoke all refresh tokens for a user (logout all devices)
   */
  static async revokeAllUserTokens(userId: number): Promise<void> {
    await db.query(
      `UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Clean up expired refresh tokens
   */
  static async cleanupExpiredTokens(): Promise<void> {
    const result = await db.query(
      `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
    );

    logger.info({
      type: 'cleanup_expired_tokens',
      deleted: result.rowCount,
    });
  }

  /**
   * Generate full authentication tokens
   */
  static async generateAuthTokens(userId: number, email: string): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken();

    await this.storeRefreshToken(userId, refreshToken);

    // Parse expiry to seconds
    const expiresIn = this.parseExpiryToSeconds(jwtConfig.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Parse expiry string to seconds
   */
  private static parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([dhms])$/);
    if (!match || !match[1] || !match[2]) return 900; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 86400;
      case 'h': return value * 3600;
      case 'm': return value * 60;
      case 's': return value;
      default: return 900;
    }
  }

  /**
   * Validate password strength before registration
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const strength = validatePasswordStrength(password);
    
    if (!strength.meetsMinimum) {
      return {
        valid: false,
        errors: strength.feedback,
      };
    }

    if (strength.isCommon) {
      return {
        valid: false,
        errors: ['Password is too common, please choose a more unique password'],
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Track failed login attempts (account lockout protection)
   */
  static async trackFailedLogin(email: string): Promise<{ locked: boolean; attemptsRemaining: number }> {
    const client = redis.getClient();
    const key = `failed_login:${email}`;
    const maxAttempts = 5;
    const lockoutDuration = 900; // 15 minutes

    const attempts = await client.incr(key);

    if (attempts === 1) {
      await client.expire(key, 3600); // 1 hour window
    }

    if (attempts >= maxAttempts) {
      // Lock account
      const lockKey = `account_locked:${email}`;
      await client.setEx(lockKey, lockoutDuration, '1');

      logger.warn({
        type: 'account_locked',
        email,
        attempts,
        lockoutDuration,
      });

      return {
        locked: true,
        attemptsRemaining: 0,
      };
    }

    return {
      locked: false,
      attemptsRemaining: maxAttempts - attempts,
    };
  }

  /**
   * Check if account is locked
   */
  static async isAccountLocked(email: string): Promise<boolean> {
    const client = redis.getClient();
    const lockKey = `account_locked:${email}`;
    const locked = await client.exists(lockKey);
    return locked === 1;
  }

  /**
   * Clear failed login attempts on successful login
   */
  static async clearFailedLogins(email: string): Promise<void> {
    const client = redis.getClient();
    const key = `failed_login:${email}`;
    await client.del(key);
  }

  /**
   * Blacklist access token (for logout)
   */
  static async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const client = redis.getClient();
    const key = `blacklist:${token}`;
    await client.setEx(key, expiresIn, '1');
    
    logger.info({
      type: 'token_blacklisted',
      expiresIn,
    });
  }

  /**
   * Log authentication event for audit trail
   */
  static async logAuthEvent(
    userId: number,
    event: 'login' | 'logout' | 'register' | 'password_change' | 'token_refresh',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await db.query(
        `INSERT INTO auth_audit_log (user_id, event_type, metadata, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [userId, event, JSON.stringify(metadata || {})]
      );

      logger.info({
        type: 'auth_event',
        userId,
        event,
        metadata,
      });
    } catch (error) {
      logger.error({
        type: 'audit_log_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get user's active sessions count
   */
  static async getActiveSessionsCount(userId: number): Promise<number> {
    const result = await db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM refresh_tokens
       WHERE user_id = $1 AND expires_at > NOW() AND revoked = false`,
      [userId]
    );

    return parseInt(result.rows[0]?.count || '0');
  }

  /**
   * Revoke specific refresh token
   */
  static async revokeRefreshToken(token: string): Promise<boolean> {
    const tokenHash = this.hashRefreshToken(token);
    
    const result = await db.query(
      `UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`,
      [tokenHash]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Get user's active sessions with details
   */
  static async getUserSessions(userId: number): Promise<Array<{
    id: number;
    created_at: Date;
    expires_at: Date;
    is_current?: boolean;
  }>> {
    const result = await db.query<{
      id: number;
      created_at: Date;
      expires_at: Date;
    }>(
      `SELECT id, created_at, expires_at
       FROM refresh_tokens
       WHERE user_id = $1 AND expires_at > NOW() AND revoked = false
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }
}

