import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { cn } from '@/utils/cn';

export interface BreadcrumbCrumb {
  readonly label: string;
  readonly href?: string;
}

export function Breadcrumbs({
  locale,
  items,
  ariaLabel,
  className,
}: {
  readonly locale: Locale;
  readonly items: readonly BreadcrumbCrumb[];
  readonly ariaLabel: string;
  readonly className?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className={cn('mb-8', className)}>
      <ol className="text-silver-500 flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 ? (
                <span aria-hidden="true" className="text-silver-700">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={localePath(locale, item.href)}
                  className="hover:text-silver-200 focus-visible:ring-electric-500 rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-silver-300' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
