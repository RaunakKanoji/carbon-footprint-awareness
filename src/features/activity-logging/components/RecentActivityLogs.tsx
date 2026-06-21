'use client';

import {
    ArrowRight,
    CalendarDays,
    Car,
    Leaf,
    Package,
    Plane,
    Recycle,
    ShoppingBag,
    Trash2,
    Utensils,
    Zap,
    type LucideIcon,
} from 'lucide-react';

import Link from 'next/link';

type ActivityCategoryLike =
    | 'FOOD'
    | 'TRANSPORT'
    | 'TRAVEL'
    | 'ENERGY'
    | 'ELECTRICITY'
    | 'SHOPPING'
    | 'PRODUCT'
    | 'WASTE'
    | 'RECYCLING'
    | 'FLIGHT'
    | 'OTHER'
    | string;

export type RecentActivityLogItem = {
    id: string;
    category: ActivityCategoryLike;
    subType: string;
    quantity: number;
    unit?: string | null;
    co2eKg: number;
    provider?: string | null;
    sourceLabel?: string | null;
    confidence?: string | null;
    occurredAt: string | Date;
    createdAt?: string | Date | null;
    note?: string | null;
};

type CategoryVisual = {
    label: string;
    icon: LucideIcon;
    iconClassName: string;
    badgeClassName: string;
};

