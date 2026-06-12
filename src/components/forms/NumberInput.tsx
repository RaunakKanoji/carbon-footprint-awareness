import React, { InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';

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
            'w-full px-4 py-2.5 text-sm bg-bg-base border rounded-xl text-text-primary focus:outline-none focus:ring-1 transition-all',
            error
              ? 'border-state-error focus:ring-state-error'
              : 'border-border-default focus:ring-accent-primary focus:border-accent-primary',
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
