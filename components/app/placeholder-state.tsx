import { Sparkles } from 'lucide-react';

import Link from 'next/link';

interface PlaceholderStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function PlaceholderState({
  title,
  description,
  actionLabel,
  actionHref,
}: PlaceholderStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-16 border border-dashed border-border-default rounded-xl bg-bg-surface space-y-6 w-full">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-primary-dim text-accent-primary">
        <Sparkles className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="space-y-2 w-full max-w-md">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center rounded-xl bg-text-primary px-4 py-2 text-sm font-semibold text-bg-surface transition-colors hover:bg-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
