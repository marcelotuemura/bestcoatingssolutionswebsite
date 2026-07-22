import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import type { ReactNode } from 'react';

export interface SiteShellProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly children: ReactNode;
}

export function SiteShell({ locale, dictionary, children }: SiteShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink label={dictionary.a11y.skipToContent} />
      <SiteHeader locale={locale} dictionary={dictionary} />
      <div className="flex-1">{children}</div>
      <SiteFooter locale={locale} dictionary={dictionary} />
    </div>
  );
}
