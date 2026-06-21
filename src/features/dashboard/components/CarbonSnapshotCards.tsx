'use client';

import {
    ArrowDownRight,
    ArrowUpRight,
    BadgeCheck,
    Cloud,
    Leaf,
    WalletCards,
} from 'lucide-react';

import type { ComponentType } from 'react';

import { cn } from '@/src/lib/utils';
import type { DashboardData } from '@/src/server/dashboard/dashboard.service';

function formatKg(value: number | undefined | null) {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0.0';

    return value.toFixed(1);
}

function calculateBudgetUsedPercent(monthlyBudgetKg: number, remainingBudgetKg: number) {
    if (!monthlyBudgetKg || monthlyBudgetKg <= 0) return 0;

    const used = Math.max(0, monthlyBudgetKg - remainingBudgetKg);

    return Math.min(100, Math.round((used / monthlyBudgetKg) * 100));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(payload: unknown, paths: string[]) {
    for (const path of paths) {
        const value = path.split('.').reduce<unknown>((current, key) => {
            if (!isRecord(current)) return undefined;
            return current[key];
        }, payload);

        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string') {
            const parsed = Number.parseFloat(value);

            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return null;
}

function getTodayFootprintKg(data: DashboardData) {
    const todayTrendItem = data.trend.find((item) => item.isToday);

    if (
        todayTrendItem &&
        typeof todayTrendItem.co2eKg === 'number' &&
        Number.isFinite(todayTrendItem.co2eKg)
    ) {
        return todayTrendItem.co2eKg;
    }

    if (typeof data.summary.todayKg === 'number' && Number.isFinite(data.summary.todayKg)) {
        return data.summary.todayKg;
    }

    return 0;
}

function getPreventedEmissionsKg(data: DashboardData) {
    const value = readNumber(data, [
        'summary.weekPreventedKg',
        'summary.weekAvoidedKg',
        'summary.weekSavedKg',
        'summary.preventedKg',
        'summary.preventedCo2eKg',
        'summary.preventedCO2eKg',
        'summary.avoidedKg',
        'summary.avoidedCo2eKg',
        'summary.avoidedCO2eKg',
        'summary.savedKg',
        'summary.savedCo2eKg',
        'summary.co2eSavedKg',
        'impact.weekPreventedKg',
        'impact.weekAvoidedKg',
        'impact.preventedKg',
        'impact.avoidedKg',
        'impact.savedKg',
        'metrics.weekPreventedKg',
        'metrics.weekAvoidedKg',
        'metrics.preventedKg',
        'metrics.avoidedKg',
        'metrics.savedKg',
    ]);

    return value === null ? 0 : Math.max(0, value);
}

function getPreventedDescription(preventedKg: number) {
    if (preventedKg <= 0) {
        return 'No prevented emissions logged yet. Complete missions, recycle, reuse, repair, or choose lower-carbon alternatives to build this number.';
    }

    return 'Estimated emissions prevented through lower-carbon actions, reuse, recycling, repairs, missions, and better choices.';
}

function calculateCarbonScore(data: DashboardData) {
    const budgetUsedPercent = calculateBudgetUsedPercent(
        data.summary.monthlyBudgetKg,
        data.summary.remainingBudgetKg,
    );

    const todayKg = getTodayFootprintKg(data);
    const preventedKg = getPreventedEmissionsKg(data);

    const hasActivity = todayKg > 0 || data.summary.weekKg > 0 || data.summary.monthKg > 0;

    if (!hasActivity && preventedKg <= 0) return 72;

    const preventionBonus = Math.min(12, Math.round(preventedKg / 5));

    let baseScore = 42;

    if (budgetUsedPercent <= 30) baseScore = 88;
    else if (budgetUsedPercent <= 50) baseScore = 78;
    else if (budgetUsedPercent <= 75) baseScore = 66;
    else if (budgetUsedPercent <= 90) baseScore = 54;

    return Math.min(100, baseScore + preventionBonus);
}

function getTrendStatus(data: DashboardData): 'up' | 'down' | 'neutral' {
    const nonZeroTrend = data.trend.filter((item) => item.co2eKg > 0);

    if (nonZeroTrend.length < 2) return 'neutral';

    const current = nonZeroTrend[nonZeroTrend.length - 1]?.co2eKg ?? 0;
    const previous = nonZeroTrend[nonZeroTrend.length - 2]?.co2eKg ?? 0;

    if (current > previous) return 'up';
    if (current < previous) return 'down';

    return 'neutral';
}

function getTrendLabel(status: 'up' | 'down' | 'neutral') {
    if (status === 'up') return 'Higher than your last logged day';
    if (status === 'down') return 'Lower than your last logged day';

    return 'Building your baseline';
}

function SnapshotCard({
    title,
    value,
    unit,
    description,
    icon: Icon,
    tone,
    badge,
    progress,
}: {
    title: string;
    value: string | number;
    unit: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    tone: 'emerald' | 'indigo' | 'amber' | 'slate';
    badge: string;
    progress?: number;
}) {
    const toneClasses = {
        emerald: {
            glow: 'bg-emerald-500/10',
            icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
            progress: 'bg-emerald-600',
            badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        },
        indigo: {
            glow: 'bg-indigo-500/10',
            icon: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
            progress: 'bg-indigo-600',
            badge: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        },
        amber: {
            glow: 'bg-amber-500/10',
            icon: 'bg-amber-50 text-amber-700 ring-amber-100',
            progress: 'bg-amber-500',
            badge: 'bg-amber-50 text-amber-700 ring-amber-100',
        },
        slate: {
            glow: 'bg-slate-500/10',
            icon: 'bg-slate-50 text-slate-700 ring-slate-100',
            progress: 'bg-slate-700',
            badge: 'bg-slate-50 text-slate-700 ring-slate-100',
        },
    }[tone];

    return (
        <article className="group relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div
                className={cn(
                    'absolute right-0 top-0 h-28 w-28 rounded-full blur-2xl',
                    toneClasses.glow,
                )}
            />

            <div className="relative flex items-start justify-between gap-4">
                <div
                    className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl ring-1',
                        toneClasses.icon,
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>

                <span
                    className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-bold ring-1',
                        toneClasses.badge,
                    )}
                >
                    {badge}
                </span>
            </div>

            <div className="relative mt-6">
                <p className="text-sm font-bold text-text-secondary">{title}</p>

                <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-text-primary">{value}</span>
                    <span className="pb-1.5 text-sm font-semibold text-text-secondary">{unit}</span>
                </div>

                {typeof progress === 'number' && (
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-bg-elevated">
                        <div
                            className={cn('h-full rounded-full transition-all duration-500', toneClasses.progress)}
                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                        />
                    </div>
                )}

                <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
            </div>
        </article>
    );
}

