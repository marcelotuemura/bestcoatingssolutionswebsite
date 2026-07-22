import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Builds the shared, site-wide `Metadata` object used by the root layout.
 *
 * `metadataBase` makes every relative OG/Twitter/canonical URL resolve to an
 * absolute one automatically, which is required for valid social previews.
 * Per-page metadata should spread from here and override only what changes.
 */
export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — Marine & Aviation Coatings`,
      template: `%s | ${siteConfig.shortName}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    referrer: 'origin-when-cross-origin',
    keywords: [
      'marine coatings',
      'aviation coatings',
      'yacht refinishing',
      'aircraft refinishing',
      'gelcoat repair',
      'ceramic coating',
      'South Florida',
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.legalName,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: `${siteConfig.name} — Marine & Aviation Coatings`,
      description: siteConfig.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteConfig.name} — Marine & Aviation Coatings`,
      description: siteConfig.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
