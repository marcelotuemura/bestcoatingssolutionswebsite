import { ButtonLink } from '@/components/ui/ButtonLink';
import { BrandLockup } from '@/components/layout/BrandLockup';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { MobileNav } from '@/components/layout/MobileNav';
import { NavLink } from '@/components/layout/NavLink';
import { Container } from '@/components/ui/Container';
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
    <header
      className="border-border/40 bg-bg-primary/65 sticky top-0 z-40 border-b backdrop-blur-[6px]"
      data-testid="site-header"
    >
      <Container className="flex h-16 items-center justify-between gap-3">
        <BrandLockup locale={locale} label={dictionary.a11y.home} />

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label={dictionary.a11y.mainNav}
          data-testid="primary-nav"
        >
          {primaryNav.map((key) => {
            const href = localePath(locale, routes[key].path);
            return (
              <NavLink key={key} href={href} exact={key === 'home'}>
                {navLabel(dictionary, key)}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${siteConfig.contact.phoneE164}`}
            className="text-text-secondary hover:text-text-primary focus-visible:ring-focus-ring hidden min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none md:inline-flex"
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
