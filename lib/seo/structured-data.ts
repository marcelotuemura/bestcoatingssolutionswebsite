import { siteConfig } from '@/config/site';
import { spokenLanguages } from '@/config/languages';

/**
 * JSON-LD structured data builders (schema.org).
 */
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
