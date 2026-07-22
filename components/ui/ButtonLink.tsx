import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface ButtonLinkProps extends Omit<
  ComponentProps<typeof Link>,
  'className'
> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly children: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonClassName({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}