export default function CarbonSnapshotCards({ data }: { data: DashboardData }) {
    const todayFootprintKg = getTodayFootprintKg(data);
    const preventedKg = getPreventedEmissionsKg(data);
    const score = calculateCarbonScore(data);

    const budgetUsedPercent = calculateBudgetUsedPercent(
        data.summary.monthlyBudgetKg,
        data.summary.remainingBudgetKg,
    );

    const trendStatus = getTrendStatus(data);
    const trendLabel = getTrendLabel(trendStatus);

    const TrendIcon =
        trendStatus === 'up' ? ArrowUpRight : trendStatus === 'down' ? ArrowDownRight : Leaf;

    const trendClasses =
        trendStatus === 'up'
            ? 'bg-amber-50 text-amber-700 ring-amber-100'
            : trendStatus === 'down'
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                : 'bg-slate-50 text-slate-700 ring-slate-100';

    return (
        <section className="space-y-4" aria-labelledby="carbon-snapshot-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                        Carbon Snapshot
                    </p>

                    <h2
                        id="carbon-snapshot-heading"
                        className="mt-1 text-2xl font-black tracking-tight text-text-primary"
                    >
                        Your climate status today
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                        A simple summary of your footprint, prevented emissions, budget, and carbon score.
                    </p>
                </div>

                <div
                    className={cn(
                        'inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ring-1',
                        trendClasses,
                    )}
                >
                    <TrendIcon className="h-4 w-4" />
                    {trendLabel}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SnapshotCard
                    title="Carbon Footprint"
                    value={formatKg(todayFootprintKg)}
                    unit="kg CO₂e"
                    description="Logged emissions from your activities today."
                    icon={Cloud}
                    tone="emerald"
                    badge="Today"
                />

                <SnapshotCard
                    title="Carbon Prevented"
                    value={formatKg(preventedKg)}
                    unit="kg CO₂e"
                    description={getPreventedDescription(preventedKg)}
                    icon={Leaf}
                    tone="indigo"
                    badge="Weekly"
                />

                <SnapshotCard
                    title="Carbon Budget"
                    value={formatKg(data.summary.remainingBudgetKg)}
                    unit="kg left"
                    description={`${budgetUsedPercent}% of your ${data.summary.monthlyBudgetKg.toFixed(
                        0,
                    )} kg monthly budget used.`}
                    icon={WalletCards}
                    tone="amber"
                    badge="Monthly"
                    progress={budgetUsedPercent}
                />

                <SnapshotCard
                    title="Carbon Score"
                    value={score}
                    unit="/ 100"
                    description="Based on your activity trend, monthly budget usage, and prevented emissions."
                    icon={BadgeCheck}
                    tone="emerald"
                    badge="Score"
                    progress={score}
                />
            </div>
        </section>
    );
}