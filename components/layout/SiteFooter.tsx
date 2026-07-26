import Link from 'next/link';
import { BrandLogoMark } from '@/components/brand/BrandLogoMark';
import { Container } from '@/components/ui/Container';
import { Divider } from '@/components/ui/Divider';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { brandLogo } from '@/config/brand-logo';
import { estimatePolicy } from '@/config/estimate-policy';
import { footerNav, routes, type RouteKey } from '@/config/routes';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export interface SiteFooterProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

function navLabel(dictionary: Dictionary, key: RouteKey): string {
  return dictionary.nav[key as keyof typeof dictionary.nav] ?? key;
}

export function SiteFooter({ locale, dictionary }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-border bg-bg-primary mt-auto border-t"
      data-testid="site-footer"
    >
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-1">
            <BrandLogoMark
              maxHeightPx={brandLogo.recommendedMaxHeightPx.footer}
            />
            <p className="text-text-secondary text-sm text-pretty">
              {dictionary.footer.brandBlurb}
            </p>
            <p className="text-text-muted text-xs text-pretty">
              {dictionary.footer.estimateNotice}
            </p>
            <p className="sr-only">{estimatePolicy.publicNotice}</p>
          </div>

          <div>
            <p className="text-text-primary mb-3 text-sm font-medium">
              {dictionary.footer.contact}
            </p>
            <ul className="text-text-secondary space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${siteConfig.contact.phoneE164}`}
                  className="hover:text-accent-hover focus-visible:ring-focus-ring rounded focus-visible:ring-2 focus-visible:outline-none"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-accent-hover focus-visible:ring-focus-ring rounded break-all focus-visible:ring-2 focus-visible:outline-none"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
            <p className="text-text-muted mt-4 text-sm">
              {siteConfig.serviceArea.primary}
            </p>
          </div>

          <div>
            <p className="text-text-primary mb-3 text-sm font-medium">
              {dictionary.footer.explore}
            </p>
            <ul className="space-y-2">
              {footerNav.map((key) => (
                <li key={key}>
                  <Link
                    href={localePath(locale, routes[key].path)}
                    className="text-text-secondary hover:text-accent-hover focus-visible:ring-focus-ring text-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {navLabel(dictionary, key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-text-primary mb-3 text-sm font-medium">
                {dictionary.footer.spokenLanguages}
              </p>
              <p className="text-text-secondary text-sm">
                {siteConfig.spokenLanguages.join(' · ')}
              </p>
            </div>
            <LanguageSwitcher
              locale={locale}
              label={dictionary.a11y.language}
            />
          </div>
        </div>

        <Divider className="my-8" />

        <div className="text-text-muted flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. {dictionary.footer.rights}
          </p>
          <p>{siteConfig.shortName}</p>
        </div>
      </Container>
    </footer>
  );
}
