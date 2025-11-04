import { db } from './connection.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  logger.info('Starting database migrations...');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await db.query(schema);

    logger.info('✅ Database migrations completed successfully');
  } catch (error) {
    logger.error({
      type: 'migration_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Check if database is properly initialized
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Check if required tables exist
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'parties', 'party_members', 'alerts', 'reports')
    `);

    return result.rowCount === 5;
  } catch (error) {
    logger.error({
      type: 'database_health_check_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed', error);
      process.exit(1);
    });
}
