'use client';

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart2,
  Calendar,
  ChevronDown,
  Filter,
  Info,
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

import React, { useEffect, useMemo, useState } from 'react';

import PageHeader from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDisplayLabel } from '@/lib/format-label';

// Mapped category display metadata
const CATEGORY_META = {
  TRANSPORT: { label: 'Transport', color: '#3b82f6', bgClass: 'bg-blue-500' },
  FOOD: { label: 'Food', color: '#10b981', bgClass: 'bg-emerald-500' },
  ENERGY: { label: 'Energy', color: '#eab308', bgClass: 'bg-yellow-500' },
  SHOPPING: { label: 'Shopping', color: '#a855f7', bgClass: 'bg-purple-500' },
  WASTE: { label: 'Waste', color: '#ef4444', bgClass: 'bg-red-500' },
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

export default function InsightsClient({ initialLogs }: InsightsClientProps) {
  const [range, setRange] = useState<TimeRange>('30d');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showTable, setShowTable] = useState(false);

  // Hydration safety flag
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  const now = useMemo(() => new Date(), []);

  // Time boundary calculation
  const boundaries = useMemo(() => {
    let currentPeriodStart: Date;
    let previousPeriodStart: Date;
    let daysCount = 30;

    const baseDate = new Date(now);

    if (range === '30d') {
      daysCount = 30;
      currentPeriodStart = new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(baseDate.getTime() - 60 * 24 * 60 * 60 * 1000);
    } else if (range === '90d') {
      daysCount = 90;
      currentPeriodStart = new Date(baseDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(baseDate.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else {
      // '12m'
      daysCount = 365;
      currentPeriodStart = new Date(baseDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(baseDate.getTime() - 730 * 24 * 60 * 60 * 1000);
    }

    return { currentPeriodStart, previousPeriodStart, daysCount };
  }, [range, now]);

  // Filter logs based on date range and category
  const filteredData = useMemo(() => {
    const { currentPeriodStart, previousPeriodStart } = boundaries;

    // Filter by dates
    const currentLogs = initialLogs.filter((log) => {
      const logDate = new Date(log.occurredAt);
      return logDate >= currentPeriodStart && logDate <= now;
    });

    const previousLogs = initialLogs.filter((log) => {
      const logDate = new Date(log.occurredAt);
      return logDate >= previousPeriodStart && logDate < currentPeriodStart;
    });

    // Filter by category
    if (categoryFilter === 'ALL') {
      return { currentLogs, previousLogs };
    } else {
      return {
        currentLogs: currentLogs.filter((log) => log.category === categoryFilter),
        previousLogs: previousLogs.filter((log) => log.category === categoryFilter),
      };
    }
  }, [initialLogs, boundaries, categoryFilter, now]);

  const { currentLogs, previousLogs } = filteredData;

  // Primary Metrics calculation
  const metrics = useMemo(() => {
    const totalCurrent = currentLogs.reduce((sum, log) => sum + log.co2eKg, 0);
    const totalPrevious = previousLogs.reduce((sum, log) => sum + log.co2eKg, 0);
    const count = currentLogs.length;
    const dailyAvg = count > 0 ? totalCurrent / boundaries.daysCount : 0;

    let percentChange = 0;
    if (totalPrevious > 0) {
      percentChange = ((totalCurrent - totalPrevious) / totalPrevious) * 100;
    }

    return {
      totalCurrent,
      totalPrevious,
      count,
      dailyAvg,
      percentChange,
    };
  }, [currentLogs, previousLogs, boundaries]);

  // 1. Trend Line/Area Chart Data
  const trendChartData = useMemo(() => {
    if (!isMounted) return [];

    const dataMap: { [key: string]: { label: string; date: Date; emissions: number } } = {};

    if (range === '12m') {
      // Last 12 months aggregation
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
          timeZone: 'UTC',
        });
        dataMap[key] = { label, date: d, emissions: 0 };
      }

      currentLogs.forEach((log) => {
        const logDate = new Date(log.occurredAt);
        const key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
        if (dataMap[key]) {
          dataMap[key].emissions += log.co2eKg;
        }
      });
    } else {
      // Daily aggregation for 30d/90d
      const limit = range === '30d' ? 30 : 90;
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dataMap[key] = { label, date: d, emissions: 0 };
      }

      currentLogs.forEach((log) => {
        const logDate = new Date(log.occurredAt);
        const key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
        if (dataMap[key]) {
          dataMap[key].emissions += log.co2eKg;
        }
      });
    }

    return Object.values(dataMap).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentLogs, range, now, isMounted]);

  // 2. Category Share Doughnut Chart Data
  const categoryShareData = useMemo(() => {
    const shares: { [key: string]: number } = {};

    currentLogs.forEach((log) => {
      shares[log.category] = (shares[log.category] || 0) + log.co2eKg;
    });

    return Object.entries(shares)
      .map(([cat, emissions]) => {
        const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META] || {
          label: cat,
          color: '#94a3b8',
        };
        return {
          name: meta.label,
          value: Math.round(emissions),
          color: meta.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [currentLogs]);

  // 3. Top Contributing Subtypes Data
  const topSubtypesData = useMemo(() => {
    const subtypes: { [key: string]: { subType: string; category: string; emissions: number } } =
      {};

    currentLogs.forEach((log) => {
      const key = `${log.category}_${log.subType}`;
      if (!subtypes[key]) {
        subtypes[key] = { subType: log.subType, category: log.category, emissions: 0 };
      }
      subtypes[key].emissions += log.co2eKg;
    });

    return Object.values(subtypes)
      .map((item) => {
        const meta = CATEGORY_META[item.category as keyof typeof CATEGORY_META];
        return {
          name: `${formatDisplayLabel(item.subType)} (${meta?.label || formatDisplayLabel(item.category)})`,
          emissions: Math.round(item.emissions),
          color: meta?.color || '#3b82f6',
        };
      })
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5); // Limit to top 5
  }, [currentLogs]);

  // 4. Weekday vs Weekend Aggregation
  const weekdayWeekendData = useMemo(() => {
    let weekdayEmissions = 0;
    let weekendEmissions = 0;

    currentLogs.forEach((log) => {
      const day = new Date(log.occurredAt).getDay(); // 0 is Sunday, 6 is Saturday
      if (day === 0 || day === 6) {
        weekendEmissions += log.co2eKg;
      } else {
        weekdayEmissions += log.co2eKg;
      }
    });

    return [
      { name: 'Weekdays (Mon-Fri)', emissions: Math.round(weekdayEmissions) },
      { name: 'Weekends (Sat-Sun)', emissions: Math.round(weekendEmissions) },
    ];
  }, [currentLogs]);

  // 5. Heatmap Daily Blocks Data
  const heatmapData = useMemo(() => {
    if (!isMounted) return [];

    // Layout configuration: multiples of 7 for complete weeks
    const limit = range === '30d' ? 35 : range === '90d' ? 91 : 112;
    const data: { date: Date; dateStr: string; emissions: number; count: number }[] = [];

    // Shift start backward to align the first block on a Sunday
    const startOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() - limit + 1);
    const startDay = startOfRange.getDay();
    const startOfHeatmap = new Date(startOfRange.getTime() - startDay * 24 * 60 * 60 * 1000);

    const totalDays = limit + startDay;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startOfHeatmap.getTime() + i * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      data.push({
        date: d,
        dateStr: key,
        emissions: 0,
        count: 0,
      });
    }

    currentLogs.forEach((log) => {
      const logDate = new Date(log.occurredAt);
      const key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
      const entry = data.find((e) => e.dateStr === key);
      if (entry) {
        entry.emissions += log.co2eKg;
        entry.count += 1;
      }
    });

    return data;
  }, [currentLogs, range, now, isMounted]);

  // Group Heatmap into week columns
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

  // Helper to resolve intensity color levels
  const getHeatmapColor = (emissions: number) => {
    if (emissions === 0) return 'bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200/5';
    if (emissions <= 5)
      return 'bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-500/10 text-emerald-800';
    if (emissions <= 15)
      return 'bg-emerald-300 dark:bg-emerald-850/60 border border-emerald-500/20';
    if (emissions <= 30)
      return 'bg-emerald-500 dark:bg-emerald-600/80 border border-emerald-500/30';
    return 'bg-emerald-700 dark:bg-emerald-450 border border-emerald-500/50';
  };

  const getHeatmapTitle = (day: { date: Date; emissions: number; count: number }) => {
    const dateStr = day.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${dateStr}: ${day.emissions.toFixed(1)} kg CO₂e (${day.count} activities)`;
  };

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Footprint Insights"
          description="Explore detailed analysis and trend histories of your carbon impact."
          badge="Analytics"
        />
        <div className="h-96 flex items-center justify-center text-text-muted text-sm">
          <Activity className="animate-spin h-5 w-5 mr-2" />
          Loading footprint analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header — border-b wraps the full row so the divider spans full width */}
      <section className="border-b border-border-default pb-5">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Title block */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">Footprint Insights</h1>
              <span className="inline-flex items-center rounded-full bg-accent-primary-dim px-2.5 py-0.5 text-xs font-semibold text-accent-primary border border-accent-primary/20">
                Analytics
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Explore detailed analysis and trend histories of your carbon impact.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Time Range Select */}
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as TimeRange)}
                className="h-8 appearance-none rounded-lg border border-border-default/60 bg-bg-surface pl-7 pr-8 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-accent-primary/30 cursor-pointer"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="12m">Last 12 Months</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            </div>

            {/* Category Select */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-border-default/60 bg-bg-surface pl-3 pr-8 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-accent-primary/30 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="TRANSPORT">Transport</option>
                <option value="FOOD">Food</option>
                <option value="ENERGY">Energy</option>
                <option value="SHOPPING">Shopping</option>
                <option value="WASTE">Waste</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total emissions */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Total Emissions
            </CardDescription>
            <CardTitle className="text-2xl font-black text-text-primary tracking-tight">
              {metrics.totalCurrent.toFixed(1)}{' '}
              <span className="text-xs font-medium text-text-secondary">kg CO₂e</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs">
              {metrics.percentChange > 0 ? (
                <span className="text-state-error flex items-center font-bold mr-1">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {metrics.percentChange.toFixed(1)}%
                </span>
              ) : metrics.percentChange < 0 ? (
                <span className="text-state-success flex items-center font-bold mr-1">
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  {Math.abs(metrics.percentChange).toFixed(1)}%
                </span>
              ) : (
                <span className="text-text-muted font-bold mr-1">—</span>
              )}
              <span className="text-text-muted">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Average */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Daily Average
            </CardDescription>
            <CardTitle className="text-2xl font-black text-text-primary tracking-tight">
              {metrics.dailyAvg.toFixed(1)}{' '}
              <span className="text-xs font-medium text-text-secondary">kg CO₂e</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-text-muted">
              Smoothed over {boundaries.daysCount} active days
            </div>
          </CardContent>
        </Card>

        {/* Action Tally */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Logged Activities
            </CardDescription>
            <CardTitle className="text-2xl font-black text-text-primary tracking-tight">
              {metrics.count} <span className="text-xs font-medium text-text-secondary">logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-text-muted">Habits tracked in this period</div>
          </CardContent>
        </Card>

        {/* Eco Reduction equivalent */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/50 relative overflow-hidden bg-emerald-500/5 dark:bg-emerald-500/0">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center">
              <Award className="w-3.5 h-3.5 mr-1" />
              Equivalents
            </CardDescription>
            <CardTitle className="text-2xl font-black text-text-primary tracking-tight">
              {Math.max(0, Math.round(metrics.totalCurrent / 20.0))}{' '}
              <span className="text-xs font-medium text-text-secondary">trees</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-text-muted">Offset equivalence in saplings</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend line chart */}
        <Card className="lg:col-span-2 border-border-default/50 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-text-primary flex items-center">
                <TrendingUp className="w-4 h-4 text-accent-primary mr-1.5" />
                Emissions Trend History
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary">
                Cumulative footprint variations tracked over selected timeframe.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTable(!showTable)}
              className="text-xs font-semibold flex items-center gap-1 border-border-default/60 hover:bg-zinc-50"
            >
              <Table className="w-3.5 h-3.5" />
              {showTable ? 'Hide Data' : 'View Data'}
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            {currentLogs.length === 0 ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
                <Activity className="h-8 w-8 text-text-muted mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-text-secondary">No records found</p>
                <p className="text-xs text-text-muted">
                  Log activities to display trend analytics.
                </p>
              </div>
            ) : showTable ? (
              <div className="h-[280px] overflow-y-auto border border-border-default/40 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-border-default/40 font-bold">
                      <th className="p-3">Period</th>
                      <th className="p-3 text-right">Emissions (kg CO₂e)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendChartData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border-default/30 hover:bg-zinc-50/50"
                      >
                        <td className="p-3 font-medium">{row.label}</td>
                        <td className="p-3 text-right font-semibold">{row.emissions.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#0f172a',
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
          </CardContent>
        </Card>

        {/* Category Share Distribution */}
        <Card className="border-border-default/50 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-text-primary flex items-center">
              <BarChart2 className="w-4 h-4 text-blue-500 mr-1.5" />
              Category Share
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Percentage split of CO₂e impact by category.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col justify-between h-[290px]">
            {categoryShareData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-text-muted">No data available for selected category</p>
              </div>
            ) : (
              <>
                <div className="h-[170px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} kg`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-text-secondary uppercase">Total</span>
                    <span className="text-lg font-black text-text-primary tracking-tight">
                      {Math.round(metrics.totalCurrent)}
                    </span>
                  </div>
                </div>

                {/* Pie chart legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] mt-2 overflow-y-auto max-h-[85px] pt-1">
                  {categoryShareData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-text-secondary truncate font-medium">{item.name}</span>
                      <span className="text-text-primary font-bold ml-auto">
                        {Math.round((item.value / metrics.totalCurrent) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subtypes & Heatmap grid row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Contributing Subtypes */}
        <Card className="border-border-default/50 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-text-primary flex items-center">
              <Info className="w-4 h-4 text-purple-500 mr-1.5" />
              Top Carbon Drivers
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Top 5 emission contributing activity subtypes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {topSubtypesData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-xs">
                No logs tracked in this range
              </div>
            ) : (
              <div className="space-y-3 pt-0">
                {topSubtypesData.map((item, idx) => {
                  const maxVal = topSubtypesData[0].emissions;
                  const pct = maxVal > 0 ? (item.emissions / maxVal) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-text-primary truncate max-w-[200px]">
                          {idx + 1}. {item.name}
                        </span>
                        <span className="text-text-secondary text-right">{item.emissions} kg</span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-800 rounded-full h-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekday vs Weekend Comparison */}
        <Card className="border-border-default/50 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-text-primary flex items-center">
              <Calendar className="w-4 h-4 text-emerald-500 mr-1.5" />
              Commute Pattern
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Emissions split comparing weekdays versus weekends.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {currentLogs.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-xs">
                No activity logs available
              </div>
            ) : (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekdayWeekendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}kg`}
                    />
                    <Tooltip />
                    <Bar dataKey="emissions" name="CO₂e" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {weekdayWeekendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Heatmap intensity grid */}
        <Card className="border-border-default/50 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-text-primary flex items-center">
              <Activity className="w-4 h-4 text-yellow-500 mr-1.5" />
              Activity Heatmap
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Daily logged carbon intensity. Row flow represents Sun-Sat.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col justify-between h-[200px]">
            {heatmapWeeks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
                Heatmap details not initialized
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center">
                {/* px-1 pt-1 gives the hover ring room so it isn't clipped by overflow-x-auto */}
                <div className="w-full overflow-x-auto overflow-y-visible px-1 pt-1 pb-2">
                  <div className="flex gap-1.5 select-none scrollbar-thin scrollbar-thumb-zinc-200">
                    {heatmapWeeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-1.5 shrink-0">
                        {week.map((day, dayIdx) => (
                          <div
                            key={dayIdx}
                            title={getHeatmapTitle(day)}
                            className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 cursor-help hover:ring-2 hover:ring-zinc-400 hover:ring-offset-1 ${getHeatmapColor(
                              day.emissions,
                            )}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center gap-1.5 justify-end text-[9px] text-text-muted mt-3">
                  <span>Less</span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200/5" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 dark:bg-emerald-950/30" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-850/60" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-600/80" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700 dark:bg-emerald-400" />
                  <span>More</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
