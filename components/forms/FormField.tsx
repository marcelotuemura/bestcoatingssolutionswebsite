'use client';

import type { ReactNode } from 'react';
import { Label } from '@/components/ui/Label';
import { cn } from '@/utils/cn';

export function FormField({
  id,
  label,
  required,
  optionalLabel,
  error,
  hint,
  children,
  className,
}: {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly optionalLabel?: string;
  readonly error?: string;
  readonly hint?: string;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('space-y-2', className)} id={`field-${id}`}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-electric-400" aria-hidden="true">
            {' '}
            *
          </span>
        ) : optionalLabel ? (
          <span className="text-silver-500 font-normal">
            {' '}
            ({optionalLabel})
          </span>
        ) : null}
      </Label>
      {hint ? (
        <p id={`${id}-hint`} className="text-silver-500 text-sm">
          {hint}
        </p>
      ) : null}
      <div
        // Pass describedby via cloning is awkward; consumers set aria on controls.
        data-describedby={describedBy || undefined}
      >
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-amber-200" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
