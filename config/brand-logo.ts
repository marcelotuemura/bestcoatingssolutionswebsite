/**
 * Official BCS logo usage — server resolution.
 *
 * Owner-approved mark: powerboat + business jet + metallic BCS lettering.
 * Preferred production asset: `bcs-logo-official.webp`.
 * Header compact assets: `bcs-logo-header.webp` (+ `@2x`).
 * Never treat `bcs-logo-temporary.svg` as the official logo.
 * Do not auto-trace or invent artwork.
 *
 * Drop files here (first match wins within each list):
 *   public/brand/bcs-logo-official.webp  (preferred)
 *   public/brand/bcs-logo-official.svg
 *   public/brand/bcs-logo-official.png
 *   public/brand/bcs-logo-header.webp
 *   public/brand/bcs-logo-header.png
 *   public/brand/bcs-logo-header@2x.webp
 *   public/brand/bcs-logo-header@2x.png
 * Preserve originals under docs/branding/originals/ — never overwrite.
 */

import 'server-only';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { brandLogoMeta } from '@/config/brand-logo-meta';

function resolvePublicBrandPath(candidates: readonly string[]): string | null {
  const dir = path.join(process.cwd(), 'public', 'brand');
  for (const publicPath of candidates) {
    const file = publicPath.replace('/brand/', '');
    if (existsSync(path.join(dir, file))) {
      return publicPath;
    }
  }
  return null;
}

const officialSrc = resolvePublicBrandPath(brandLogoMeta.officialCandidates);
const headerResolved = resolvePublicBrandPath(brandLogoMeta.headerCandidates);
const headerSrc2x = resolvePublicBrandPath(brandLogoMeta.header2xCandidates);
const headerSrc = headerResolved ?? officialSrc;

export const brandLogo = {
  ...brandLogoMeta,
  /** Full production mark — null when file not in repo. */
  officialSrc,
  /** Compact header lockup (falls back to official). */
  headerSrc,
  /** Retina header asset when present. */
  headerSrc2x,
  /** True when no official SVG/PNG/WebP is present. */
  officialFilePending: officialSrc === null,
  /**
   * Header uses the official/header image when present; otherwise a documented
   * text wordmark (not the temporary letterform SVG).
   */
  headerMode: headerSrc ? ('image' as const) : ('text' as const),
} as const;
