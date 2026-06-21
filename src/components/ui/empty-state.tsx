import type { ReactNode } from 'react';

import { cn } from '@/src/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-base px-6 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface text-text-muted ring-1 ring-border-default [&_svg]:h-6 [&_svg]:w-6">
          {icon}
        </span>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

