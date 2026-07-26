/**
 * Official BCS logo usage — Phase 5C.
 *
 * Owner-approved mark: powerboat + business jet + metallic BCS lettering.
 * Prefer designer SVG. If unavailable, use optimized PNG/WebP interim files.
 * Never treat `bcs-logo-temporary.svg` as the official logo.
 * Do not auto-trace or invent artwork.
 *
 * Drop files here (first match wins):
 *   public/brand/bcs-logo-official.svg
 *   public/brand/bcs-logo-official.webp
 *   public/brand/bcs-logo-official.png
 * Preserve originals under docs/branding/originals/ — never overwrite.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

const OFFICIAL_CANDIDATES = [
  'bcs-logo-official.svg',
  'bcs-logo-official.webp',
  'bcs-logo-official.png',
] as const;

function resolveOfficialSrc(): string | null {
  const dir = path.join(process.cwd(), 'public', 'brand');
  for (const file of OFFICIAL_CANDIDATES) {
    if (existsSync(path.join(dir, file))) {
      return `/brand/${file}`;
    }
  }
  return null;
}

const officialSrc = resolveOfficialSrc();

export const brandLogo = {
  /** Official or interim production raster/SVG — null when file not in repo. */
  officialSrc,
  /** True when no official SVG/PNG/WebP is present. */
  officialFilePending: officialSrc === null,
  /**
   * Header uses the official image when present; otherwise a documented text
   * wordmark (not the temporary letterform SVG).
   */
  headerMode: officialSrc ? ('image' as const) : ('text' as const),
  alt: 'Best Coatings Solutions',
  recommendedMaxHeightPx: {
    header: 36,
    hero: 88,
    footer: 48,
    designSystemPreview: 120,
  },
  notes: [
    'Full illustrated logo: hero, footer, and brand presentations when the official file is present.',
    'Header height stays calm (≈36px mark in a 64px bar). If the official mark is too tall, document and propose a simplified horizontal variant — do not invent one.',
    'Temporary SVG (`bcs-logo-temporary.svg`) is layout scaffolding only — never the official mark.',
  ],
} as const;
