import type { ReactNode } from 'react';

import { cn } from '@/src/lib/utils';

const toneClasses = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  purple: 'border-violet-200 bg-violet-50 text-violet-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-border-default bg-bg-elevated text-text-secondary',
};

export function StatusPill({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: keyof typeof toneClasses;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

