import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CalendarDays,
  Car,
  Database,
  Gauge,
  Leaf,
  Package,
  RefreshCcw,
  ShoppingBag,
  Trash2,
  Utensils,
  Zap,
} from 'lucide-react';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button, buttonVariants } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { formatDisplayLabel } from '@/src/lib/format-label';
import { cn } from '@/src/lib/utils';
import { getCurrentUser } from '@/src/lib/auth';
import { prisma } from '@/src/db/prisma';

import { deleteActivity } from './actions';

function formatCategory(category: string) {
  if (category === 'TRANSPORT') return 'Travel';
  if (category === 'ENERGY' || category === 'ELECTRICITY') return 'Energy';
  if (category === 'FOOD') return 'Food';
  if (category === 'SHOPPING') return 'Shopping';
  if (category === 'WASTE' || category === 'RECYCLING') return 'Waste';
  if (category === 'PRODUCT') return 'Product';

  return formatDisplayLabel(category);
}

function formatDate(value: Date) {
  const iso = value.toISOString();
  const [year, month, day] = iso.slice(0, 10).split('-');

  if (!year || !month || !day) return iso.slice(0, 10);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${day} ${monthNames[Number(month) - 1] ?? month} ${year}`;
}

function formatDateTime(value: Date) {
  const iso = value.toISOString();
  const date = formatDate(value);
  const time = iso.slice(11, 16);

  return `${date} · ${time}`;
}

function formatProvider(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCategoryVisuals(category: string) {
  switch (category) {
    case 'FOOD':
      return {
        icon: Utensils,
        iconClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        glowClass: 'bg-emerald-500/10',
      };

    case 'TRANSPORT':
      return {
        icon: Car,
        iconClass: 'bg-blue-50 text-blue-700 ring-blue-100',
        glowClass: 'bg-blue-500/10',
      };

    case 'SHOPPING':
    case 'PRODUCT':
      return {
        icon: ShoppingBag,
        iconClass: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        glowClass: 'bg-indigo-500/10',
      };

    case 'ENERGY':
    case 'ELECTRICITY':
      return {
        icon: Zap,
        iconClass: 'bg-amber-50 text-amber-700 ring-amber-100',
        glowClass: 'bg-amber-500/10',
      };

    case 'WASTE':
    case 'RECYCLING':
      return {
        icon: Trash2,
        iconClass: 'bg-rose-50 text-rose-700 ring-rose-100',
        glowClass: 'bg-rose-500/10',
      };

    default:
      return {
        icon: Package,
        iconClass: 'bg-slate-50 text-slate-700 ring-slate-100',
        glowClass: 'bg-slate-500/10',
      };
  }
}

function getExplanation(activity: {
  sourceResponse: unknown;
  calculationMethod: string | null;
}) {
  if (
    activity.sourceResponse &&
    typeof activity.sourceResponse === 'object' &&
    !Array.isArray(activity.sourceResponse)
  ) {
    const sourceResponse = activity.sourceResponse as Record<string, unknown>;
    const explanation = sourceResponse.explanation;

    if (typeof explanation === 'string' && explanation.trim().length > 0) {
      return explanation;
    }
  }

  return activity.calculationMethod ?? 'Stored carbon estimate.';
}

function DetailItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">{label}</p>

      <p className="mt-2 text-base font-black text-text-primary">{value}</p>

      {description && <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>}
    </div>
  );
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const { id } = await params;

  const activity = await prisma.activityLog.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!activity) {
    notFound();
  }

  const visuals = getCategoryVisuals(String(activity.category));
  const CategoryIcon = visuals.icon;
  const activityTitle = formatDisplayLabel(activity.activityType || activity.subType);
  const categoryLabel = formatCategory(String(activity.category));
  const explanation = getExplanation(activity);

  return (
    <div className="flex w-full flex-col gap-6 pb-6">
      <header className="flex flex-col gap-4">
        <Link
          href="/log"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to activity logs
        </Link>

        <section className="relative overflow-hidden rounded-[32px] border border-border-default bg-bg-surface p-6 shadow-sm">
          <div
            className={cn(
              'absolute right-0 top-0 h-40 w-40 rounded-full blur-3xl',
              visuals.glowClass,
            )}
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1',
                    visuals.iconClass,
                  )}
                >
                  <CategoryIcon className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                    Activity Detail
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
                    {activityTitle}
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
                Review the inputs, carbon estimate, data source, confidence, and available actions
                for this saved activity.
              </p>
            </div>

            <div className="rounded-3xl border border-border-subtle bg-bg-elevated/60 p-5 text-left lg:text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Estimated Impact
              </p>

              <p className="mt-2 text-4xl font-black tracking-tight text-text-primary">
                {activity.co2eKg.toFixed(2)}
              </p>

              <p className="text-sm font-bold text-text-secondary">kg CO₂e</p>
            </div>
          </div>
        </section>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardHeader className="border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Gauge className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle>Activity summary</CardTitle>
                  <CardDescription>What was logged and when it happened.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <DetailItem label="Category" value={categoryLabel} />

              <DetailItem label="Activity Type" value={formatDisplayLabel(activity.subType)} />

              <DetailItem
                label="Date"
                value={formatDate(activity.occurredAt)}
                description="The date this activity was recorded for."
              />

              <DetailItem
                label="Logged Input"
                value={`${activity.quantity.toFixed(2)} ${activity.unit}`}
                description="The main quantity used for the carbon estimate."
              />

              {activity.note && (
                <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4 sm:col-span-2">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Note
                  </p>

                  <p className="mt-2 text-sm leading-6 text-text-primary">{activity.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardHeader className="border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <Database className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle>Estimate details</CardTitle>
                  <CardDescription>
                    Source, confidence, fallback, and calculation information.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <DetailItem label="Provider" value={formatProvider(String(activity.provider))} />

              <DetailItem
                label="Confidence"
                value={formatDisplayLabel(String(activity.confidence))}
              />

              <DetailItem label="Fallback Used" value={activity.fallbackUsed ? 'Yes' : 'No'} />

              <DetailItem
                label="Factor Used"
                value={activity.factorUsed ? `${activity.factorUsed.toFixed(4)}` : 'Not stored'}
              />

              {activity.sourceDataset && (
                <DetailItem label="Dataset" value={activity.sourceDataset} />
              )}

              {activity.sourceRegion && <DetailItem label="Region" value={activity.sourceRegion} />}

              {activity.sourceYear && <DetailItem label="Source Year" value={`${activity.sourceYear}`} />}

              <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                  Explanation
                </p>

                <p className="mt-2 text-sm leading-6 text-text-primary">{explanation}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Use this activity to learn, compare, or log again.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <Link
                className={cn(buttonVariants(), 'w-full justify-center')}
                href={`/coach?prompt=${encodeURIComponent(
                  `Explain my ${activity.subType} activity and suggest a better lower-carbon alternative.`,
                )}`}
              >
                <Bot className="mr-2 h-4 w-4" />
                Ask Coach
              </Link>

              <Link
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}
                href="/simulator"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Open Simulator
              </Link>

              <Link
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}
                href={`/log?category=${String(activity.category).toLowerCase()}`}
              >
                <Leaf className="mr-2 h-4 w-4" />
                Log Again
              </Link>

              <form action={deleteActivity.bind(null, activity.id)}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-center border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Activity
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle>Estimate note</CardTitle>
                  <CardDescription>How to interpret this value.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-6 text-text-secondary">
                This is an estimated footprint, not a perfect measurement. Accuracy depends on the
                activity type, available emission factor, provider response, and user-entered
                quantity.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle>Log metadata</CardTitle>
                  <CardDescription>Stored record information.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-bold text-text-primary">Created</p>
                <p className="text-text-secondary">{formatDateTime(activity.createdAt)}</p>
              </div>

              <div>
                <p className="font-bold text-text-primary">Last updated</p>
                <p className="text-text-secondary">{formatDateTime(activity.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}