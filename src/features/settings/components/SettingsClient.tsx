'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Database,
  History,
  Info,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from 'lucide-react';

import { type FormEvent, useEffect, useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';

interface BudgetRecord {
  id: string;
  month: string;
  targetKg: number;
}

interface SettingsClientProps {
  initialBudgets: BudgetRecord[];
}

const fieldClassName =
  'h-10 w-full rounded-xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary transition-colors placeholder:text-text-muted focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50';

const dataSources = [
  {
    name: 'CarbonSutra',
    description: 'Primary provider for transport and electricity estimates.',
    status: 'Primary',
    tone: 'emerald',
  },
  {
    name: 'Climatiq',
    description: 'Secondary global fallback for mapped emission factors.',
    status: 'Fallback',
    tone: 'indigo',
  },
  {
    name: 'Open Food Facts',
    description: 'Barcode and packaged-food product metadata.',
    status: 'Active',
    tone: 'emerald',
  },
  {
    name: 'Agribalyse',
    description: 'Local food life-cycle assessment factors.',
    status: 'Local data',
    tone: 'blue',
  },
  {
    name: 'OpenRouteService',
    description: 'Route distance and transport calculations.',
    status: 'Active',
    tone: 'emerald',
  },
  {
    name: 'Carbon Interface',
    description: 'Integrated, but currently unavailable because account auth is blocked.',
    status: 'Unavailable',
    tone: 'amber',
  },
];

function getDefaultMonthString() {
  const now = new Date();

  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(isoString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoString));
}

function getBudgetStatus(isoString: string): 'Active' | 'Archived' | 'Upcoming' {
  const now = new Date();
  const currentMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const recordDate = new Date(isoString);
  const recordMonthUTC = new Date(
    Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), 1),
  );

  if (recordMonthUTC.getTime() === currentMonthUTC.getTime()) return 'Active';
  if (recordMonthUTC.getTime() < currentMonthUTC.getTime()) return 'Archived';

  return 'Upcoming';
}

function statusClassName(status: string) {
  if (status === 'Active' || status === 'Primary') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'Unavailable') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (status === 'Fallback') {
    return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  }

  return 'border-border-default bg-bg-elevated text-text-secondary';
}

function sourceToneClassName(tone: string) {
  if (tone === 'emerald') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (tone === 'indigo') return 'bg-indigo-50 text-indigo-700 ring-indigo-100';
  if (tone === 'blue') return 'bg-blue-50 text-blue-700 ring-blue-100';
  if (tone === 'amber') return 'bg-amber-50 text-amber-700 ring-amber-100';

  return 'bg-bg-elevated text-text-secondary ring-border-subtle';
}

