import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';

export async function getOrCreateWeeklyReview(userId: string) {
  const now = new Date();
  const day = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const previousStart = new Date(weekStart);
  previousStart.setDate(weekStart.getDate() - 7);

  const [logs, previousLogs, budget, challenges] = await Promise.all([
    prisma.activityLog.findMany({ where: { userId, occurredAt: { gte: weekStart, lt: weekEnd } }, select: { category: true, co2eKg: true } }),
    prisma.activityLog.findMany({ where: { userId, occurredAt: { gte: previousStart, lt: weekStart } }, select: { co2eKg: true } }),
    prisma.budget.findFirst({ where: { userId }, orderBy: { month: 'desc' } }),
    prisma.challenge.count({ where: { userId, status: 'COMPLETED', completedAt: { gte: weekStart, lt: weekEnd } } }),
  ]);
  const total = logs.reduce((sum, log) => sum + log.co2eKg, 0);
  const previous = previousLogs.reduce((sum, log) => sum + log.co2eKg, 0);
  const byCategory = logs.reduce<Record<string, number>>((result, log) => {
    result[log.category] = (result[log.category] ?? 0) + log.co2eKg;
    return result;
  }, {});
  const [biggestSource = 'No logs', biggestValue = 0] =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] ?? [];
  const changePct = previous > 0 ? ((total - previous) / previous) * 100 : 0;
  const weeklyBudget = budget?.weeklyTargetKg ?? (budget?.targetKg ?? 500) / 4.33;
  const summary = {
    total,
    previous,
    changePct,
    biggestSource,
    biggestShare: total > 0 ? (biggestValue / total) * 100 : 0,
    budgetUsedPct: weeklyBudget > 0 ? (total / weeklyBudget) * 100 : 0,
    missionsCompleted: challenges,
    recommendation:
      biggestSource === 'TRANSPORT'
        ? 'Replace two short car trips with public transport next week.'
        : biggestSource === 'FOOD'
          ? 'Choose two plant-based meals next week.'
          : 'Log three activities next week to improve your recommendations.',
  };

  return prisma.weeklyReview.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: { weekEnd, summary: summary as Prisma.InputJsonValue },
    create: { userId, weekStart, weekEnd, summary: summary as Prisma.InputJsonValue },
  });
}
