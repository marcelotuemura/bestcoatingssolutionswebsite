import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { fieldClassName } from '@/components/ui/Input';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly className?: string;
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(fieldClassName, className)} {...props}>
      {children}
    </select>
  );
}
