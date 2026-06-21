import { cronTrigger } from '@trigger.dev/sdk';

import { sendBudgetReminderEmail } from '@/src/server/notifications/emails.service';
import { prisma } from '@/src/db/prisma';

import { client } from './client';

export const budgetRemindersJob = client.defineJob({
  id: 'budget-reminders',
  name: 'Monthly Budget Threshold Alerts',
  version: '1.0.0',
  trigger: cronTrigger({
    cron: '0 10 * * *', // Daily at 10:00 AM
  }),
  run: async (_payload, _io, _ctx) => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    // Fetch all active budgets configured for the current month
    const budgets = await prisma.budget.findMany({
      where: {
        month: currentMonthStart,
      },
      select: {
        userId: true,
        targetKg: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    let alertsDispatched = 0;

    for (const budget of budgets) {
      if (!budget.user) continue;

      // Aggregate emissions logged for the current month
      const monthlyLogsSum = await prisma.activityLog.aggregate({
        where: {
          userId: budget.userId,
          occurredAt: {
            gte: currentMonthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          co2eKg: true,
        },
      });

      const consumption = monthlyLogsSum._sum.co2eKg || 0;

      // Trigger reminder email if user exceeds 80% of budget
      if (consumption >= budget.targetKg * 0.8) {
        await sendBudgetReminderEmail(budget.user.email, budget.targetKg, consumption);
        alertsDispatched++;
      }
    }

    return { totalBudgetsChecked: budgets.length, alertsDispatched };
  },
});
