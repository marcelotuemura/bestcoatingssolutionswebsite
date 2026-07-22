import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  readonly children: ReactNode;
  readonly optional?: boolean;
  readonly optionalText?: string;
}

export function Label({
  children,
  className,
  optional = false,
  optionalText = 'optional',
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        'text-silver-300 mb-1.5 block text-sm font-medium',
        className,
      )}
      {...props}
    >
      {children}
      {optional ? (
        <span className="text-silver-500 font-normal"> ({optionalText})</span>
      ) : null}
    </label>
  );
}
