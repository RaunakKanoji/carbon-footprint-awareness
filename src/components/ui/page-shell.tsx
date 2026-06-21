import type { ReactNode } from 'react';

import { cn } from '@/src/lib/utils';

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex min-h-0 w-full flex-col gap-6 pb-6', className)}>{children}</div>;
}

