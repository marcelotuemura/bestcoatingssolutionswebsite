/**
 * Client-safe brand logo metadata (no Node filesystem).
 * Official file resolution lives in `config/brand-logo.ts` (server-only).
 */

export const brandLogoMeta = {
  alt: 'Best Coatings Solutions',
  recommendedMaxHeightPx: {
    header: 36,
    hero: 88,
    footer: 48,
    designSystemPreview: 120,
  },
  /** Public paths checked on the server, first match wins. */
  officialCandidates: [
    '/brand/bcs-logo-official.svg',
    '/brand/bcs-logo-official.webp',
    '/brand/bcs-logo-official.png',
  ] as const,
  notes: [
    'Full illustrated logo: hero, footer, and brand presentations when the official file is present.',
    'Header height stays calm (≈36px mark in a 64px bar). If the official mark is too tall, document and propose a simplified horizontal variant — do not invent one.',
    'Temporary SVG (`bcs-logo-temporary.svg`) is layout scaffolding only — never the official mark.',
  ],
} as const;
