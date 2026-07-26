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
  /**
   * Intrinsic pixel sizes for production rasters (owner-supplied).
   * Aspect ≈ 2.63 (official 1200×456; header 340×129).
   */
  intrinsic: {
    official: { width: 1200, height: 456 },
    header: { width: 340, height: 129 },
    header2x: { width: 680, height: 258 },
  },
  /**
   * Public paths checked on the server, first match wins.
   * Prefer WebP production rasters; SVG remains supported if supplied later.
   */
  officialCandidates: [
    '/brand/bcs-logo-official.webp',
    '/brand/bcs-logo-official.svg',
    '/brand/bcs-logo-official.png',
  ] as const,
  /** Compact header lockup; falls back to official when absent. */
  headerCandidates: [
    '/brand/bcs-logo-header.webp',
    '/brand/bcs-logo-header.png',
  ] as const,
  header2xCandidates: [
    '/brand/bcs-logo-header@2x.webp',
    '/brand/bcs-logo-header@2x.png',
  ] as const,
  notes: [
    'Preferred production asset: `bcs-logo-official.webp` (full mark for hero, footer, brand moments).',
    'Header uses `bcs-logo-header.webp` (+ `@2x` when present) at ≈36px height in a 64px bar.',
    'Temporary SVG (`bcs-logo-temporary.svg`) is layout scaffolding only — never the official mark.',
    'Current production rasters are opaque near-black plates matching `bg-primary`; do not invent transparent exports.',
  ],
} as const;
