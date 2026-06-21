import type { ReactNode } from 'react';

import { Card, CardContent } from './card';
import { IconBadge } from './icon-badge';

export function MetricCard({
  label,
  value,
  description,
  icon,
  trend,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  trend?: string;
  tone?: 'green' | 'blue' | 'purple' | 'amber' | 'red' | 'neutral';
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{value}</p>
          {(description || trend) && (
            <p className="mt-1 text-xs text-text-secondary">{trend ?? description}</p>
          )}
        </div>
        {icon && <IconBadge tone={tone}>{icon}</IconBadge>}
      </CardContent>
    </Card>
  );
}

