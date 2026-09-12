// ============================================================================
// BlackSentinel Forge - Database Migration Script
// ============================================================================

import { execSync } from 'child_process';
import { logger } from '../middleware/logger';

async function migrate() {
  try {
    logger.info('Starting database migration...');

    // Generate Prisma client
    execSync('npx prisma generate', { stdio: 'inherit' });
    logger.info('Prisma client generated');

    // Run migrations
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error({ err: error }, 'Migration failed');
    process.exit(1);
  }
}

migrate();
