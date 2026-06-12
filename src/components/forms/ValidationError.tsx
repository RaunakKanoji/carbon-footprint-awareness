import React from 'react';

import { cn } from '@/lib/utils';

interface ValidationErrorProps {
  message?: string;
  className?: string;
}

export default function ValidationError({ message, className }: ValidationErrorProps) {
  if (!message) return null;
  return (
    <p className={cn('text-xs text-state-error font-medium animate-fade-in mt-1', className)}>
      {message}
    </p>
  );
}
