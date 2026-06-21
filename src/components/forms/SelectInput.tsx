import React, { SelectHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/src/lib/utils';

import ValidationError from './ValidationError';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  selectClassName?: string;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, options, error, helperText, className, selectClassName, ...props }, ref) => {
    return (
      <div className={cn('space-y-2 w-full', className)}>
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          {label}
        </label>
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 text-sm bg-bg-base border rounded-xl text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-surface',
            error
              ? 'border-state-error focus-visible:border-state-error focus-visible:ring-state-error/25'
              : 'border-border-default focus-visible:border-accent-primary focus-visible:ring-accent-primary/25',
            selectClassName,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helperText && !error && <p className="text-xs text-text-muted mt-1">{helperText}</p>}
        <ValidationError message={error} />
      </div>
    );
  },
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
