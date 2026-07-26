import { cn, type ClassValue } from '@/utils/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  /* Resting + hover stay on pressed blue family so white text remains AA (≥4.5:1). */
  primary:
    'bg-accent-pressed text-white hover:bg-[#0057b0] active:bg-[#004890] focus-visible:ring-focus-ring',
  secondary:
    'border border-border bg-surface text-text-primary hover:border-accent/40 hover:bg-bg-secondary focus-visible:ring-focus-ring',
  ghost:
    'text-text-secondary hover:bg-surface hover:text-text-primary focus-visible:ring-focus-ring',
  link: 'text-accent-hover underline-offset-4 hover:text-accent hover:underline focus-visible:ring-focus-ring',
} as const;

const sizes = {
  sm: 'min-h-10 px-3.5 text-sm',
  md: 'min-h-11 px-5 text-sm sm:min-h-12 sm:px-6',
  lg: 'min-h-12 px-7 text-base',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
  readonly className?: string;
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: ClassValue;
}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium tracking-wide transition-[color,background-color,border-color,transform] duration-[var(--duration-base)] ease-[var(--ease-premium)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
    'disabled:pointer-events-none disabled:opacity-50',
    'motion-safe:active:scale-[0.985]',
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
