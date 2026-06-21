export const categoryTones = {
  food: {
    accent: '#10B981',
    soft: 'rgba(16, 185, 129, 0.10)',
  },
  transport: {
    accent: '#3B82F6',
    soft: 'rgba(59, 130, 246, 0.10)',
  },
  energy: {
    accent: '#F59E0B',
    soft: 'rgba(245, 158, 11, 0.12)',
  },
  shopping: {
    accent: '#8B5CF6',
    soft: 'rgba(139, 92, 246, 0.10)',
  },
  waste: {
    accent: '#EF4444',
    soft: 'rgba(239, 68, 68, 0.10)',
  },
} as const;

export const surfaceClasses = {
  page: 'space-y-6',
  card: 'rounded-3xl border border-border-default bg-bg-surface shadow-sm',
  innerCard: 'rounded-2xl border border-border-subtle bg-bg-base',
  input:
    'h-11 rounded-xl border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-faint focus-visible:border-accent-primary focus-visible:ring-2 focus-visible:ring-accent-primary/20',
} as const;

