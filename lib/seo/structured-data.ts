import { spokenLanguages } from '@/config/languages';
import { siteConfig } from '@/config/site';

export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phoneE164,
    email: siteConfig.contact.email,
    areaServed: siteConfig.serviceArea.range,
    knowsLanguage: spokenLanguages.map((language) => language.code),
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: ['en', 'es'],
  };
}

export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

/** BreadcrumbList JSON-LD from locale-aware path segments. */
export function breadcrumbJsonLd(
  locale: string,
  items: readonly BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}/${locale}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

export function serviceJsonLd(input: {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly areaServed: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    provider: {
      '@type': 'ProfessionalService',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: input.areaServed,
  };
}
