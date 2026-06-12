import React, { SelectHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';

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
            'w-full px-4 py-2.5 text-sm bg-bg-base border rounded-xl text-text-primary focus:outline-none focus:ring-1 transition-all cursor-pointer',
            error
              ? 'border-state-error focus:ring-state-error'
              : 'border-border-default focus:ring-accent-primary focus:border-accent-primary',
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
