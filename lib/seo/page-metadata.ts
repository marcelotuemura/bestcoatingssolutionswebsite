import type { Locale } from '@/i18n/config';
import { localeOpenGraph } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';

export interface PageMetadataInput {
  readonly locale: Locale;
  /** Path after locale, e.g. `/marine` or `/services/gelcoat-repair`. */
  readonly path: string;
  readonly title: string;
  readonly description: string;
}

/** Soft SEO length guidance used by unit audits (not hard runtime rejects). */
export const SEO_LENGTH = {
  titleMax: 60,
  descriptionMin: 70,
  descriptionMax: 160,
} as const;

/**
 * Unique per-page metadata with canonical, hreflang, Open Graph, and Twitter.
 */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: PageMetadataInput): Metadata {
  const normalized =
    path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const canonicalPath = `/${locale}${normalized}`;
  const absolute = `${siteConfig.url}${canonicalPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: `/en${normalized}`,
        es: `/es${normalized}`,
        'x-default': `/en${normalized}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: localeOpenGraph[locale],
      url: absolute,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