const categoryVisuals: Record<string, CategoryVisual> = {
    FOOD: {
        label: 'Food',
        icon: Utensils,
        iconClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    TRANSPORT: {
        label: 'Travel',
        icon: Car,
        iconClassName: 'bg-blue-50 text-blue-700 ring-blue-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    TRAVEL: {
        label: 'Travel',
        icon: Car,
        iconClassName: 'bg-blue-50 text-blue-700 ring-blue-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    ENERGY: {
        label: 'Energy',
        icon: Zap,
        iconClassName: 'bg-amber-50 text-amber-700 ring-amber-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    ELECTRICITY: {
        label: 'Energy',
        icon: Zap,
        iconClassName: 'bg-amber-50 text-amber-700 ring-amber-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    SHOPPING: {
        label: 'Shopping',
        icon: ShoppingBag,
        iconClassName: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    PRODUCT: {
        label: 'Shopping',
        icon: Package,
        iconClassName: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    WASTE: {
        label: 'Waste',
        icon: Trash2,
        iconClassName: 'bg-red-50 text-red-700 ring-red-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    RECYCLING: {
        label: 'Waste',
        icon: Recycle,
        iconClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    FLIGHT: {
        label: 'Travel',
        icon: Plane,
        iconClassName: 'bg-blue-50 text-blue-700 ring-blue-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
    OTHER: {
        label: 'Activity',
        icon: Leaf,
        iconClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        badgeClassName: 'bg-slate-50 text-slate-700 ring-slate-200',
    },
};

function normalizeCategory(category: ActivityCategoryLike) {
    return String(category || 'OTHER').trim().toUpperCase();
}

function getCategoryVisual(category: ActivityCategoryLike) {
    return categoryVisuals[normalizeCategory(category)] ?? categoryVisuals.OTHER;
}

function titleCase(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\w\S*/g, (word) => {
            const lower = word.toLowerCase();

            if (lower === 'co2e') return 'CO₂e';
            if (lower === 'kg') return 'kg';
            if (lower === 'kwh') return 'kWh';

            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
}

function formatProvider(provider?: string | null, sourceLabel?: string | null) {
    const source = sourceLabel?.trim();

    if (source) {
        return source;
    }

    const normalized = String(provider ?? '').trim().toUpperCase();

    if (normalized === 'OPEN_FOOD_FACTS') return 'Open Food Facts';
    if (normalized === 'CARBONSUTRA') return 'CarbonSutra';
    if (normalized === 'CARBON_INTERFACE') return 'Carbon Interface';
    if (normalized === 'CLIMATIQ') return 'Climatiq';
    if (normalized === 'AGRIBALYSE') return 'Agribalyse';
    if (normalized === 'INTERNAL') return 'Internal';
    if (normalized === 'MANUAL') return 'Carbon Engine';

    return normalized ? titleCase(normalized) : 'Carbon Engine';
}

function shouldShowCarbonCompassPill(provider?: string | null, sourceLabel?: string | null) {
    const providerLabel = formatProvider(provider, sourceLabel).toLowerCase();

    return !providerLabel.includes('open food facts');
}

function formatConfidence(confidence?: string | null) {
    const normalized = String(confidence ?? 'MEDIUM').trim();

    if (!normalized) return 'Medium';

    return titleCase(normalized);
}

function formatDate(value: string | Date) {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Unknown date';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatQuantity(quantity: number, unit?: string | null) {
    const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
    const normalizedUnit = String(unit ?? '').trim();

    const formattedQuantity =
        Number.isInteger(safeQuantity) && Math.abs(safeQuantity) >= 10
            ? safeQuantity.toFixed(0)
            : safeQuantity.toFixed(2);

    if (!normalizedUnit) {
        return formattedQuantity;
    }

    return `${formattedQuantity} ${normalizedUnit}`;
}

function getSortTime(activity: RecentActivityLogItem) {
    const createdAt = activity.createdAt ? new Date(activity.createdAt).getTime() : 0;
    const occurredAt = new Date(activity.occurredAt).getTime();

    if (Number.isFinite(createdAt) && createdAt > 0) return createdAt;
    if (Number.isFinite(occurredAt) && occurredAt > 0) return occurredAt;

    return 0;
}

export default function RecentActivityLogs({
    activities,
}: {
    activities: RecentActivityLogItem[];
}) {
    const latestActivities = [...activities]
        .sort((a, b) => getSortTime(b) - getSortTime(a))
        .slice(0, 10);

    return (
        <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border-subtle px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">
                        Recent Logs
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-text-primary">
                        Your Activity
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Your latest saved activities appear here so you can confirm what was logged.
                    </p>
                </div>

                <Link
                    href="/activity"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-border-default bg-bg-surface px-4 text-sm font-black text-text-primary shadow-sm transition-colors hover:bg-bg-elevated"
                >
                    View all
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {latestActivities.length === 0 ? (
                <div className="px-6 py-10 text-sm leading-6 text-text-secondary">
                    No activity logs yet. Save your first activity and it will appear here.
                </div>
            ) : (
                <div className="divide-y divide-border-subtle">
                    {latestActivities.map((activity) => {
                        const visual = getCategoryVisual(activity.category);
                        const Icon = visual.icon;
                        const providerLabel = formatProvider(activity.provider, activity.sourceLabel);
                        const showCarbonCompass = shouldShowCarbonCompassPill(
                            activity.provider,
                            activity.sourceLabel,
                        );

                        return (
                            <Link
                                key={activity.id}
                                href={`/activity/${activity.id}`}
                                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-6 py-5 transition-colors hover:bg-bg-elevated/60"
                            >
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${visual.iconClassName}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="truncate text-base font-black tracking-tight text-text-primary">
                                            {titleCase(activity.subType)}
                                        </h3>

                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${visual.badgeClassName}`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            {visual.label}
                                        </span>

                                        {showCarbonCompass && (
                                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                                                Carbon Compass
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-text-secondary">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {formatDate(activity.occurredAt)}
                                        </span>

                                        <span>{formatQuantity(activity.quantity, activity.unit)}</span>

                                        <span>{providerLabel}</span>

                                        <span>Confidence: {formatConfidence(activity.confidence)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xl font-black tabular-nums tracking-tight text-text-primary">
                                            {activity.co2eKg.toFixed(2)}
                                        </p>

                                        <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.24em] text-text-muted">
                                            kg CO₂e
                                        </p>
                                    </div>

                                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary transition-all group-hover:translate-x-0.5 group-hover:border-accent-primary/30 group-hover:text-accent-primary">
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}