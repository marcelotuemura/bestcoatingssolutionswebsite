import { cn, type ClassValue } from '@/utils/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary:
    'bg-electric-500 text-white hover:bg-electric-400 active:bg-electric-600 focus-visible:ring-electric-500',
  secondary:
    'border border-navy-700 bg-navy-900 text-silver-100 hover:border-electric-500/50 hover:bg-navy-800 focus-visible:ring-electric-500',
  ghost:
    'text-silver-300 hover:bg-navy-800 hover:text-silver-100 focus-visible:ring-electric-500',
  link: 'text-electric-400 underline-offset-4 hover:text-electric-500 hover:underline focus-visible:ring-electric-500',
} as const;

const sizes = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm sm:min-h-12 sm:px-5',
  lg: 'min-h-12 px-6 text-base',
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
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950',
    'disabled:pointer-events-none disabled:opacity-50',
    'motion-safe:active:scale-[0.98]',
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
