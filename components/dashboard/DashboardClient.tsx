'use client';

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import PageHeader from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/src/components/Icon';
import { ActivityCategory, CategoryMetaMap } from '@/src/lib/activity-types';
import { iconMap } from '@/src/lib/icons';

interface DashboardClientProps {
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

const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: '#3b82f6', // blue-500
  FOOD: '#10b981', // emerald-500
  ENERGY: '#eab308', // yellow-500
  SHOPPING: '#a855f7', // purple-500
  WASTE: '#ef4444', // red-500
};

export default function DashboardClient({
  todayFootprint,
  weeklyFootprint,
  monthlyBudget,
  monthlyConsumption,
  remainingBudget,
  trendPercentage,
  weeklyLogs,
  categoryShare,
  recentActivities,
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  // Budget status logic
  const budgetRatio = monthlyBudget > 0 ? monthlyConsumption / monthlyBudget : 0;
  const isBudgetExceeded = monthlyConsumption > monthlyBudget;
  const isBudgetWarning = !isBudgetExceeded && budgetRatio >= 0.8;

  let budgetStatusText = 'On track';
  let budgetBadgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  let budgetProgressBarColor = 'bg-emerald-500';

  if (isBudgetExceeded) {
    budgetStatusText = 'Budget Exceeded';
    budgetBadgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';
    budgetProgressBarColor = 'bg-red-500';
  } else if (isBudgetWarning) {
    budgetStatusText = 'Approaching Limit';
    budgetBadgeColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    budgetProgressBarColor = 'bg-yellow-500';
  }

  // Find highest weekly category for suggestion
  const highestCategoryObj = categoryShare.reduce(
    (max, item) => (item.co2eKg > max.co2eKg ? item : max),
    { category: '', co2eKg: 0 },
  );

  let recommendationText =
    'Welcome to Carbon Compass! Start logging your daily transport, meals, and utility usage under "Log Activity" to receive personalized insights and track your carbon reduction progress.';
  let recommendationTitle = 'Start Tracking';
  let recIcon: keyof typeof iconMap = 'leaf';

  if (highestCategoryObj.co2eKg > 0) {
    const catUpper = highestCategoryObj.category.toUpperCase();
    if (catUpper === 'TRANSPORT') {
      recommendationTitle = 'Optimize Commutes';
      recommendationText =
        'Your transport emissions are your biggest contributor this week. Try swapping car rides for metro, public transit, or cycling where possible, or consider combining trips to reduce weekly fuel consumption.';
      recIcon = 'car';
    } else if (catUpper === 'FOOD') {
      recommendationTitle = 'Green Your Diet';
      recommendationText =
        'Your food choices have the highest footprint this week. Adding a couple of plant-based meals can reduce your food-related emissions by up to 50%.';
      recIcon = 'utensils';
    } else if (catUpper === 'ENERGY') {
      recommendationTitle = 'Save Electricity';
      recommendationText =
        'Your electricity usage is higher than other categories. Consider power-saving settings for household appliances or switching to renewable energy backup configurations.';
      recIcon = 'bolt';
    } else if (catUpper === 'SHOPPING') {
      recommendationTitle = 'Mindful Purchases';
      recommendationText =
        'Your shopping emissions are currently at their peak. Opt for second-hand purchases or high-durability items to reduce manufacturing footprint.';
      recIcon = 'shopping-bag';
    } else if (catUpper === 'WASTE') {
      recommendationTitle = 'Reduce & Recycle';
      recommendationText =
        'Your waste emissions represent a major segment. Focus on composting organic waste and segregating recyclables properly to lower landfill footprint.';
      recIcon = 'trash';
    }
  }

  // Filter out zero categories for pie chart representation
  const pieData = categoryShare
    .filter((item) => item.co2eKg > 0)
    .map((item) => ({
      name: item.category.charAt(0) + item.category.slice(1).toLowerCase(),
      value: Number(item.co2eKg.toFixed(2)),
      color: CATEGORY_COLORS[item.category] || '#94a3b8',
    }));

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Dashboard"
        description="View your carbon footprint summary, monthly budgets, and actionable goals."
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Card */}
        <Card className="hover:shadow-md transition-all duration-200 border-border-default/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Today&apos;s Footprint
            </CardTitle>
            <Icon icon="leaf" className="text-emerald-500 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-text-primary">
              {todayFootprint.toFixed(1)}{' '}
              <span className="text-sm font-normal text-text-secondary">kg CO₂e</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">Logged activity calculations today</p>
          </CardContent>
        </Card>

        {/* Weekly Card */}
        <Card className="hover:shadow-md transition-all duration-200 border-border-default/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Weekly Footprint
            </CardTitle>
            <Icon icon="chart-pie" className="text-blue-500 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-text-primary">
              {weeklyFootprint.toFixed(1)}{' '}
              <span className="text-sm font-normal text-text-secondary">kg CO₂e</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {trendPercentage !== 0 ? (
                <>
                  <span
                    className={`text-xs font-semibold inline-flex items-center ${
                      trendPercentage < 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {trendPercentage < 0 ? '↓' : '↑'} {Math.abs(trendPercentage).toFixed(0)}%
                  </span>
                  <span className="text-xs text-text-secondary">vs previous 7d</span>
                </>
              ) : (
                <span className="text-xs text-text-secondary">No previous week comparison</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Target Card */}
        <Card className="hover:shadow-md transition-all duration-200 border-border-default/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Monthly Target
            </CardTitle>
            <Icon icon="tree" className="text-green-600 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-text-primary">
              {monthlyBudget.toFixed(0)}{' '}
              <span className="text-sm font-normal text-text-secondary">kg CO₂e</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">Maximum limit set for this month</p>
          </CardContent>
        </Card>

        {/* Remaining Budget Card */}
        <Card className="hover:shadow-md transition-all duration-200 border-border-default/60 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Remaining Budget
            </CardTitle>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${budgetBadgeColor}`}
            >
              {budgetStatusText}
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="text-3xl font-bold tracking-tight text-text-primary">
              {remainingBudget.toFixed(1)}{' '}
              <span className="text-sm font-normal text-text-secondary">kg CO₂e</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${budgetProgressBarColor}`}
                style={{ width: `${Math.min(Math.max(budgetRatio * 100, 0), 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Trend Bar Chart */}
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-200 border-border-default/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-text-primary">
              Weekly Footprint Trend
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Emission values (kg CO₂e) tracked across categories over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {mounted ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
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
                      tickFormatter={(value) => `${value}kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                        color: '#0f172a',
                      }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconSize={10}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                    />
                    <Bar
                      dataKey="TRANSPORT"
                      name="Transport"
                      stackId="a"
                      fill={CATEGORY_COLORS.TRANSPORT}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="FOOD"
                      name="Food"
                      stackId="a"
                      fill={CATEGORY_COLORS.FOOD}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="ENERGY"
                      name="Energy"
                      stackId="a"
                      fill={CATEGORY_COLORS.ENERGY}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="SHOPPING"
                      name="Shopping"
                      stackId="a"
                      fill={CATEGORY_COLORS.SHOPPING}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="WASTE"
                      name="Waste"
                      stackId="a"
                      fill={CATEGORY_COLORS.WASTE}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-secondary text-sm">
                Loading charts...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Share Pie Chart */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-text-primary">
              Emissions Share
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Proportional distribution by category over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center justify-center min-h-[300px]">
            {mounted ? (
              pieData.length > 0 ? (
                <>
                  <div className="h-[200px] w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: unknown) => {
                            const numValue = typeof value === 'number' ? value : Number(value) || 0;
                            return [`${numValue.toFixed(1)} kg CO₂e`, 'Emissions'];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full max-w-[240px]">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-text-primary truncate">{entry.name}</span>
                        <span className="text-text-secondary font-medium ml-auto">
                          {entry.value.toFixed(0)}kg
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center justify-center p-6 text-text-secondary space-y-2">
                  <Icon icon="leaf" className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-medium">No emissions data logged yet</p>
                  <p className="text-xs text-zinc-400">
                    Logged values will display their ratios here.
                  </p>
                </div>
              )
            ) : (
              <div className="text-text-secondary text-sm">Loading details...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggestion Panel and Recent Activities Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Context-aware suggestions block */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/60 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-text-primary">
              AI Suggestions
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Personalized carbon-reducing tips matching your logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                <Icon icon={recIcon} className="h-3.5 w-3.5" />
                {recommendationTitle}
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">{recommendationText}</p>
            </div>
            {highestCategoryObj.co2eKg > 0 && (
              <div className="pt-4 mt-auto">
                <Link
                  href="/copilot"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
                >
                  <Icon icon="leaf" className="mr-2 text-white h-3.5 w-3.5" />
                  Discuss with AI Copilot
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities Log */}
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-200 border-border-default/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-text-primary">
                Recent Activities
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary">
                The five most recent logs representing your utility and transport footprint.
              </CardDescription>
            </div>
            <Link
              href="/log"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 hover:underline"
            >
              Log New Activity
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-default text-text-secondary text-xs uppercase tracking-wider">
                      <th className="py-2.5 font-semibold">Date</th>
                      <th className="py-2.5 font-semibold">Category</th>
                      <th className="py-2.5 font-semibold">Activity</th>
                      <th className="py-2.5 font-semibold text-right">Quantity</th>
                      <th className="py-2.5 font-semibold text-right">CO₂e kg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default/50 text-text-primary">
                    {recentActivities.map((log) => {
                      const meta = CategoryMetaMap[log.category as ActivityCategory];
                      const formattedDate = mounted
                        ? new Date(log.occurredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '';

                      // Format subType to human-readable (e.g. petrolCar -> Petrol Car)
                      const readableSubType = log.subType
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase());

                      return (
                        <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <td className="py-3 font-medium text-text-secondary">{formattedDate}</td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={`h-2 w-2 rounded-full shrink-0 ${
                                  meta?.color || 'bg-zinc-500'
                                }`}
                              />
                              {meta?.label || log.category}
                            </span>
                          </td>
                          <td className="py-3 text-text-secondary">
                            <div>
                              <span className="font-medium text-text-primary">
                                {readableSubType}
                              </span>
                              {log.note && (
                                <span className="block text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">
                                  {log.note}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right text-text-secondary">
                            {log.quantity.toFixed(1)} {log.unit}
                          </td>
                          <td className="py-3 text-right font-semibold text-text-primary">
                            {log.co2eKg.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary space-y-3">
                <Icon icon="leaf" className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                <div>
                  <p className="text-sm font-semibold">No activity logs recorded yet</p>
                  <p className="text-xs text-zinc-400">
                    Log details from the &quot;Log Activity&quot; page to update this board.
                  </p>
                </div>
                <Link
                  href="/log"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 shadow-sm transition-colors"
                >
                  Log First Activity
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
