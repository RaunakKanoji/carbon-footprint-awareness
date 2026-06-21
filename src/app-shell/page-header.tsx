import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  badge?: string;
  badgeClassName?: string;
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  action,
  badge,
  badgeClassName,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border-default pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-primary">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          {badge && (
            <span
              className={
                badgeClassName ||
                'inline-flex items-center rounded-full bg-accent-primary-dim px-2.5 py-0.5 text-xs font-semibold text-accent-primary border border-accent-primary/20'
              }
            >
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm text-text-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
