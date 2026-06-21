import type { ReactNode } from 'react';

import { cn } from '@/src/lib/utils';

const toneClasses = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  neutral: 'bg-bg-elevated text-text-secondary ring-border-subtle',
};

export function IconBadge({
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
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 [&_svg]:h-5 [&_svg]:w-5',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

