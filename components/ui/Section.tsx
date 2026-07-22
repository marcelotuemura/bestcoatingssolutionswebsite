import type { ElementType, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SectionProps {
  readonly as?: ElementType;
  readonly id?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly 'aria-labelledby'?: string;
}

export function Section({
  as: Component = 'section',
  id,
  children,
  className,
  'aria-labelledby': ariaLabelledBy,
}: SectionProps) {
  return (
    <Component
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn('py-12 sm:py-16 lg:py-20', className)}
    >
      {children}
    </Component>
  );
}
