import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const getDatabaseUrl = () => {
  try {
    const url = new URL(env.DATABASE_URL);
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '50');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '20');
    }
    return url.toString();
  } catch {
    return env.DATABASE_URL;
  }
};

const prismaClient = new PrismaClient({
  datasources: { db: { url: getDatabaseUrl() } },
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const prisma = globalThis.__roomBotPrisma ?? prismaClient;

if (env.NODE_ENV !== 'production') {
  globalThis.__roomBotPrisma = prisma;
}
