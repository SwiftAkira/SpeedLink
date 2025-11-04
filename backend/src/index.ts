import { startServer as startRestApi } from './rest-api/server.js';
import { startRealtimeServer } from './realtime/server.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point - starts both REST API and Real-Time services
 */
async function main() {
  logger.info('🚀 Starting SpeedLink Backend Services...');

  try {
    // Start both services concurrently
    await Promise.all([
      startRestApi(),
      startRealtimeServer(),
    ]);

    logger.info('✅ All services started successfully');
  } catch (error) {
    logger.error({
      type: 'startup_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

// Start application
main();
