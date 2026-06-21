import { prisma } from '@/src/db/prisma';

export type DashboardPeriod = 'day' | 'week' | 'month';

export interface DashboardData {
  period: DashboardPeriod;
  summary: {
    todayKg: number;
    weekKg: number;
    monthKg: number;
    remainingBudgetKg: number;
    monthlyBudgetKg: number;
    weekPreventedKg: number;
    preventedKg: number;
  };
  categoryBreakdown: Array<{
    category: string;
    co2eKg: number;
    percent: number;
  }>;
  trend: Array<{
    date: string;
    label: string;
    co2eKg: number;
    isToday: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [category: string]: any;
  }>;
  streak?: {
    currentDays: number;
    loggedToday: boolean;
    lastSevenDays: Array<{
      date: string;
      label: string;
      active: boolean;
      isToday: boolean;
    }>;
  };
  currentMissions?: Array<{
    id: string;
    title: string;
  }>;
  topContributors: Array<{
    id: string;
    title: string;
    category: string;
    co2eKg: number;
    occurredAt: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    estimatedReductionKg: number;
  }>;
}

const CATEGORY_ORDER = [
  'TRANSPORT',
  'ELECTRICITY',
  'ENERGY',
  'FOOD',
  'SHOPPING',
  'WASTE',
  'FLIGHT',
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatTrendLabel(date: Date, period: DashboardPeriod) {
  return date.toLocaleDateString('en-US', {
    weekday: period === 'month' ? undefined : 'short',
    month: period === 'month' ? 'short' : undefined,
    day: 'numeric',
  });
}

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getPeriodStart(period: DashboardPeriod, now: Date) {
  const todayStart = startOfDay(now);

  if (period === 'day') return todayStart;

  if (period === 'week') {
    return addDays(todayStart, -6);
  }

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getCategoryOrderIndex(category: string) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function getDateRange(start: Date, end: Date) {
  const dates: Date[] = [];
  const cursor = startOfDay(start);
  const finalDay = startOfDay(end);

  while (cursor <= finalDay) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function buildRecommendations(categoryTotals: Map<string, number>) {
  const ranked = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]);

  const recommendationByCategory: Record<
    string,
    Omit<DashboardData['recommendations'][number], 'id'>
  > = {
    TRANSPORT: {
      title: 'Replace one short car trip',
      description: 'Walk, cycle, or use public transport for one journey this week.',
      estimatedReductionKg: 2.3,
    },
    FLIGHT: {
      title: 'Consolidate upcoming travel',
      description: 'Combine journeys or choose rail for a suitable short route.',
      estimatedReductionKg: 18,
    },
    FOOD: {
      title: 'Choose two lower-impact meals',
      description: 'Swap two meat-heavy meals for plant-forward alternatives.',
      estimatedReductionKg: 3,
    },
    ELECTRICITY: {
      title: 'Reduce peak electricity use',
      description: 'Use power-saving settings and switch off idle appliances.',
      estimatedReductionKg: 1.5,
    },
    ENERGY: {
      title: 'Reduce peak electricity use',
      description: 'Use power-saving settings and switch off idle appliances.',
      estimatedReductionKg: 1.5,
    },
    SHOPPING: {
      title: 'Delay one non-essential purchase',
      description: 'Choose second-hand, repair, or buy a longer-lasting alternative.',
      estimatedReductionKg: 5,
    },
    WASTE: {
      title: 'Divert food waste from landfill',
      description: 'Plan portions and compost unavoidable organic waste.',
      estimatedReductionKg: 1.2,
    },
  };

  const recommendations = ranked
    .map(([category]) => recommendationByCategory[category])
    .filter((item): item is Omit<DashboardData['recommendations'][number], 'id'> => Boolean(item))
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.title === item.title) === index,
    )
    .slice(0, 3)
    .map((item, index) => ({ ...item, id: `recommendation-${index + 1}` }));

  if (recommendations.length === 0) {
    return [
      {
        id: 'recommendation-1',
        title: 'Log today’s main activities',
        description:
          'Add a commute, meal, or electricity entry to unlock personalised suggestions.',
        estimatedReductionKg: 0.5,
      },
    ];
  }

  return recommendations;
}

