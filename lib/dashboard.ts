import { prisma } from './prisma';

export interface SerializedDashboardData {
  todayFootprint: number;
  weeklyFootprint: number;
  monthlyBudget: number;
  monthlyConsumption: number;
  remainingBudget: number;
  trendPercentage: number;
  weeklyLogs: Array<{
    date: string;
    TRANSPORT: number;
    FOOD: number;
    ENERGY: number;
    SHOPPING: number;
    WASTE: number;
  }>;
  categoryShare: Array<{
    category: string;
    co2eKg: number;
  }>;
  recentActivities: Array<{
    id: string;
    category: string;
    subType: string;
    quantity: number;
    unit: string;
    co2eKg: number;
    note: string | null;
    occurredAt: string;
  }>;
}

/**
 * Optimized dashboard data fetching helper that batches multiple queries
 * using Prisma $transaction and projects only the necessary fields using select.
 */
export async function getDashboardData(userId: string): Promise<SerializedDashboardData> {
  const now = new Date();

  // Define date ranges
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  // Run all 8 read-only queries in parallel — Promise.all fires them concurrently
  // across the connection pool so total time = slowest query, not sum of all 8.
  const [
    budget,
    latestBudget,
    monthlyLogsSum,
    todayLogsSum,
    thisWeekLogsSum,
    prevWeekLogsSum,
    weeklyLogs,
    recentLogs,
  ] = await Promise.all([
    prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month: currentMonthStart,
        },
      },
      select: {
        targetKg: true,
      },
    }),
    prisma.budget.findFirst({
      where: { userId },
      orderBy: { month: 'desc' },
      select: {
        targetKg: true,
      },
    }),
    prisma.activityLog.aggregate({
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
    }),
    prisma.activityLog.aggregate({
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
    }),
    prisma.activityLog.aggregate({
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
    }),
    prisma.activityLog.aggregate({
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
    }),
    prisma.activityLog.findMany({
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
      select: {
        category: true,
        co2eKg: true,
        occurredAt: true,
      },
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 5,
      select: {
        id: true,
        category: true,
        subType: true,
        quantity: true,
        unit: true,
        co2eKg: true,
        note: true,
        occurredAt: true,
      },
    }),
  ]);


  // Determine Budget Limit
  const monthlyBudget = budget?.targetKg ?? latestBudget?.targetKg ?? 500.0;

  // Consumption aggregates
  const monthlyConsumption = monthlyLogsSum._sum.co2eKg || 0;
  const remainingBudget = monthlyBudget - monthlyConsumption;
  const todayFootprint = todayLogsSum._sum.co2eKg || 0;
  const weeklyFootprint = thisWeekLogsSum._sum.co2eKg || 0;
  const prevWeekFootprint = prevWeekLogsSum._sum.co2eKg || 0;

  // Trend logic
  let trendPercentage = 0;
  if (prevWeekFootprint > 0) {
    trendPercentage = ((weeklyFootprint - prevWeekFootprint) / prevWeekFootprint) * 100;
  } else if (weeklyFootprint > 0) {
    trendPercentage = 100.0;
  }

  // Weekly Chart Data aggregation
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

  const serializedChartData = chartData.map(({ rawDateString: _rawDateString, ...rest }) => rest);

  // Category percentage shares
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

  // Format recent activities
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

  return {
    todayFootprint,
    weeklyFootprint,
    monthlyBudget,
    monthlyConsumption,
    remainingBudget,
    trendPercentage,
    weeklyLogs: serializedChartData,
    categoryShare,
    recentActivities: serializedRecentLogs,
  };
}
