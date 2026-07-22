import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly tone?: 'neutral' | 'accent' | 'warning';
}

const tones = {
  neutral: 'border-navy-700 bg-navy-900 text-silver-300',
  accent: 'border-electric-500/40 bg-electric-500/10 text-electric-400',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
} as const;

export function Badge({ children, className, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
