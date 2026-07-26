/**
 * Official BCS logo usage — server resolution.
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

import 'server-only';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { brandLogoMeta } from '@/config/brand-logo-meta';

function resolveOfficialSrc(): string | null {
  const dir = path.join(process.cwd(), 'public', 'brand');
  for (const publicPath of brandLogoMeta.officialCandidates) {
    const file = publicPath.replace('/brand/', '');
    if (existsSync(path.join(dir, file))) {
      return publicPath;
    }
  }
  return null;
}

const officialSrc = resolveOfficialSrc();

export const brandLogo = {
  ...brandLogoMeta,
  /** Official or interim production raster/SVG — null when file not in repo. */
  officialSrc,
  /** True when no official SVG/PNG/WebP is present. */
  officialFilePending: officialSrc === null,
  /**
   * Header uses the official image when present; otherwise a documented text
   * wordmark (not the temporary letterform SVG).
   */
  headerMode: officialSrc ? ('image' as const) : ('text' as const),
} as const;
