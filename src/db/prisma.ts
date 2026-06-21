import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'server-only';

import { requireDatabaseUrl } from '@/src/config/env';
import { PrismaClient } from '@/src/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: requireDatabaseUrl(),
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
