import { cronTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/lib/prisma';

import { client } from './client';

export const dataCleanupJob = client.defineJob({
  id: 'data-cleanup',
  name: 'Clean Up Historical Activity Logs',
  version: '1.0.0',
  trigger: cronTrigger({
    cron: '0 2 * * *', // Daily at 02:00 AM
  }),
  run: async (_payload, _io, _ctx) => {
    const now = new Date();
    const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);

    // Purge logs that occurred more than 2 years ago
    const deleteResult = await prisma.activityLog.deleteMany({
      where: {
        occurredAt: {
          lt: twoYearsAgo,
        },
      },
    });

    return { deletedLogsCount: deleteResult.count };
  },
});
