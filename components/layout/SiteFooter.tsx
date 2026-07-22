import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Divider } from '@/components/ui/Divider';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { estimatePolicy } from '@/config/estimate-policy';
import { footerNav, routes, type RouteKey } from '@/config/routes';
import { getPublicSocialChannels } from '@/config/social';
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
  const social = getPublicSocialChannels();

  return (
    <footer className="border-navy-800 bg-navy-950 mt-auto border-t">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-1">
            <p className="text-base font-semibold text-white">
              {siteConfig.name}
            </p>
            <p className="text-silver-500 text-sm text-pretty">
              {dictionary.header.tagline}. {siteConfig.serviceArea.range}.
            </p>
            <p className="text-silver-500 text-xs text-pretty">
              {dictionary.footer.estimateNotice}
            </p>
            <p className="sr-only">{estimatePolicy.publicNotice}</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-white">
              {dictionary.footer.contact}
            </p>
            <ul className="text-silver-300 space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${siteConfig.contact.phoneE164}`}
                  className="hover:text-electric-400 focus-visible:ring-electric-500 rounded focus-visible:ring-2 focus-visible:outline-none"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-electric-400 focus-visible:ring-electric-500 rounded break-all focus-visible:ring-2 focus-visible:outline-none"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-white">
              {dictionary.footer.serviceArea}
            </p>
            <p className="text-silver-300 text-sm">
              {siteConfig.serviceArea.primary}
            </p>
            <p className="text-silver-500 mt-1 text-sm">
              {siteConfig.serviceArea.range}
            </p>
            <ul className="mt-4 space-y-2">
              {footerNav.map((key) => (
                <li key={key}>
                  <Link
                    href={localePath(locale, routes[key].path)}
                    className="text-silver-300 hover:text-electric-400 focus-visible:ring-electric-500 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {navLabel(dictionary, key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-medium text-white">
                {dictionary.footer.spokenLanguages}
              </p>
              <p className="text-silver-300 text-sm">
                {siteConfig.spokenLanguages.join(' · ')}
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-white">
                {dictionary.footer.socialHeading}
              </p>
              {social.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {social.map((channel) => (
                    <li key={channel.id}>
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-silver-300 hover:text-electric-400 focus-visible:ring-electric-500 text-sm focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {channel.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-silver-500 text-sm">
                  {dictionary.footer.socialUnavailable}
                </p>
              )}
            </div>
            <LanguageSwitcher
              locale={locale}
              label={dictionary.a11y.language}
            />
          </div>
        </div>

        <Divider className="my-8" />

        <div className="text-silver-500 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. {dictionary.footer.rights}
          </p>
          <p>{siteConfig.shortName}</p>
        </div>
      </Container>
    </footer>
  );
}
