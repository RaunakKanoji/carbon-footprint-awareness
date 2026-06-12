import React from 'react';

import { redirect } from 'next/navigation';

import DashboardClient from '@/components/dashboard/DashboardClient';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export default async function DashboardPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const userId = dbUser.id;
  const now = new Date();

  // 1. Current Month's Budget
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

  const budget = await prisma.budget.findUnique({
    where: {
      userId_month: {
        userId,
        month: currentMonthStart,
      },
    },
  });

  let monthlyBudget = 500.0; // default fallback
  if (budget) {
    monthlyBudget = budget.targetKg;
  } else {
    const latestBudget = await prisma.budget.findFirst({
      where: { userId },
      orderBy: { month: 'desc' },
    });
    if (latestBudget) {
      monthlyBudget = latestBudget.targetKg;
    }
  }

  // 2. Monthly Consumption
  const monthlyLogsSum = await prisma.activityLog.aggregate({
    where: {
      userId,
      occurredAt: {
        gte: currentMonthStart,
        lt: nextMonthStart,
      },
    },
    _sum: {
      co2eKg: true,
    },
  });
  const monthlyConsumption = monthlyLogsSum._sum.co2eKg || 0;
  const remainingBudget = monthlyBudget - monthlyConsumption;

  // 3. Today's Footprint
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const todayLogsSum = await prisma.activityLog.aggregate({
    where: {
      userId,
      occurredAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    _sum: {
      co2eKg: true,
    },
  });
  const todayFootprint = todayLogsSum._sum.co2eKg || 0;

  // 4. This Week's logs (last 7 days including today)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const thisWeekLogsSum = await prisma.activityLog.aggregate({
    where: {
      userId,
      occurredAt: {
        gte: sevenDaysAgo,
        lte: todayEnd,
      },
    },
    _sum: {
      co2eKg: true,
    },
  });
  const weeklyFootprint = thisWeekLogsSum._sum.co2eKg || 0;

  // 5. Previous Week's logs (7 days before that)
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const prevWeekLogsSum = await prisma.activityLog.aggregate({
    where: {
      userId,
      occurredAt: {
        gte: fourteenDaysAgo,
        lt: sevenDaysAgo,
      },
    },
    _sum: {
      co2eKg: true,
    },
  });
  const prevWeekFootprint = prevWeekLogsSum._sum.co2eKg || 0;

  let trendPercentage = 0;
  if (prevWeekFootprint > 0) {
    trendPercentage = ((weeklyFootprint - prevWeekFootprint) / prevWeekFootprint) * 100;
  } else if (weeklyFootprint > 0) {
    trendPercentage = 100.0;
  }

  // 6. Weekly Chart Data (daily logs for the last 7 days)
  const weeklyLogs = await prisma.activityLog.findMany({
    where: {
      userId,
      occurredAt: {
        gte: sevenDaysAgo,
        lte: todayEnd,
      },
    },
    orderBy: {
      occurredAt: 'asc',
    },
  });

  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    });
    chartData.push({
      date: dateStr,
      rawDateString: d.toDateString(),
      TRANSPORT: 0,
      FOOD: 0,
      ENERGY: 0,
      SHOPPING: 0,
      WASTE: 0,
    });
  }

  for (const log of weeklyLogs) {
    const logDateStr = log.occurredAt.toDateString();
    const matchingDay = chartData.find((c) => c.rawDateString === logDateStr);
    if (matchingDay) {
      const categoryKey = log.category.toUpperCase() as keyof typeof matchingDay;
      if (typeof matchingDay[categoryKey] === 'number') {
        (matchingDay[categoryKey] as number) += log.co2eKg;
      }
    }
  }

  // Remove rawDateString so we pass plain objects
  const serializedChartData = chartData.map(({ rawDateString: _rawDateString, ...rest }) => rest);

  // 7. Category Share Data (last 7 days percentage breakdown)
  const shareMap: Record<string, number> = {
    TRANSPORT: 0,
    FOOD: 0,
    ENERGY: 0,
    SHOPPING: 0,
    WASTE: 0,
  };

  for (const log of weeklyLogs) {
    const cat = log.category.toUpperCase();
    if (cat in shareMap) {
      shareMap[cat] += log.co2eKg;
    }
  }

  const categoryShare = Object.entries(shareMap).map(([category, co2eKg]) => ({
    category,
    co2eKg,
  }));

  // 8. 5 Recent Activities
  const recentLogs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
    take: 5,
  });

  const serializedRecentLogs = recentLogs.map((log) => ({
    id: log.id,
    category: log.category,
    subType: log.subType,
    quantity: log.quantity,
    unit: log.unit,
    co2eKg: log.co2eKg,
    note: log.note,
    occurredAt: log.occurredAt.toISOString(),
  }));

  return (
    <DashboardClient
      todayFootprint={todayFootprint}
      weeklyFootprint={weeklyFootprint}
      monthlyBudget={monthlyBudget}
      monthlyConsumption={monthlyConsumption}
      remainingBudget={remainingBudget}
      trendPercentage={trendPercentage}
      weeklyLogs={serializedChartData}
      categoryShare={categoryShare}
      recentActivities={serializedRecentLogs}
    />
  );
}
