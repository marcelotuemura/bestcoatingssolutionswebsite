import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  readonly label: ReactNode;
  readonly className?: string;
}

export function Checkbox({ id, label, className, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'text-silver-300 flex cursor-pointer items-start gap-3 text-sm',
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className="border-navy-700 text-electric-500 focus-visible:ring-electric-500 bg-navy-900 focus-visible:ring-offset-navy-950 mt-0.5 size-5 shrink-0 rounded border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
