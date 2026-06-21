import React, { InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/src/lib/utils';

import ValidationError from './ValidationError';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  inputClassName?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, helperText, className, inputClassName, ...props }, ref) => {
    return (
      <div className={cn('space-y-2 w-full', className)}>
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          {label}
        </label>
        <input
          type="number"
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 text-sm bg-bg-base border rounded-xl text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-surface',
            error
              ? 'border-state-error focus-visible:border-state-error focus-visible:ring-state-error/25'
              : 'border-border-default focus-visible:border-accent-primary focus-visible:ring-accent-primary/25',
            inputClassName,
          )}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-text-muted mt-1">{helperText}</p>}
        <ValidationError message={error} />
      </div>
    );
  },
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
