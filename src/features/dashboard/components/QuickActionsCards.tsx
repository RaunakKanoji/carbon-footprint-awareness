'use client';

import { ArrowRight, Bot, CheckCircle2, PlusCircle, ScanBarcode } from 'lucide-react';

import type { ComponentType } from 'react';

import Link from 'next/link';

import { cn } from '@/src/lib/utils';

type QuickActionItem = {
    title: string;
    description: string;
    href: string;
    cta: string;
    icon: ComponentType<{ className?: string }>;
    tone: 'emerald' | 'amber' | 'indigo';
};

export default function QuickActionsCards() {
    const actions: QuickActionItem[] = [
        {
            title: 'Log Activity',
            description: 'Add transport, food, energy, shopping, or waste activity.',
            href: '/log',
            cta: 'Start logging',
            icon: PlusCircle,
            tone: 'emerald',
        },
        {
            title: 'Log Actions',
            description: 'Complete climate-positive actions, tasks, and missions.',
            href: '/challenges',
            cta: 'View actions',
            icon: CheckCircle2,
            tone: 'amber',
        },
        {
            title: 'Scan Product',
            description: 'Check the estimated carbon impact of products before or after purchase.',
            href: '/products',
            cta: 'Scan product',
            icon: ScanBarcode,
            tone: 'indigo',
        },
        {
            title: 'Ask Carbon Coach',
            description: 'Ask your AI coach what changed and what to do next.',
            href: '/coach',
            cta: 'Ask coach',
            icon: Bot,
            tone: 'emerald',
        },
    ];

    const toneClasses: Record<
        QuickActionItem['tone'],
        {
            icon: string;
            glow: string;
            cta: string;
        }
    > = {
        emerald: {
            icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
            glow: 'bg-emerald-500/10',
            cta: 'text-emerald-700',
        },
        amber: {
            icon: 'bg-amber-50 text-amber-700 ring-amber-100',
            glow: 'bg-amber-500/10',
            cta: 'text-amber-700',
        },
        indigo: {
            icon: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
            glow: 'bg-indigo-500/10',
            cta: 'text-indigo-700',
        },
    };

    return (
        <section className="space-y-4" aria-labelledby="quick-actions-heading">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Quick Actions
                </p>

                <h2
                    id="quick-actions-heading"
                    className="text-2xl font-black tracking-tight text-text-primary"
                >
                    What would you like to do next?
                </h2>

                <p className="max-w-2xl text-sm leading-6 text-text-secondary">
                    The fastest ways to add data, understand your choices, and improve your footprint.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    const colors = toneClasses[action.tone];

                    return (
                        <article
                            key={action.title}
                            className="group relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div
                                className={cn(
                                    'absolute right-0 top-0 h-28 w-28 rounded-full blur-2xl',
                                    colors.glow,
                                )}
                            />

                            <div className="relative flex min-h-[210px] flex-col">
                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className={cn(
                                            'flex h-12 w-12 items-center justify-center rounded-2xl ring-1',
                                            colors.icon,
                                        )}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="mt-5 flex-1">
                                    <h3 className="text-lg font-black tracking-tight text-text-primary">
                                        {action.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                                        {action.description}
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <Link
                                        href={action.href}
                                        className={cn(
                                            'inline-flex items-center gap-2 text-sm font-black transition-colors hover:text-accent-primary',
                                            colors.cta,
                                        )}
                                    >
                                        {action.cta}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}