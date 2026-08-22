import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const prismaClient = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const prisma = globalThis.__roomBotPrisma ?? prismaClient;

if (env.NODE_ENV !== 'production') {
  globalThis.__roomBotPrisma = prisma;
}

