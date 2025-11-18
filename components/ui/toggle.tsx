'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function Toggle({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
}: ToggleProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-gray-900 cursor-pointer">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-gray-900' : 'bg-gray-200',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

