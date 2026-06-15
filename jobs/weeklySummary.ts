import { cronTrigger } from '@trigger.dev/sdk';

import { sendWeeklySummaryEmail } from '@/lib/emails';
import { prisma } from '@/lib/prisma';

import { client } from './client';

export const weeklySummaryJob = client.defineJob({
  id: 'weekly-summary',
  name: 'Send Weekly Summary Email',
  version: '1.0.0',
  trigger: cronTrigger({
    cron: '0 9 * * MON', // Every Monday at 09:00 AM
  }),
  run: async (_payload, _io, _ctx) => {
    // Fetch users with minimal fields projected
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let processedCount = 0;

    for (const user of users) {
      // Aggregate the user's weekly CO2e emissions
      const weeklyLogsSum = await prisma.activityLog.aggregate({
        where: {
          userId: user.id,
          occurredAt: {
            gte: sevenDaysAgo,
          },
        },
        _sum: {
          co2eKg: true,
        },
      });

      const weeklyTotal = weeklyLogsSum._sum.co2eKg || 0;

      // Send simulated weekly summary email
      await sendWeeklySummaryEmail(user.email, weeklyTotal);
      processedCount++;
    }

    return { processedCount };
  },
});