function BudgetStatusBadge({ status }: { status: 'Active' | 'Archived' | 'Upcoming' }) {
  const className =
    status === 'Active'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'Upcoming'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-border-default bg-bg-elevated text-text-secondary';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${className}`}>
      {status}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-surface text-text-secondary ring-1 ring-border-subtle">
          {icon}
        </div>

        <div>
          <p className="text-sm font-black text-text-primary">{title}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsClient({ initialBudgets }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [month, setMonth] = useState(getDefaultMonthString);
  const [targetKg, setTargetKg] = useState('500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const activeBudget = useMemo(() => {
    if (!mounted) return null;

    return initialBudgets.find((budget) => getBudgetStatus(budget.month) === 'Active') ?? null;
  }, [initialBudgets, mounted]);

  const latestBudget = initialBudgets[0] ?? null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const parsedTarget = Number.parseFloat(targetKg);

    if (Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMsg('Monthly carbon target must be a positive number.');
      setIsSubmitting(false);
      return;
    }

    if (!month) {
      setErrorMsg('Please select a valid month.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: `${month}-01`,
          targetKg: parsedTarget,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save carbon target.');
      }

      const [year, monthNumber] = month.split('-').map(Number);
      const labelDate = new Date(Date.UTC(year, monthNumber - 1, 1));
      const monthLabel = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(labelDate);

      setSuccessMsg(`Saved ${parsedTarget.toFixed(0)} kg CO₂e target for ${monthLabel}.`);

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Active target
                  </p>

                  <p className="mt-3 text-2xl font-black tracking-tight text-text-primary">
                    {activeBudget ? activeBudget.targetKg.toFixed(0) : '—'}
                    <span className="ml-1 text-xs font-bold text-text-secondary">kg CO₂e</span>
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">
                    {activeBudget ? formatMonth(activeBudget.month) : 'No target set for this month'}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Target className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Records
                  </p>

                  <p className="mt-3 text-2xl font-black tracking-tight text-text-primary">
                    {initialBudgets.length}
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">
                    Monthly target history
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <History className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Latest update
                  </p>

                  <p className="mt-3 text-lg font-black tracking-tight text-text-primary">
                    {latestBudget ? formatMonth(latestBudget.month) : 'Not set'}
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">
                    Last configured target
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-border-subtle px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black tracking-tight text-text-primary">
                    Carbon target
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                    Set a monthly carbon limit used by your dashboard, insights, and progress
                    comparisons.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
              <label className="grid gap-2 text-sm font-bold text-text-primary">
                Month
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className={`${fieldClassName} cursor-pointer`}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-text-primary">
                Target limit
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="500"
                    value={targetKg}
                    onChange={(event) => setTargetKg(event.target.value)}
                    className={`${fieldClassName} pr-20`}
                    required
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted">
                    kg CO₂e
                  </span>
                </div>
              </label>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="h-10 w-full rounded-xl px-4 text-sm font-black md:w-fit"
                >
                  {isSubmitting || isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save target
                </Button>
              </div>

              {(successMsg || errorMsg) && (
                <div className="md:col-span-3">
                  {successMsg && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="leading-6">{successMsg}</p>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      <p className="leading-6">{errorMsg}</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-border-subtle px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <Database className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black tracking-tight text-text-primary">
                    Data sources and accuracy
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                    Carbon Compass uses primary providers first, then mapped fallback data, then the
                    local carbon engine when exact data is unavailable.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2">
              {dataSources.map((source) => (
                <div
                  key={source.name}
                  className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${sourceToneClassName(
                        source.tone,
                      )}`}
                    >
                      <Database className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-black text-text-primary">{source.name}</p>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-black ${statusClassName(
                            source.status,
                          )}`}
                        >
                          {source.status}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-text-secondary">
                        {source.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
        <Card className="overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-border-subtle px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <History className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black tracking-tight text-text-primary">
                    Target history
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Your configured monthly limits.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {initialBudgets.length > 0 ? (
                <div className="space-y-3">
                  {initialBudgets.slice(0, 8).map((budget) => {
                    const status = mounted ? getBudgetStatus(budget.month) : 'Archived';

                    return (
                      <div
                        key={budget.id}
                        className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-text-primary">
                              {formatMonth(budget.month)}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-text-secondary">
                              {budget.targetKg.toFixed(0)} kg CO₂e
                            </p>
                          </div>

                          <BudgetStatusBadge status={status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-elevated/35 px-6 py-10 text-center">
                  <Calendar className="h-8 w-8 text-text-muted" />

                  <p className="mt-3 text-sm font-black text-text-primary">No targets yet</p>

                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    Set your first monthly carbon target to start comparing progress.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="space-y-3 p-5">
            <p className="text-sm font-black text-text-primary">App preferences</p>

            <InfoCard
              icon={<SlidersHorizontal className="h-4 w-4" />}
              title="Units"
              description="Carbon values are displayed in kg CO₂e across the app."
            />

            <InfoCard
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Accuracy mode"
              description="Provider data is prioritized before mapped category estimates."
            />

            <InfoCard
              icon={<KeyRound className="h-4 w-4" />}
              title="API status"
              description="Dev API playgrounds remain separate from user-facing settings."
            />

            <div className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />

                <p className="text-xs leading-5 text-text-secondary">
                  Settings should stay lightweight. Larger behavior-change flows belong in
                  Challenges and Simulator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
