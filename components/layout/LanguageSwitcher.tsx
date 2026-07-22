'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { switchLocalePath } from '@/i18n/path';
import { cn } from '@/utils/cn';

export interface LanguageSwitcherProps {
  readonly locale: Locale;
  readonly label: string;
  readonly className?: string;
}

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
};

export function LanguageSwitcher({
  locale,
  label,
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role="group"
      aria-label={label}
    >
      {locales.map((code) => {
        const active = code === locale;
        return (
          <Link
            key={code}
            href={switchLocalePath(pathname, code)}
            hrefLang={code}
            lang={code}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'focus-visible:ring-electric-500 focus-visible:ring-offset-navy-950 min-h-10 min-w-10 rounded-lg px-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              active
                ? 'bg-navy-800 text-white'
                : 'text-silver-500 hover:bg-navy-800 hover:text-silver-100',
            )}
          >
            {localeLabels[code]}
          </Link>
        );
      })}
    </div>
  );
}
