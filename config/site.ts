/**
 * Single source of truth for company-level metadata.
 *
 * Consumed by the Metadata API (`app/layout.tsx`), structured data helpers,
 * `sitemap.ts` and `robots.ts`. Centralising it here keeps SEO, Open Graph and
 * JSON-LD in sync and makes rebranding a one-file change.
 */
export const siteConfig = {
  name: 'Best Coatings Solutions',
  shortName: 'BCS',
  legalName: 'Best Coatings Solutions LLC',
  description:
    'Premium mobile marine and aviation coatings, refinishing and composite repair. Serving South Florida from Jupiter to the Florida Keys.',
  /**
   * Canonical origin. Overridable per-environment via NEXT_PUBLIC_SITE_URL so
   * preview deployments generate correct absolute URLs for OG tags and sitemaps.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bestcoatingssolutions.com',
  locale: 'en_US',
  themeColor: '#0a1a2f',
  contact: {
    email: 'info@bestcoatingssolutions.com',
    phone: '',
  },
  serviceArea: {
    primary: 'South Florida',
    range: 'Jupiter south to the Florida Keys',
  },
  social: {
    instagram: '',
    facebook: '',
  },
} as const;

export type SiteConfig = typeof siteConfig;
