import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

const styles: Record<HeadingLevel, string> = {
  h1: 'text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl',
  h2: 'text-2xl font-semibold tracking-tight text-balance text-white sm:text-3xl',
  h3: 'text-xl font-semibold tracking-tight text-silver-100 sm:text-2xl',
  h4: 'text-lg font-medium text-silver-100',
};

export interface HeadingProps {
  readonly as?: HeadingLevel;
  readonly id?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Heading({
  as: Component = 'h2',
  id,
  children,
  className,
}: HeadingProps) {
  return (
    <Component id={id} className={cn(styles[Component], className)}>
      {children}
    </Component>
  );
}
