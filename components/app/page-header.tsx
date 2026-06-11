import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-6 border-b border-border-default">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">{title}</h1>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-accent-primary-dim px-2.5 py-0.5 text-xs font-semibold text-accent-primary border border-accent-primary/20">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
    </div>
  );
}
