import type { ElementType, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface ContainerProps {
  readonly as?: ElementType;
  readonly children: ReactNode;
  readonly className?: string;
  readonly narrow?: boolean;
}

export function Container({
  as: Component = 'div',
  children,
  className,
  narrow = false,
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        narrow ? 'max-w-3xl' : 'max-w-6xl',
        className,
      )}
    >
      {children}
    </Component>
  );
}
