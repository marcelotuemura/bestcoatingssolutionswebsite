/**
 * Centralized legal / business identity for Privacy, Terms, and form notices.
 * Prefer this over duplicating NAP or entity strings in page copy.
 *
 * Do not invent street addresses, registrations, or certifications.
 */

import { siteConfig } from '@/config/site';

export const legalConfig = {
  /** Public operator name used in policy prose. */
  operatorName: siteConfig.name,
  /** Legal entity for copyright and formal references. */
  legalEntityName: siteConfig.legalName,
  governingRegion: 'Florida, United States',
  governingLaw: 'the laws of the State of Florida, United States',
  /**
   * ISO date for Privacy Policy and Terms of Use.
   * Update when either document content changes materially.
   */
  documentsEffectiveDate: '2026-07-26',
  documentsLastUpdated: '2026-07-26',
  contact: {
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    phoneE164: siteConfig.contact.phoneE164,
    /**
     * No public street address is published.
     * Owner may supply a mailing address later via this placeholder.
     */
    mailingAddress:
      '[Owner to provide mailing address if a postal address is required]',
  },
  hostingProvider: 'Vercel',
  emailDeliveryProvider: 'Resend',
  /**
   * Site uses Vercel Analytics (privacy-friendly, no marketing pixels).
   * No separate cookie-consent banner or third-party ad trackers are installed.
   */
  analytics: {
    vercelAnalytics: true,
    marketingPixels: false,
    cookieBanner: false,
  },
} as const;

export type LegalConfig = typeof legalConfig;
