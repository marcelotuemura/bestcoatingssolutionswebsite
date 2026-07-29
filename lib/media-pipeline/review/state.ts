/**
 * Operator review state overlay (JSON). Does not mutate archive originals.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { MEDIA_REVIEW_STATE_PATH } from '@/lib/media-pipeline/constants';
import { canMarkPublished } from '@/lib/media-pipeline/archive-rules';
import { derivePrivacyStatus } from '@/lib/media-pipeline/privacy';
import type {
  MediaAssetRecord,
  MediaManifest,
  MediaReviewOverride,
  MediaReviewState,
} from '@/lib/media-pipeline/types';
import {
  mediaAssetRecordSchema,
  mediaReviewStateSchema,
} from '@/lib/media-pipeline/types';

export function emptyReviewState(
  updatedAt = new Date().toISOString(),
): MediaReviewState {
  return mediaReviewStateSchema.parse({
    version: 1,
    updatedAt,
    overrides: [],
    beforeAfterPairs: [],
  });
}

export async function readReviewState(
  repoRoot: string,
  relativePath: string = MEDIA_REVIEW_STATE_PATH,
): Promise<MediaReviewState> {
  const full = path.join(repoRoot, relativePath);
  try {
    const raw = await fs.readFile(full, 'utf8');
    return mediaReviewStateSchema.parse(JSON.parse(raw));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return emptyReviewState();
    throw err;
  }
}

export async function writeReviewState(
  repoRoot: string,
  state: MediaReviewState,
  relativePath: string = MEDIA_REVIEW_STATE_PATH,
): Promise<string> {
  const full = path.join(repoRoot, relativePath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  return full;
}

export function applyReviewOverride(
  asset: MediaAssetRecord,
  override: MediaReviewOverride | undefined,
): MediaAssetRecord {
  if (!override) return asset;
  const privacyChecklist = {
    ...asset.privacyChecklist,
    ...(override.privacyChecklist ?? {}),
  };
  const approval = {
    ...asset.approval,
    ...(override.approval ?? {}),
  };
  const merged: MediaAssetRecord = {
    ...asset,
    division: override.division ?? asset.division,
    stage: override.stage ?? asset.stage,
    category: override.category ?? asset.category,
    status: override.status ?? asset.status,
    privacyStatus: override.privacyStatus ?? asset.privacyStatus,
    qualityStatus: override.qualityStatus ?? asset.qualityStatus,
    publishStatus: override.publishStatus ?? asset.publishStatus,
    featured: override.featured ?? asset.featured,
    heroCandidate: override.heroCandidate ?? asset.heroCandidate,
    altText: override.altText !== undefined ? override.altText : asset.altText,
    caption: override.caption !== undefined ? override.caption : asset.caption,
    notes: override.notes !== undefined ? override.notes : asset.notes,
    manufacturer:
      override.manufacturer !== undefined
        ? override.manufacturer
        : asset.manufacturer,
    vesselModel:
      override.vesselModel !== undefined
        ? override.vesselModel
        : asset.vesselModel,
    year: override.year !== undefined ? override.year : asset.year,
    photographer:
      override.photographer !== undefined
        ? override.photographer
        : asset.photographer,
    publishedPath:
      override.publishedPath !== undefined
        ? override.publishedPath
        : asset.publishedPath,
    privacyChecklist,
    approval,
  };

  // If operator set checklist review, re-derive privacy unless explicitly overridden
  if (override.privacyChecklist && !override.privacyStatus) {
    merged.privacyStatus = derivePrivacyStatus({
      checklist: privacyChecklist,
      hasGpsExif: asset.flags.hasGpsExif,
    });
  }

  return mediaAssetRecordSchema.parse(merged);
}

export function mergeManifestWithReview(
  manifest: MediaManifest,
  review: MediaReviewState,
): readonly MediaAssetRecord[] {
  const byId = new Map(review.overrides.map((o) => [o.assetId, o]));
  return manifest.assets.map((asset) =>
    applyReviewOverride(asset, byId.get(asset.id)),
  );
}

export type InventoryFilters = {
  readonly projectSlug?: string;
  readonly division?: string;
  readonly stage?: string;
  readonly status?: string;
  readonly privacyStatus?: string;
  readonly publishStatus?: string;
  readonly qualityStatus?: string;
  readonly q?: string;
};

export function filterInventoryAssets(
  assets: readonly MediaAssetRecord[],
  filters: InventoryFilters,
): readonly MediaAssetRecord[] {
  return assets.filter((asset) => {
    if (filters.projectSlug && asset.projectSlug !== filters.projectSlug) {
      return false;
    }
    if (filters.division && asset.division !== filters.division) return false;
    if (filters.stage && asset.stage !== filters.stage) return false;
    if (filters.status && asset.status !== filters.status) return false;
    if (
      filters.privacyStatus &&
      asset.privacyStatus !== filters.privacyStatus
    ) {
      return false;
    }
    if (
      filters.publishStatus &&
      asset.publishStatus !== filters.publishStatus
    ) {
      return false;
    }
    if (
      filters.qualityStatus &&
      asset.qualityStatus !== filters.qualityStatus
    ) {
      return false;
    }
    if (filters.q) {
      const hay = [
        asset.originalFilename,
        asset.archivePath,
        asset.sourceAlbum,
        asset.projectSlug,
        asset.altText ?? '',
        asset.notes ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });
}

export function upsertReviewOverride(
  state: MediaReviewState,
  override: MediaReviewOverride,
): MediaReviewState {
  const gate = canMarkPublished(
    override.privacyStatus ?? 'unchecked',
    override.publishStatus ?? 'not-published',
  );
  if (!gate.ok) {
    throw new Error(gate.reason);
  }
  const rest = state.overrides.filter((o) => o.assetId !== override.assetId);
  return mediaReviewStateSchema.parse({
    version: 1,
    updatedAt: override.updatedAt,
    overrides: [...rest, override],
    beforeAfterPairs: state.beforeAfterPairs,
  });
}
