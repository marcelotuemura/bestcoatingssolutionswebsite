'use server';

import { revalidatePath } from 'next/cache';
import { requireMediaPermission } from '@/lib/media-intelligence/auth/guards';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { canMarkPublished } from '@/lib/media-pipeline/archive-rules';
import {
  MEDIA_MANIFEST_PATH,
  MEDIA_REVIEW_STATE_PATH,
} from '@/lib/media-pipeline/constants';
import { readMediaManifest } from '@/lib/media-pipeline/inventory/scan';
import {
  mergeManifestWithReview,
  readReviewState,
  upsertReviewOverride,
  writeReviewState,
} from '@/lib/media-pipeline/review/state';
import type {
  MediaCategory,
  MediaDivision,
  MediaAssetStatus,
  MediaPrivacyStatus,
  MediaPublishStatus,
  MediaQualityStatus,
  MediaStage,
  MediaReviewOverride,
} from '@/lib/media-pipeline/types';

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v : '';
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true';
}

export async function saveInventoryReviewAction(
  formData: FormData,
): Promise<
  { readonly ok: true } | { readonly ok: false; readonly error: string }
> {
  try {
    await requireMediaPermission('review_privacy');
  } catch {
    try {
      await requireMediaPermission('edit_metadata');
    } catch {
      return { ok: false, error: 'Not authorized to review media inventory' };
    }
  }

  const session = await resolveMediaTrustedActor();
  if (!session.ok) {
    return { ok: false, error: 'Not authenticated' };
  }

  const assetId = str(formData, 'assetId');
  if (!assetId) return { ok: false, error: 'Missing assetId' };

  const repoRoot = process.cwd();
  const manifest = await readMediaManifest(repoRoot, MEDIA_MANIFEST_PATH);
  if (!manifest) {
    return {
      ok: false,
      error: 'Media manifest missing — run pnpm media:inventory',
    };
  }
  const review = await readReviewState(repoRoot, MEDIA_REVIEW_STATE_PATH);
  const merged = mergeManifestWithReview(manifest, review);
  const existing = merged.find((a) => a.id === assetId);
  if (!existing) return { ok: false, error: 'Asset not found in manifest' };

  const privacyStatus = (str(formData, 'privacyStatus') ||
    existing.privacyStatus) as MediaPrivacyStatus;
  const publishStatus = (str(formData, 'publishStatus') ||
    existing.publishStatus) as MediaPublishStatus;

  const gate = canMarkPublished(privacyStatus, publishStatus);
  if (!gate.ok) {
    return { ok: false, error: gate.reason };
  }

  const reviewedNow = bool(formData, 'privacyReviewed');
  const now = new Date().toISOString();

  const override: MediaReviewOverride = {
    assetId,
    division: (str(formData, 'division') || existing.division) as MediaDivision,
    stage: (str(formData, 'stage') || existing.stage) as MediaStage,
    category: (str(formData, 'category') || existing.category) as MediaCategory,
    status: (str(formData, 'status') || existing.status) as MediaAssetStatus,
    privacyStatus,
    qualityStatus: (str(formData, 'qualityStatus') ||
      existing.qualityStatus) as MediaQualityStatus,
    publishStatus,
    featured: bool(formData, 'featured'),
    heroCandidate: bool(formData, 'heroCandidate'),
    altText: str(formData, 'altText') || null,
    caption: str(formData, 'caption') || null,
    notes: str(formData, 'notes') || null,
    privacyChecklist: {
      visibleFace: bool(formData, 'privacy_visibleFace'),
      vesselRegistration: bool(formData, 'privacy_vesselRegistration'),
      hin: bool(formData, 'privacy_hin'),
      licensePlate: bool(formData, 'privacy_licensePlate'),
      customerDocument: bool(formData, 'privacy_customerDocument'),
      invoice: bool(formData, 'privacy_invoice'),
      address: bool(formData, 'privacy_address'),
      gpsMetadata: bool(formData, 'privacy_gpsMetadata'),
      otherPrivateInformation: bool(
        formData,
        'privacy_otherPrivateInformation',
      ),
      reviewedAt: reviewedNow ? now : existing.privacyChecklist.reviewedAt,
      reviewedBy: reviewedNow
        ? session.actor.email || session.actor.id
        : existing.privacyChecklist.reviewedBy,
    },
    updatedAt: now,
    updatedBy: session.actor.email || session.actor.id,
  };

  try {
    const next = upsertReviewOverride(review, override);
    await writeReviewState(repoRoot, next, MEDIA_REVIEW_STATE_PATH);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to save review',
    };
  }

  revalidatePath('/media/inventory');
  revalidatePath(`/media/inventory/${assetId}`);
  return { ok: true };
}
