import pg from 'pg';
import { databaseConfig, getDatabaseUrl } from '../config.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * PostgreSQL connection pool
 * Provides connection pooling, automatic reconnection, and health checks
 */
export class Database {
  private static instance: Database;
  private pool: pg.Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: databaseConfig.max,
      idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
      connectionTimeoutMillis: databaseConfig.connectionTimeoutMillis,
      // Connection pool events
      ...this.getPoolEventHandlers(),
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Get the connection pool
   */
  public getPool(): pg.Pool {
    return this.pool;
  }

  /**
   * Execute a query with connection from pool
   */
  public async query<T extends pg.QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<pg.QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      logger.debug({
        type: 'db_query',
        query: text.substring(0, 100),
        duration,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error({
        type: 'db_query_error',
        query: text.substring(0, 100),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  public async getClient(): Promise<pg.PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute queries in a transaction
   */
  public async transaction<T>(
    callback: (client: pg.PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        type: 'db_transaction_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check database health
   */
  public async healthCheck(): Promise<{ status: 'up' | 'down'; latency?: number; error?: string }> {
    const start = Date.now();
    try {
      await this.query('SELECT 1');
      const latency = Date.now() - start;
      return { status: 'up', latency };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Close all connections in the pool
   */
  public async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database connection pool closed');
  }

  /**
   * Pool event handlers for logging
   */
  private getPoolEventHandlers() {
    return {
      // Client connection events
      connect: (_client: pg.Client) => {
        logger.debug('New database client connected');
      },
      // Client acquisition from pool
      acquire: (_client: pg.Client) => {
        logger.debug('Database client acquired from pool');
      },
      // Client release back to pool
      release: (err: Error | undefined, _client: pg.Client) => {
        if (err) {
          logger.error({
            type: 'db_client_release_error',
            error: err.message,
          });
        }
      },
      // Connection errors
      error: (err: Error, _client: pg.Client) => {
        logger.error({
          type: 'db_connection_error',
          error: err.message,
        });
      },
      // Pool removal
      remove: (_client: pg.Client) => {
        logger.debug('Database client removed from pool');
      },
    };
  }
}

// Export singleton instance
export const db = Database.getInstance();

// Export pool for direct access if needed
export const pool = db.getPool();
