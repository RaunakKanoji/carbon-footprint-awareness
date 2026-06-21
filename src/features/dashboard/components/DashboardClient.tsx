'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  CalendarDays,
  Car,
  Leaf,
  type LucideIcon,
  Package,
  PieChart as PieChartIcon,
  Plane,
  ShoppingBag,
  Trash2,
  Utensils,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import PageHeader from '@/src/app-shell/page-header';
import { buttonVariants } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';
import type { DashboardData, DashboardPeriod } from '@/src/server/dashboard/dashboard.service';

import CarbonSnapshotCards from './CarbonSnapshotCards';
import InsightsMessages from './InsightsMessages';
import ProgressTrackerCards from './ProgressTrackerCards';
import QuickActionsCards from './QuickActionsCards';

const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: '#3b82f6', // Blue
  ELECTRICITY: '#f59e0b', // Amber
  ENERGY: '#f59e0b', // Amber
  FOOD: '#10b981', // Emerald
  SHOPPING: '#8b5cf6', // Violet
  WASTE: '#ef4444', // Red
  FLIGHT: '#ec4899', // Pink
  FUEL: '#f59e0b', // Amber
  HOTEL: '#ec4899', // Pink
  SHIPPING: '#3b82f6', // Blue
  PRODUCT: '#8b5cf6', // Violet
  MATERIAL: '#ef4444', // Red
  RECYCLING: '#ef4444', // Red
  OFFSET: '#10b981', // Emerald
  OTHER: '#9ca3af', // Grey
};

const CATEGORY_ICON_META: Record<
  string,
  {
    icon: LucideIcon;
    className: string;
  }
