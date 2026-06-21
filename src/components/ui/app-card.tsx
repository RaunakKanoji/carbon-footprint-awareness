import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { cn } from '@/src/lib/utils';

export function AppCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={className}>
      {(title || description || icon || action) && (
        <CardHeader className="border-b border-border-subtle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              {icon}
              <div className="min-w-0">
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription className="mt-1">{description}</CardDescription>}
              </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}

