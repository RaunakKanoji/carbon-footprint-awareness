'use client';

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  CalendarDays,
  ChevronDown,
  Filter,
  Info,
  Leaf,
  Table,
  TrendingUp,
} from 'lucide-react';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { formatDisplayLabel } from '@/src/lib/format-label';

const CATEGORY_META = {
  TRANSPORT: {
    label: 'Transport',
    color: '#3b82f6',
    chipClass: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  FOOD: {
    label: 'Food',
    color: '#10b981',
    chipClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  ENERGY: {
    label: 'Energy',
    color: '#f59e0b',
    chipClass: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  SHOPPING: {
    label: 'Shopping',
    color: '#8b5cf6',
    chipClass: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
  WASTE: {
    label: 'Waste',
    color: '#ef4444',
    chipClass: 'bg-red-50 text-red-700 ring-red-100',
  },
};

interface Log {
  id: string;
  category: string;
  subType: string;
  quantity: number;
  unit: string;
  co2eKg: number;
  occurredAt: string;
}

interface InsightsClientProps {
  initialLogs: Log[];
}

type TimeRange = '30d' | '90d' | '12m';

const timeRangeLabels: Record<TimeRange, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

function getStartOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function getEndOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(23, 59, 59, 999);
  return day;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function MetricCard({
  label,
  value,
  suffix,
  description,
  icon,
  accentClassName,
  children,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  description: string;
  icon: React.ReactNode;
  accentClassName: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
              {label}
            </p>

            <p className="mt-3 text-2xl font-black tracking-tight text-text-primary">
              {value}
              {suffix ? (
                <span className="ml-1 text-xs font-bold text-text-secondary">{suffix}</span>
              ) : null}
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">
              {description}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${accentClassName}`}
          >
            {icon}
          </div>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

function EmptyChartState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-elevated/35 p-6 text-center">
      <Activity className="h-7 w-7 text-text-muted" />

      <p className="mt-3 text-sm font-black text-text-primary">{title}</p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-text-secondary">{description}</p>
    </div>
  );
}

function PanelHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border-subtle px-5 py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-bg-elevated text-text-secondary ring-1 ring-border-subtle">
        {icon}
      </div>

      <div>
        <h3 className="font-black leading-6 text-text-primary">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

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
        <p className="font-bold text-text-primary">{name}</p>
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

export default function InsightsClient({ initialLogs }: InsightsClientProps) {
  const [range, setRange] = useState<TimeRange>('30d');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showTable, setShowTable] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const now = useMemo(() => new Date(), []);

  const boundaries = useMemo(() => {
    const todayStart = getStartOfDay(now);
    const currentPeriodEnd = getEndOfDay(now);

    if (range === '30d') {
      const currentPeriodStart = addDays(todayStart, -29);
      const previousPeriodStart = addDays(currentPeriodStart, -30);

      return {
        currentPeriodStart,
        currentPeriodEnd,
        previousPeriodStart,
        daysCount: 30,
      };
    }

    if (range === '90d') {
      const currentPeriodStart = addDays(todayStart, -89);
      const previousPeriodStart = addDays(currentPeriodStart, -90);

      return {
        currentPeriodStart,
        currentPeriodEnd,
        previousPeriodStart,
        daysCount: 90,
      };
    }

    const currentPeriodStart = addDays(todayStart, -364);
    const previousPeriodStart = addDays(currentPeriodStart, -365);

    return {
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      daysCount: 365,
    };
  }, [range, now]);

  const { currentLogs, previousLogs } = useMemo(() => {
    const { currentPeriodStart, currentPeriodEnd, previousPeriodStart } = boundaries;

    const current = initialLogs.filter((log) => {
      const logDate = new Date(log.occurredAt);
      return logDate >= currentPeriodStart && logDate <= currentPeriodEnd;
    });

    const previous = initialLogs.filter((log) => {
      const logDate = new Date(log.occurredAt);
      return logDate >= previousPeriodStart && logDate < currentPeriodStart;
    });

    if (categoryFilter === 'ALL') {
      return {
        currentLogs: current,
        previousLogs: previous,
      };
    }

    return {
      currentLogs: current.filter((log) => log.category === categoryFilter),
      previousLogs: previous.filter((log) => log.category === categoryFilter),
    };
  }, [initialLogs, boundaries, categoryFilter]);

  const metrics = useMemo(() => {
    const totalCurrent = currentLogs.reduce((sum, log) => sum + log.co2eKg, 0);
    const totalPrevious = previousLogs.reduce((sum, log) => sum + log.co2eKg, 0);
    const count = currentLogs.length;
    const dailyAvg = totalCurrent / boundaries.daysCount;

    const percentChange =
      totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : 0;

    return {
      totalCurrent,
      totalPrevious,
      count,
      dailyAvg,
      percentChange,
    };
  }, [currentLogs, previousLogs, boundaries.daysCount]);

  const trendChartData = useMemo(() => {
    if (!isMounted) return [];

    const dataMap: Record<string, { label: string; date: Date; emissions: number }> = {};

    if (range === '12m') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        dataMap[key] = {
          label: date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          }),
          date,
          emissions: 0,
        };
      }

      currentLogs.forEach((log) => {
        const date = new Date(log.occurredAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (dataMap[key]) {
          dataMap[key].emissions += log.co2eKg;
        }
      });
    } else {
      const limit = range === '30d' ? 30 : 90;

      for (let i = limit - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = formatDateKey(date);

        dataMap[key] = {
          label: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          date,
          emissions: 0,
        };
      }

      currentLogs.forEach((log) => {
        const date = new Date(log.occurredAt);
        const key = formatDateKey(date);

        if (dataMap[key]) {
          dataMap[key].emissions += log.co2eKg;
        }
      });
    }

    return Object.values(dataMap).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentLogs, range, now, isMounted]);

  const categoryShareData = useMemo(() => {
    const shares: Record<string, number> = {};

    currentLogs.forEach((log) => {
      shares[log.category] = (shares[log.category] || 0) + log.co2eKg;
    });

    return Object.entries(shares)
      .map(([category, emissions]) => {
        const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];

        return {
          name: meta?.label || formatDisplayLabel(category),
          value: emissions,
          color: meta?.color || '#94a3b8',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [currentLogs]);

  const topSubtypesData = useMemo(() => {
    const subtypes: Record<string, { subType: string; category: string; emissions: number }> = {};

    currentLogs.forEach((log) => {
      const key = `${log.category}_${log.subType}`;

      if (!subtypes[key]) {
        subtypes[key] = {
          subType: log.subType,
          category: log.category,
          emissions: 0,
        };
      }

      subtypes[key].emissions += log.co2eKg;
    });

    return Object.values(subtypes)
      .map((item) => {
        const meta = CATEGORY_META[item.category as keyof typeof CATEGORY_META];

        return {
          name: `${formatDisplayLabel(item.subType)} · ${meta?.label || formatDisplayLabel(item.category)
            }`,
          emissions: item.emissions,
          color: meta?.color || '#94a3b8',
        };
      })
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5);
  }, [currentLogs]);

  const weekdayWeekendData = useMemo(() => {
    let weekdayEmissions = 0;
    let weekendEmissions = 0;

    currentLogs.forEach((log) => {
      const day = new Date(log.occurredAt).getDay();

      if (day === 0 || day === 6) {
        weekendEmissions += log.co2eKg;
      } else {
        weekdayEmissions += log.co2eKg;
      }
    });

    return [
      {
        name: 'Weekdays',
        emissions: Number(weekdayEmissions.toFixed(1)),
      },
      {
        name: 'Weekends',
        emissions: Number(weekendEmissions.toFixed(1)),
      },
    ];
  }, [currentLogs]);

  const heatmapData = useMemo(() => {
    if (!isMounted) return [];

    const limit = range === '30d' ? 35 : range === '90d' ? 91 : 112;
    const startOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() - limit + 1);
    const startDay = startOfRange.getDay();
    const startOfHeatmap = new Date(startOfRange.getTime() - startDay * 24 * 60 * 60 * 1000);
    const totalDays = limit + startDay;

    const data: {
      date: Date;
      dateStr: string;
      emissions: number;
      count: number;
    }[] = [];

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startOfHeatmap.getTime() + i * 24 * 60 * 60 * 1000);

      data.push({
        date,
        dateStr: formatDateKey(date),
        emissions: 0,
        count: 0,
      });
    }

    currentLogs.forEach((log) => {
      const date = new Date(log.occurredAt);
      const key = formatDateKey(date);
      const entry = data.find((item) => item.dateStr === key);

      if (entry) {
        entry.emissions += log.co2eKg;
        entry.count += 1;
      }
    });

    return data;
  }, [currentLogs, range, now, isMounted]);

  const heatmapWeeks = useMemo(() => {
    const weeks: (typeof heatmapData)[] = [];
    let currentWeek: typeof heatmapData = [];

    heatmapData.forEach((day, index) => {
      currentWeek.push(day);

      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, [heatmapData]);

  const totalCategoryShare = categoryShareData.reduce((sum, item) => sum + item.value, 0);

  const highestSubtypeEmission = topSubtypesData[0]?.emissions ?? 0;

  function getHeatmapColor(emissions: number) {
    if (emissions === 0) return 'bg-bg-elevated border-border-subtle';
    if (emissions <= 5) return 'bg-emerald-100 border-emerald-200';
    if (emissions <= 15) return 'bg-emerald-300 border-emerald-300';
    if (emissions <= 30) return 'bg-emerald-500 border-emerald-500';
    return 'bg-emerald-700 border-emerald-700';
  }

  function getHeatmapTitle(day: { date: Date; emissions: number; count: number }) {
    const dateStr = day.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${dateStr}: ${day.emissions.toFixed(1)} kg CO₂e · ${day.count} activities`;
  }

  if (!isMounted) {
    return (
      <div className="flex h-72 items-center justify-center rounded-3xl border border-border-default bg-bg-surface text-sm font-semibold text-text-secondary">
        <Activity className="mr-2 h-5 w-5 animate-spin" />
        Loading insights…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-3xl border border-border-default bg-bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
            Analysis controls
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Filter your footprint by time range and category.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />

            <select
              value={range}
              onChange={(event) => setRange(event.target.value as TimeRange)}
              aria-label="Insight time range"
              className="h-10 cursor-pointer appearance-none rounded-xl border border-border-default bg-bg-surface pl-9 pr-9 text-sm font-bold text-text-primary shadow-sm transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/30"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Insight category filter"
              className="h-10 cursor-pointer appearance-none rounded-xl border border-border-default bg-bg-surface pl-3 pr-9 text-sm font-bold text-text-primary shadow-sm transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/30"
            >
              <option value="ALL">All categories</option>
              <option value="TRANSPORT">Transport</option>
              <option value="FOOD">Food</option>
              <option value="ENERGY">Energy</option>
              <option value="SHOPPING">Shopping</option>
              <option value="WASTE">Waste</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total emissions"
          value={metrics.totalCurrent.toFixed(1)}
          suffix="kg CO₂e"
          description={`${timeRangeLabels[range]} footprint`}
          icon={<Leaf className="h-5 w-5" />}
          accentClassName="bg-emerald-50 text-emerald-700 ring-emerald-100"
        >
          <div className="flex items-center text-xs font-bold">
            {metrics.percentChange > 0 ? (
              <span className="mr-1 flex items-center text-red-600">
                <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                {metrics.percentChange.toFixed(1)}%
              </span>
            ) : metrics.percentChange < 0 ? (
              <span className="mr-1 flex items-center text-emerald-600">
                <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                {Math.abs(metrics.percentChange).toFixed(1)}%
              </span>
            ) : (
              <span className="mr-1 text-text-muted">—</span>
            )}

            <span className="text-text-muted">vs previous period</span>
          </div>
        </MetricCard>

        <MetricCard
          label="Daily average"
          value={metrics.dailyAvg.toFixed(1)}
          suffix="kg/day"
          description={`Smoothed over ${boundaries.daysCount} days`}
          icon={<TrendingUp className="h-5 w-5" />}
          accentClassName="bg-blue-50 text-blue-700 ring-blue-100"
        />

        <MetricCard
          label="Activity logs"
          value={metrics.count}
          suffix="logs"
          description="Tracked in selected range"
          icon={<Activity className="h-5 w-5" />}
          accentClassName="bg-amber-50 text-amber-700 ring-amber-100"
        />

        <MetricCard
          label="Tree equivalent"
          value={Math.max(0, Math.round(metrics.totalCurrent / 20))}
          suffix="trees"
          description="Simple offset comparison"
          icon={<Leaf className="h-5 w-5" />}
          accentClassName="bg-emerald-50 text-emerald-700 ring-emerald-100"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <PanelHeader
            icon={<TrendingUp className="h-4 w-4" />}
            title="Emissions trend"
            description="Daily or monthly CO₂e movement across the selected period."
          />

          <CardContent className="p-5">
            {currentLogs.length === 0 ? (
              <EmptyChartState
                title="No records found"
                description="Log activities to start building your footprint trend."
              />
            ) : showTable ? (
              <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-border-default">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-default bg-bg-elevated text-text-secondary">
                      <th className="p-3 font-black">Period</th>
                      <th className="p-3 text-right font-black">Emissions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {trendChartData.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-border-subtle last:border-b-0 hover:bg-bg-elevated/50"
                      >
                        <td className="p-3 font-semibold text-text-primary">{row.label}</td>
                        <td className="p-3 text-right font-black text-text-primary">
                          {row.emissions.toFixed(1)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendChartData}
                    margin={{
                      top: 10,
                      right: 16,
                      left: 4,
                      bottom: 8,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                    <XAxis
                      dataKey="label"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      width={58}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}kg`}
                    />

                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'CO₂e']}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="emissions"
                      name="CO₂e emissions"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEmissions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTable((current) => !current)}
                className="h-9 rounded-full text-xs font-black"
              >
                <Table className="mr-2 h-3.5 w-3.5" />
                {showTable ? 'Show chart' : 'View data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <PanelHeader
            icon={<BarChart2 className="h-4 w-4" />}
            title="Category split"
            description="Share of CO₂e impact by lifestyle category."
          />

          <CardContent className="p-5">
            {categoryShareData.length === 0 ? (
              <EmptyChartState
                title="No category data"
                description="Category distribution will appear after you log activities."
              />
            ) : (
              <>
                <div className="relative h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={78}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryShareData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>

                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-text-muted">
                      Total
                    </span>

                    <span className="text-xl font-black text-text-primary">
                      {metrics.totalCurrent.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {categoryShareData.map((item) => {
                    const percentage =
                      totalCategoryShare > 0 ? Math.round((item.value / totalCategoryShare) * 100) : 0;

                    return (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />

                        <span className="truncate font-bold text-text-secondary">{item.name}</span>

                        <span className="ml-auto font-black text-text-primary">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <PanelHeader
            icon={<Info className="h-4 w-4" />}
            title="Top carbon drivers"
            description="Your highest-emission activity types in this period."
          />

          <CardContent className="p-5">
            {topSubtypesData.length === 0 ? (
              <EmptyChartState
                title="No drivers yet"
                description="Your biggest carbon drivers will appear here."
              />
            ) : (
              <div className="space-y-4">
                {topSubtypesData.map((item, index) => {
                  const percent =
                    highestSubtypeEmission > 0 ? (item.emissions / highestSubtypeEmission) * 100 : 0;

                  return (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate font-black text-text-primary">
                          {index + 1}. {item.name}
                        </span>

                        <span className="shrink-0 font-black text-text-secondary">
                          {item.emissions.toFixed(1)} kg
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <PanelHeader
            icon={<CalendarDays className="h-4 w-4" />}
            title="Week pattern"
            description="Compares weekday impact against weekend impact."
          />

          <CardContent className="p-5">
            {currentLogs.length === 0 ? (
              <EmptyChartState
                title="No pattern yet"
                description="Log activities across multiple days to compare patterns."
              />
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekdayWeekendData}
                    barCategoryGap="24%"
                    margin={{
                      top: 10,
                      right: 8,
                      left: 0,
                      bottom: 8,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      width={48}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}kg`}
                    />

                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'CO₂e']} />

                    <Bar dataKey="emissions" name="CO₂e" radius={[6, 6, 0, 0]} barSize={34}>
                      {weekdayWeekendData.map((entry, index) => (
                        <Cell key={entry.name} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <PanelHeader
            icon={<Activity className="h-4 w-4" />}
            title="Activity heatmap"
            description="Daily carbon intensity based on logged activity."
          />

          <CardContent className="p-5">
            {heatmapWeeks.length === 0 ? (
              <EmptyChartState
                title="Heatmap loading"
                description="Your activity heatmap is being prepared."
              />
            ) : (
              <div className="flex min-h-[220px] flex-col justify-center">
                <div className="w-full overflow-x-auto overflow-y-visible px-1 py-2">
                  <div className="flex gap-1.5 select-none">
                    {heatmapWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex shrink-0 flex-col gap-1.5">
                        {week.map((day) => (
                          <div
                            key={day.dateStr}
                            title={getHeatmapTitle(day)}
                            className={`h-3.5 w-3.5 cursor-help rounded-sm border transition-shadow hover:ring-2 hover:ring-text-muted/30 hover:ring-offset-1 ${getHeatmapColor(
                              day.emissions,
                            )}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-1.5 text-xs font-semibold text-text-muted">
                  <span>Less</span>
                  <span className="h-2.5 w-2.5 rounded-sm border border-border-subtle bg-bg-elevated" />
                  <span className="h-2.5 w-2.5 rounded-sm border border-emerald-200 bg-emerald-100" />
                  <span className="h-2.5 w-2.5 rounded-sm border border-emerald-300 bg-emerald-300" />
                  <span className="h-2.5 w-2.5 rounded-sm border border-emerald-500 bg-emerald-500" />
                  <span className="h-2.5 w-2.5 rounded-sm border border-emerald-700 bg-emerald-700" />
                  <span>More</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
