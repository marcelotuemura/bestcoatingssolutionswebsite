import Link from 'next/link';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { cn } from '@/utils/cn';

export interface LogoProps {
  readonly locale: Locale;
  readonly label: string;
  readonly tagline?: string;
  readonly className?: string;
  readonly compact?: boolean;
}

export function Logo({
  locale,
  label,
  tagline,
  className,
  compact = false,
}: LogoProps) {
  return (
    <Link
      href={localePath(locale)}
      aria-label={label}
      className={cn(
        'focus-visible:ring-electric-500 group focus-visible:ring-offset-navy-950 inline-flex items-center gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
    >
      <span
        aria-hidden
        className="border-electric-500/50 from-electric-500/20 to-navy-800 flex size-9 items-center justify-center rounded-lg border bg-gradient-to-br text-xs font-semibold tracking-wider text-white"
      >
        {siteConfig.shortName}
      </span>
      {compact ? null : (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-white sm:text-base">
            {siteConfig.name}
          </span>
          {tagline ? (
            <span className="text-silver-500 hidden text-xs sm:inline">
              {tagline}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}
