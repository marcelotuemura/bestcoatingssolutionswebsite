import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

const styles: Record<HeadingLevel, string> = {
  h1: 'font-display text-4xl font-medium tracking-tight text-balance text-text-primary sm:text-5xl lg:text-6xl',
  h2: 'font-display text-3xl font-medium tracking-tight text-balance text-text-primary sm:text-4xl',
  h3: 'font-sans text-xl font-semibold tracking-tight text-text-primary sm:text-2xl',
  h4: 'font-sans text-lg font-medium text-text-primary',
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
