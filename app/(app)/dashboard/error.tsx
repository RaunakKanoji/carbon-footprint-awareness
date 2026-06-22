'use client';

import { useEffect } from 'react';

import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[dashboard/error.tsx]', {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
        });
    }, [error]);

    return (
        <main className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="max-w-md rounded-3xl border border-border-default bg-bg-surface p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Dashboard Error
                </p>

                <h1 className="mt-2 text-2xl font-black tracking-tight text-text-primary">
                    We couldn’t load your dashboard.
                </h1>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                    The server failed while loading your dashboard data. Check the terminal logs for the
                    exact failing section.
                </p>

                {error.digest ? (
                    <p className="mt-4 rounded-2xl bg-bg-elevated p-3 text-xs font-semibold text-text-secondary">
                        Digest: {error.digest}
                    </p>
                ) : null}

                <button type="button" className={cn(buttonVariants(), 'mt-5')} onClick={reset}>
                    Try again
                </button>
            </div>
        </main>
    );
}