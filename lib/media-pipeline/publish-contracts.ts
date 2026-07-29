/**
 * Publish / derivative service contracts for later phases.
 * Phase 2A provides stubs only — no public publishing.
 */

import type { MediaAssetRecord } from '@/lib/media-pipeline/types';
import { canMarkPublished } from '@/lib/media-pipeline/archive-rules';

export type DerivativeResult = {
  readonly ok: false;
  readonly deferred: true;
  readonly reason: string;
};

export type PublishResult =
  | { readonly ok: true; readonly publishedPath: string }
  | { readonly ok: false; readonly reason: string; readonly deferred?: true };

const DEFERRED: DerivativeResult = {
  ok: false,
  deferred: true,
  reason: 'Deferred to Phase 2B/C — Phase 2A is inventory and review only',
};

export async function generateDerivative(
  _asset: MediaAssetRecord,
  _kind: 'thumbnail' | 'webp' | 'avif' | 'preview',
): Promise<DerivativeResult> {
  return DEFERRED;
}

export async function stripMetadata(
  _asset: MediaAssetRecord,
): Promise<DerivativeResult> {
  return DEFERRED;
}

export async function convertToWebP(
  _asset: MediaAssetRecord,
): Promise<DerivativeResult> {
  return DEFERRED;
}

export async function convertToAvif(
  _asset: MediaAssetRecord,
): Promise<DerivativeResult> {
  return DEFERRED;
}

export async function generateThumbnail(
  _asset: MediaAssetRecord,
  _size: 200 | 400 | 800 | 1600,
): Promise<DerivativeResult> {
  return DEFERRED;
}

export function proposeFilename(asset: MediaAssetRecord): string {
  const base = asset.originalFilename.replace(/\.[^.]+$/, '');
  const safe = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${asset.projectSlug}-${safe || 'frame'}.webp`;
}

export function proposeAltText(asset: MediaAssetRecord): string | null {
  // Never invent vessel/customer claims — only return existing operator alt.
  return asset.altText;
}

/**
 * Hard gate: never publish from archive path; never publish unchecked privacy.
 * Full filesystem publish is deferred.
 */
export async function publishAsset(
  asset: MediaAssetRecord,
): Promise<PublishResult> {
  if (asset.archivePath.startsWith('data/pictures/')) {
    const gate = canMarkPublished(asset.privacyStatus, 'published');
    if (!gate.ok) {
      return { ok: false, reason: gate.reason };
    }
  }
  if (asset.privacyStatus !== 'clear') {
    return {
      ok: false,
      reason: `Privacy must be clear before publish (got ${asset.privacyStatus})`,
    };
  }
  return {
    ok: false,
    deferred: true,
    reason:
      'Website publish export is deferred to Phase C (public/images write + config bridge)',
  };
}

export async function unpublishAsset(
  _asset: MediaAssetRecord,
): Promise<PublishResult> {
  return {
    ok: false,
    deferred: true,
    reason: 'Unpublish is deferred to Phase C',
  };
}
