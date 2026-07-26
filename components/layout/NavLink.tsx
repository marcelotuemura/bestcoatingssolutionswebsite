'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function NavLink({
  href,
  children,
  className,
  onClick,
  exact = false,
}: {
  readonly href: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly onClick?: () => void;
  /** When true, only the exact path is active (used for Home). */
  readonly exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      data-active={active ? 'true' : 'false'}
      className={cn(
        'focus-visible:ring-focus-ring inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-3 text-sm font-medium transition-colors duration-[var(--duration-base)] ease-[var(--ease-premium)] focus-visible:ring-2 focus-visible:outline-none',
        active
          ? 'text-text-primary bg-surface/80'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface/50',
        className,
      )}
    >
      {children}
    </Link>
  );
}