export async function getDashboardData(
  userId: string,
  period: DashboardPeriod = 'week',
): Promise<DashboardData> {
  const now = new Date();

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const weekStart = addDays(todayStart, -6);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const periodStart = getPeriodStart(period, now);
  const periodEnd = todayEnd;

  const streakWindowStart = addDays(todayStart, -59);

  const [
    budget,
    latestBudget,
    todayTotal,
    weekTotal,
    monthTotal,
    periodLogs,
    streakLogs,
    currentMissions,
  ] = await Promise.all([
    prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month: monthStart,
        },
      },
      select: {
        targetKg: true,
      },
    }),

    prisma.budget.findFirst({
      where: {
        userId,
      },
      orderBy: {
        month: 'desc',
      },
      select: {
        targetKg: true,
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
          gte: weekStart,
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
          gte: monthStart,
          lt: nextMonthStart,
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
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: {
        occurredAt: 'desc',
      },
      select: {
        id: true,
        category: true,
        subType: true,
        co2eKg: true,
        occurredAt: true,
      },
    }),

    prisma.activityLog.findMany({
      where: {
        userId,
        occurredAt: {
          gte: streakWindowStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        occurredAt: 'desc',
      },
      select: {
        occurredAt: true,
      },
    }),

    prisma.challenge.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  const monthlyBudgetKg = budget?.targetKg ?? latestBudget?.targetKg ?? 500;
  const todayKg = todayTotal._sum.co2eKg ?? 0;
  const weekKg = weekTotal._sum.co2eKg ?? 0;
  const monthKg = monthTotal._sum.co2eKg ?? 0;

  const categoryTotals = new Map<string, number>();
  const dailyTotals = new Map<string, number>();
  const dailyCategoryTotals = new Map<string, Map<string, number>>();

  for (const log of periodLogs) {
    const category = log.category.toString();
    const co2eKg = Number.isFinite(log.co2eKg) ? log.co2eKg : 0;
    const dateKey = formatDateKey(log.occurredAt);

    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + co2eKg);
    dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + co2eKg);

    let dateMap = dailyCategoryTotals.get(dateKey);
    if (!dateMap) {
      dateMap = new Map<string, number>();
      dailyCategoryTotals.set(dateKey, dateMap);
    }
    dateMap.set(category, (dateMap.get(category) ?? 0) + co2eKg);
  }

  const periodTotal = [...categoryTotals.values()].reduce((sum, value) => sum + value, 0);

  const categoryBreakdown = [...categoryTotals.entries()]
    .sort((a, b) => {
      const orderDifference = getCategoryOrderIndex(a[0]) - getCategoryOrderIndex(b[0]);

      if (orderDifference !== 0) return orderDifference;

      return b[1] - a[1];
    })
    .map(([category, co2eKg]) => ({
      category,
      co2eKg,
      percent: periodTotal > 0 ? (co2eKg / periodTotal) * 100 : 0,
    }));

  const trend = getDateRange(periodStart, todayStart).map((date) => {
    const dateKey = formatDateKey(date);
    const categoryMap = dailyCategoryTotals.get(dateKey);
    const categoriesData: Record<string, number> = {};

    if (categoryMap) {
      for (const [cat, val] of categoryMap.entries()) {
        categoriesData[cat] = val;
      }
    }

    return {
      date: dateKey,
      label: formatTrendLabel(date, period),
      co2eKg: dailyTotals.get(dateKey) ?? 0,
      isToday: formatDateKey(date) === formatDateKey(now),
      ...categoriesData,
    };
  });

  const activeDateKeys = new Set(streakLogs.map((log) => formatDateKey(log.occurredAt)));
  const todayKey = formatDateKey(todayStart);
  const loggedToday = activeDateKeys.has(todayKey);
  let streakCursor = loggedToday ? todayStart : addDays(todayStart, -1);
  let currentStreakDays = 0;

  while (activeDateKeys.has(formatDateKey(streakCursor))) {
    currentStreakDays += 1;
    streakCursor = addDays(streakCursor, -1);
  }

  const lastSevenDays = getDateRange(addDays(todayStart, -6), todayStart).map((date) => ({
    date: formatDateKey(date),
    label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
    active: activeDateKeys.has(formatDateKey(date)),
    isToday: formatDateKey(date) === todayKey,
  }));

  return {
    period,
    summary: {
      todayKg,
      weekKg,
      monthKg,
      remainingBudgetKg: Math.max(monthlyBudgetKg - monthKg, 0),
      monthlyBudgetKg,
      weekPreventedKg: 0,
      preventedKg: 0,
    },
    categoryBreakdown,
    trend,
    streak: {
      currentDays: currentStreakDays,
      loggedToday,
      lastSevenDays,
    },
    currentMissions,
    topContributors: periodLogs
      .slice()
      .sort((a, b) => b.co2eKg - a.co2eKg)
      .slice(0, 5)
      .map((log) => ({
        id: log.id,
        title: titleCase(log.subType),
        category: titleCase(log.category.toString()),
        co2eKg: log.co2eKg,
        occurredAt: log.occurredAt.toISOString(),
      })),
    recommendations: buildRecommendations(categoryTotals),
  };
}
