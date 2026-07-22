import Link from 'next/link';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Logo } from '@/components/layout/Logo';
import { MobileNav } from '@/components/layout/MobileNav';
import { divisions } from '@/config/divisions';
import { primaryNav, routes, type RouteKey } from '@/config/routes';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export interface SiteHeaderProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

function navLabel(dictionary: Dictionary, key: RouteKey): string {
  return dictionary.nav[key as keyof typeof dictionary.nav] ?? key;
}

export function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  return (
    <header className="border-navy-800/80 bg-navy-950/90 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Logo
          locale={locale}
          label={dictionary.a11y.home}
          tagline={dictionary.header.tagline}
        />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label={dictionary.a11y.mainNav}
        >
          {primaryNav.map((key) => {
            const route = routes[key];
            const aviationSoon =
              key === 'aviation' && divisions.aviation.status === 'coming-soon';
            return (
              <Link
                key={key}
                href={localePath(locale, route.path)}
                className="text-silver-300 hover:text-silver-100 focus-visible:ring-electric-500 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
              >
                {navLabel(dictionary, key)}
                {aviationSoon ? (
                  <span className="text-silver-500 text-[0.65rem] font-normal tracking-wide uppercase">
                    {dictionary.divisionStatus[divisions.aviation.status]}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${siteConfig.contact.phoneE164}`}
            className="text-silver-300 hover:text-silver-100 focus-visible:ring-electric-500 hidden min-h-11 items-center rounded-lg px-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none md:inline-flex"
          >
            {siteConfig.contact.phone}
          </a>
          <LanguageSwitcher
            locale={locale}
            label={dictionary.a11y.language}
            className="hidden sm:inline-flex"
          />
          <ButtonLink
            href={localePath(locale, routes.estimateRequest.path)}
            size="sm"
            className="hidden sm:inline-flex"
          >
            {dictionary.cta.estimate}
          </ButtonLink>
          <MobileNav locale={locale} dictionary={dictionary} />
        </div>
      </Container>
    </header>
  );
}
