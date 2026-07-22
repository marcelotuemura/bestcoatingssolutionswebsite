import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const fieldClassName =
  'min-h-11 w-full rounded-xl border border-navy-700 bg-navy-900 px-3 py-2 text-base text-silver-100 placeholder:text-silver-500 focus-visible:border-electric-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/40 sm:min-h-12';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly className?: string;
}

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input type={type} className={cn(fieldClassName, className)} {...props} />
  );
}

export { fieldClassName };
