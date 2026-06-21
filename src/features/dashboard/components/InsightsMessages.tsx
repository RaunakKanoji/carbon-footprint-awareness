'use client';

import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  TrendingDown,
  Utensils,
} from 'lucide-react';

import type { ComponentType } from 'react';

import Link from 'next/link';

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

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  day: 'today',
  week: 'this week',
  month: 'this month',
};

type InsightTone = 'emerald' | 'amber' | 'indigo' | 'slate';

type InsightItem = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone: InsightTone;
};

const toneClasses: Record<
  InsightTone,
  {
    icon: string;
    border: string;
    bg: string;
  }
> = {
  emerald: {
    icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    border: 'border-emerald-100',
    bg: 'bg-emerald-50/40',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700 ring-amber-100',
    border: 'border-amber-100',
    bg: 'bg-amber-50/40',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    border: 'border-indigo-100',
    bg: 'bg-indigo-50/40',
  },
  slate: {
    icon: 'bg-slate-50 text-slate-700 ring-slate-100',
    border: 'border-border-subtle',
    bg: 'bg-bg-elevated',
  },
};

function formatCategory(category: string) {
  if (category === 'ENERGY' || category === 'ELECTRICITY') return 'Electricity';
  if (category === 'FLIGHT') return 'Flights';

  return category.charAt(0) + category.slice(1).toLowerCase();
}

function formatKg(value: number | undefined | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0.0';

  return value.toFixed(1);
}

function getTopCategory(data: DashboardData) {
  if (data.categoryBreakdown.length === 0) {
    return null;
  }

  const top = [...data.categoryBreakdown].sort((a, b) => b.co2eKg - a.co2eKg)[0];

  return {
    category: formatCategory(top.category),
    percent: Math.round(top.percent),
    co2eKg: top.co2eKg,
  };
}

export default function InsightsMessages({
  data,
  period,
}: {
  data: DashboardData;
  period: DashboardPeriod;
}) {
  const topCategory = getTopCategory(data);
  const periodLabel = PERIOD_LABELS[period];

  const remainingBudgetKg = data.summary.remainingBudgetKg;
  const monthlyBudgetKg = data.summary.monthlyBudgetKg;
  const budgetUsedKg = Math.max(0, monthlyBudgetKg - remainingBudgetKg);
  const budgetUsedPercent =
    monthlyBudgetKg > 0 ? Math.min(100, Math.round((budgetUsedKg / monthlyBudgetKg) * 100)) : 0;

  const firstRecommendation = data.recommendations[0];

  const topCategoryInsight: InsightItem = topCategory
    ? {
      id: 'top-category',
      title: `${topCategory.category} caused ${topCategory.percent}% of your footprint ${periodLabel}.`,
      description: `That is around ${formatKg(
        topCategory.co2eKg,
      )} kg CO₂e. This is the best place to look first if you want a meaningful reduction.`,
      icon: AlertTriangle,
      tone: 'amber',
    }
    : {
      id: 'top-category-empty',
      title: 'Log a few activities to discover your biggest footprint source.',
      description:
        'Once you add transport, food, energy, shopping, or waste activity, Carbon Compass will identify what matters most.',
      icon: Lightbulb,
      tone: 'slate',
    };

  const budgetInsight: InsightItem =
    remainingBudgetKg > 0
      ? {
        id: 'budget-status',
        title: `You still have ${formatKg(remainingBudgetKg)} kg CO₂e left in your monthly budget.`,
        description: `You have used about ${budgetUsedPercent}% of your ${formatKg(
          monthlyBudgetKg,
        )} kg monthly carbon budget.`,
        icon: TrendingDown,
        tone: 'indigo',
      }
      : {
        id: 'budget-over',
        title: 'You have crossed your monthly carbon budget.',
        description:
          'Focus on one high-impact category first instead of trying to fix everything at once.',
        icon: AlertTriangle,
        tone: 'amber',
      };

  const recommendationInsight: InsightItem = firstRecommendation
    ? {
      id: 'recommendation',
      title: `Try this next: ${firstRecommendation.title}`,
      description: `${firstRecommendation.description} Estimated reduction: ${formatKg(
        firstRecommendation.estimatedReductionKg,
      )} kg CO₂e.`,
      icon: Sparkles,
      tone: 'emerald',
    }
    : {
      id: 'recommendation-empty',
      title: 'Your coach needs a little more data before giving precise advice.',
      description:
        'Log more real activity and the recommendation engine will start suggesting better actions.',
      icon: Sparkles,
      tone: 'slate',
    };

  const insights: InsightItem[] = [
    topCategoryInsight,
    {
      id: 'plant-based-meal',
      title: 'Eating one plant-based meal could save around 1.2 kg CO₂e.',
      description:
        'Use this as a simple prototype estimate. The real saving depends on what meal you replace and where you live.',
      icon: Utensils,
      tone: 'emerald',
    },
    budgetInsight,
    recommendationInsight,
  ];

  return (
    <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
      <CardHeader>
        <CardTitle>Carbon Coach Messages</CardTitle>

        <CardDescription>
          Personalized observations from your footprint, budget, and recent actions.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          const colors = toneClasses[insight.tone];

          return (
            <div
              key={insight.id}
              className={cn('rounded-2xl border p-4 transition-colors', colors.border, colors.bg)}
            >
              <div className="flex gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1',
                    colors.icon,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold leading-6 text-text-primary">{insight.title}</p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Link className={buttonVariants({ variant: 'outline' })} href="/coach">
            Ask Carbon Coach
          </Link>

          <Link
            href="/insights"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
          >
            View all insights
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
