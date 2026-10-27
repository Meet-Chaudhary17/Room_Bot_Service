import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';
import { allocationEngine } from './services/allocation-engine.service.js';

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'HTTP server started');
  allocationEngine.ensureInitialized().catch(err => {
    logger.error({ err: err.message }, 'AllocationEngine warmup error');
  });
});

async function shutdown(signal) {
  logger.info({ signal }, 'Graceful shutdown started');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTP server stopped');
    process.exit(0);
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
