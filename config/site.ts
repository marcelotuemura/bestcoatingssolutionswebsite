/**
 * Single source of truth for company-level metadata.
 *
 * Consumed by the Metadata API, structured data helpers, sitemap, robots,
 * header/footer, and forms. Keep NAP and policy copy aligned with brand docs.
 */
export const siteConfig = {
  name: 'Best Coatings Solutions',
  shortName: 'BCS',
  legalName: 'Best Coatings Solutions LLC',
  description:
    'Premium mobile marine and aviation coatings, refinishing and composite repair. Serving South Florida from Jupiter southward.',
  /**
   * Canonical origin. Overridable per-environment via NEXT_PUBLIC_SITE_URL so
   * preview deployments generate correct absolute URLs for OG tags and sitemaps.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bestcoatingssolutions.com',
  defaultLocale: 'en' as const,
  locale: 'en_US',
  themeColor: '#0a1a2f',
  contact: {
    email: 'info@bestcoatingssolutions.com',
    /** Public phone — display formatted; use E.164 for tel: links. */
    phone: '305-747-8352',
    phoneE164: '+13057478352',
  },
  serviceArea: {
    primary: 'South Florida',
    range: 'Jupiter southward',
    /** Human-readable travel note — never imply unlimited free travel. */
    travelNote:
      'Projects outside the normal service area may be considered by arrangement.',
  },
  /**
   * Spoken languages (business capability). Site UI locales are separate
   * (`i18n/config.ts` — English and Spanish for first release).
   */
  spokenLanguages: ['English', 'Spanish', 'Portuguese', 'Japanese'] as const,
  /**
   * Homepage “Coming Soon” portal mock. Off by default so it cannot compete
   * with estimate/schedule CTAs until explicitly enabled.
   */
  portalTeaser: {
    enabled: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;
