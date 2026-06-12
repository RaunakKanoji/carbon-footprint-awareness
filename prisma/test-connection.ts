import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import pg from 'pg';

import { PrismaClient } from '../app/generated/prisma/index.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const now = await prisma.$queryRaw`SELECT NOW();`;
    console.log('Database time:', now);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