> = {
  FOOD: {
    icon: Utensils,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  TRANSPORT: {
    icon: Car,
    className: 'bg-teal-50 text-teal-700 ring-teal-100',
  },
  ENERGY: {
    icon: Zap,
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  },
  ELECTRICITY: {
    icon: Zap,
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  },
  SHOPPING: {
    icon: ShoppingBag,
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  WASTE: {
    icon: Trash2,
    className: 'bg-red-50 text-red-700 ring-red-100',
  },
  FLIGHT: {
    icon: Plane,
    className: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  OTHER: {
    icon: Leaf,
    className: 'bg-green-50 text-green-700 ring-green-100',
  },
};

function normalizeCategory(category: string) {
  return category.trim().toUpperCase().replaceAll(' ', '_');
}

function getCategoryIconMeta(category: string) {
  return (
    CATEGORY_ICON_META[normalizeCategory(category)] ?? {
      icon: Package,
      className: 'bg-slate-50 text-slate-700 ring-slate-100',
    }
  );
}

const PERIODS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

async function fetchDashboard(period: DashboardPeriod): Promise<DashboardData> {
  const response = await fetch(`/api/dashboard?period=${period}&t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  const body = (await response.json()) as {
    success: boolean;
    data?: DashboardData;
    error?: { message?: string };
  };

  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? 'Could not load your dashboard.');
  }

  return body.data;
}

function formatCategory(category: string) {
  if (category === 'ENERGY' || category === 'ELECTRICITY') return 'Electricity';
  if (category === 'FLIGHT') return 'Flights';

  return category.charAt(0) + category.slice(1).toLowerCase();
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';

  return 'Good evening';
}

function PeriodSwitcher({
  period,
  onChange,
}: {
  period: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-surface p-1 shadow-sm">
      {PERIODS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'h-8 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25',
            period === item.value
              ? 'bg-accent-primary text-white font-bold'
              : 'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
          )}
          aria-pressed={period === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

interface RechartsItem {
  dataKey: string;
  value: number;
  color?: string;
  fill?: string;
  name?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: RechartsItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const activeItems = payload.filter((item: RechartsItem) => item.value > 0);
    if (activeItems.length === 0) return null;

    const totalDaily = activeItems.reduce((sum: number, item: RechartsItem) => sum + Number(item.value), 0);

    return (
      <div className="rounded-2xl border border-border-default bg-bg-surface p-3 shadow-md text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-text-primary">{label}</p>
        <div className="space-y-1">
          {activeItems.map((item: RechartsItem) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-3 text-text-secondary">
              <span className="flex items-center gap-1.5 min-w-0 text-text-secondary truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill }} />
                <span className="truncate">{formatCategory(String(item.dataKey))}</span>
              </span>
              <span className="font-semibold text-text-primary shrink-0">{Number(item.value).toFixed(1)} kg</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border-default pt-1.5 mt-1 flex justify-between font-bold text-text-primary">
          <span>Total</span>
          <span>{totalDaily.toFixed(1)} kg</span>
        </div>
      </div>
    );
  }
  return null;
};

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: { fill?: string } }>;
}

const CustomPieTooltip = ({ active, payload }: PieTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    if (!item) return null;
    const name = item.name;
    const value = item.value;
    const color = item.color || item.payload?.fill || item.fill || '#9ca3af';

    return (
      <div className="rounded-2xl border border-border-default bg-bg-surface p-3 shadow-md text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-text-primary">{formatCategory(String(name))}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-text-secondary">
            <span className="flex items-center gap-1.5 min-w-0 text-text-secondary truncate">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate">Emissions</span>
            </span>
            <span className="font-semibold text-text-primary shrink-0">{Number(value).toFixed(1)} kg</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const { user } = useUser();

  const [period, setPeriod] = useState<DashboardPeriod>('week');
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const timeout = window.setTimeout(() => setGreeting(getTimeBasedGreeting()), 0);

    const interval = window.setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60 * 1000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const userDisplayName =
    user?.firstName ||
    user?.fullName?.trim().split(' ')[0] ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'there';

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => fetchDashboard(period),
    initialData: period === 'week' ? initialData : undefined,

    // Keeps the previous chart mounted while the selected period fetches.
    // This prevents page jump / skeleton replacement on Day, Week, Month switch.
    placeholderData: (previousData) => previousData ?? initialData,

    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  if (dashboardQuery.isError && !dashboardQuery.data) {
    return (
      <div className="flex min-h-0 w-full flex-col gap-6 pb-6">
        <PageHeader title="Dashboard" description="Your carbon footprint at a glance." />

        <Card>
          <CardContent className="flex flex-col items-start gap-3 pt-5">
            <p className="font-semibold text-text-primary">We couldn’t load your dashboard.</p>
            <p className="text-sm text-text-secondary">{dashboardQuery.error.message}</p>
            <button
              type="button"
              className={buttonVariants()}
              onClick={() => void dashboardQuery.refetch()}
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = dashboardQuery.data ?? initialData;
  const selectedTotal = data.categoryBreakdown.reduce((sum, item) => sum + item.co2eKg, 0);
  const trendHasData = data.trend.some((item) => item.co2eKg > 0);
  const isUpdatingPeriod = dashboardQuery.isFetching && !dashboardQuery.isLoading;

  return (
    <div className="flex min-h-0 w-full flex-col gap-8 pb-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
          Dashboard
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          {greeting}, {userDisplayName}
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          Track your footprint, understand your biggest sources, and choose your next action.
        </p>
      </header>

      <CarbonSnapshotCards data={data} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <BarChart3 className="h-5 w-5" />
                  </div>

                  <CardTitle>Emission Trend</CardTitle>
                </div>

                <CardDescription className="mt-2">
                  Daily emissions for the selected period. Today is highlighted.
                </CardDescription>
              </div>

              <PeriodSwitcher period={period} onChange={setPeriod} />
            </div>
          </CardHeader>

          <CardContent>
            {trendHasData ? (
              <div
                className={cn(
                  'h-72 w-full transition-opacity duration-200',
                  isUpdatingPeriod && 'opacity-70',
                )}
                role="img"
                aria-label="Daily carbon emissions trend"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis 
                      dataKey="label" 
                      tickLine={false} 
                      axisLine={false} 
                      fontSize={11}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const isTodayTick = data.trend.find((t) => t.label === payload.value)?.isToday;
                        return (
                          <text 
                            x={x} 
                            y={Number(y) + 12} 
                            textAnchor="middle" 
                            fontSize={11} 
                            fontWeight={isTodayTick ? 'bold' : 'normal'}
                            fill={isTodayTick ? '#10b981' : '#6b7280'}
                          >
                            {payload.value}
                          </text>
                        );
                      }}
                    />

                    <YAxis
                      width={52}
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      tickFormatter={(value) => `${value} kg`}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {Object.keys(CATEGORY_COLORS).map((category) => (
                      <Bar
                        key={category}
                        dataKey={category}
                        stackId="a"
                        fill={CATEGORY_COLORS[category]}
                        isAnimationActive
                        animationDuration={450}
                        animationEasing="ease-out"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-bg-elevated px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CalendarDays className="h-6 w-6" />
                </div>

                <p className="font-bold text-text-primary">
                  Not enough activity data for a trend yet.
                </p>

                <p className="mt-1 max-w-sm text-sm leading-6 text-text-secondary">
                  Log one activity to see it reflected here immediately.
                </p>

                <Link className={cn(buttonVariants(), 'mt-4')} href="/log">
                  Log Activity
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                    <PieChartIcon className="h-5 w-5" />
                  </div>

                  <CardTitle>Category Breakdown</CardTitle>
                </div>

                <CardDescription className="mt-2">
                  Contribution by category for this {period}.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {data.categoryBreakdown.length > 0 ? (
              <>
                <div
                  className={cn(
                    'h-44 transition-opacity duration-200',
                    isUpdatingPeriod && 'opacity-70',
                  )}
                  role="img"
                  aria-label="Carbon emissions by category"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        dataKey="co2eKg"
                        nameKey="category"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={2}
                        isAnimationActive
                        animationDuration={450}
                        animationEasing="ease-out"
                      >
                        {data.categoryBreakdown.map((item) => (
                          <Cell
                            key={item.category}
                            fill={CATEGORY_COLORS[item.category] ?? '#9ca3af'}
                          />
                        ))}
                      </Pie>

                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className={cn(
                    'space-y-2 transition-opacity duration-200',
                    isUpdatingPeriod && 'opacity-70',
                  )}
                >
                  {data.categoryBreakdown.map((item) => (
                    <div
                      key={item.category}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-text-primary">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? '#9ca3af' }}
                        />
                        {formatCategory(item.category)}
                      </span>

                      <span className="tabular-nums text-text-secondary">
                        {item.co2eKg.toFixed(1)} kg
                      </span>

                      <span className="w-10 text-right tabular-nums text-text-secondary">
                        {item.percent.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-bg-elevated px-6 text-center">
                <p className="font-bold text-text-primary">No emissions logged yet.</p>

                <p className="mt-1 text-sm text-text-secondary">
                  Your category breakdown will appear after you log activity.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QuickActionsCards />

      <ProgressTrackerCards data={data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>

            <CardDescription>
              Your largest individual emission sources for this {period}.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {data.topContributors.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {data.topContributors.map((item) => {
                  const categoryMeta = getCategoryIconMeta(item.category);
                  const CategoryIcon = categoryMeta.icon;

                  return (
                    <Link
                      key={item.id}
                      href={`/activity/${item.id}`}
                      className="group flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 transition-transform duration-200 group-hover:scale-105',
                            categoryMeta.className,
                          )}
                        >
                          <CategoryIcon className="h-5 w-5" aria-hidden="true" />
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-text-primary transition-colors group-hover:text-accent-primary">
                            {item.title}
                          </span>

                          <span className="text-xs font-semibold text-text-secondary">
                            {formatCategory(item.category)}
                          </span>
                        </span>
                      </span>

                      <span className="shrink-0 rounded-full bg-bg-elevated px-3 py-1.5 text-sm font-semibold tabular-nums text-text-primary">
                        {item.co2eKg.toFixed(2)} kg
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-text-secondary">No activities logged for this period.</p>

                <Link className={cn(buttonVariants(), 'mt-4')} href="/log">
                  Log Activity
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <InsightsMessages data={data} period={period} />
      </div>

      <p className="sr-only">Selected period total: {selectedTotal.toFixed(2)} kg CO₂e.</p>
    </div>
  );
}
