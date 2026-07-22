import { siteConfig } from '@/config/site';

/**
 * JSON-LD structured data builders (schema.org).
 *
 * Returning plain objects (rather than rendering markup here) keeps these pure
 * and unit-testable; components inject them via a `<script type="application/ld+json">`
 * tag. Rich results improve local SEO for a mobile service business.
 */
export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    areaServed: siteConfig.serviceArea.range,
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
  };
}
