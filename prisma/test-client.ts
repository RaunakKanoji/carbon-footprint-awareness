import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';

import { PrismaClient } from '../app/generated/prisma';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  const dbInfo = await prisma.$queryRaw`
  SELECT
    current_database() as database,
    current_schema() as schema,
    inet_server_addr() as server_addr,
    inet_server_port() as server_port;
`;

  console.log('Connected database info:', dbInfo);

  try {
    const now = await prisma.$queryRaw<{ now: Date }[]>`
      SELECT NOW() as now;
    `;

    console.log('Database connected successfully.');
    console.log('Database time:', now);

    console.log('Users:', await prisma.user.count());
    console.log('Profiles:', await prisma.profile.count());
    console.log('Emission factors:', await prisma.emissionFactor.count());
    console.log('Activity logs:', await prisma.activityLog.count());
    console.log('Budgets:', await prisma.budget.count());
    console.log('Conversations:', await prisma.conversation.count());
    console.log('Conversation messages:', await prisma.conversationMessage.count());
    console.log('Challenges:', await prisma.challenge.count());
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Prisma model verification failed:');
  console.error(error);
  process.exit(1);
});
