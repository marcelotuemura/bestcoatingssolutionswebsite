'use server';

import { revalidatePath } from 'next/cache';
import {
  actorHasPermission,
  requireMediaPermission,
} from '@/lib/media-intelligence/auth/guards';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { MEDIA_MANIFEST_PATH } from '@/lib/media-pipeline/constants';
import {
  loadReviewState,
  persistReviewOverride,
} from '@/lib/media-pipeline/review/factory';
import {
  assertInventoryReviewBusinessRules,
  parseInventoryReviewFormData,
} from '@/lib/media-pipeline/review/validation';
import { readMediaManifest } from '@/lib/media-pipeline/inventory/scan';
import { mergeManifestWithReview } from '@/lib/media-pipeline/review/state';

export async function saveInventoryReviewAction(
  formData: FormData,
): Promise<
  { readonly ok: true } | { readonly ok: false; readonly error: string }
> {
  const session = await resolveMediaTrustedActor();
  if (!session.ok) {
    return { ok: false, error: 'Not authenticated' };
  }

  const canReview =
    actorHasPermission(session.actor, 'review_privacy') ||
    actorHasPermission(session.actor, 'edit_metadata');
  if (!canReview) {
    return { ok: false, error: 'Not authorized to review media inventory' };
  }

  // Enforce server-side permission throw path as defense in depth
  try {
    if (actorHasPermission(session.actor, 'review_privacy')) {
      await requireMediaPermission('review_privacy');
    } else {
      await requireMediaPermission('edit_metadata');
    }
  } catch {
    return { ok: false, error: 'Not authorized to review media inventory' };
  }

  const repoRoot = process.cwd();
  const manifest = await readMediaManifest(repoRoot, MEDIA_MANIFEST_PATH);
  if (!manifest) {
    return {
      ok: false,
      error: 'Media manifest missing — run pnpm media:inventory',
    };
  }

  const review = await loadReviewState(session.actor, repoRoot);
  const merged = mergeManifestWithReview(manifest, review);
  const assetIdRaw =
    typeof formData.get('assetId') === 'string'
      ? (formData.get('assetId') as string)
      : '';
  const existing = merged.find((a) => a.id === assetIdRaw);
  if (!existing) {
    return { ok: false, error: 'Unknown asset id — not present in manifest' };
  }

  const now = new Date().toISOString();
  const reviewerId = session.actor.email || session.actor.id;
  const parsed = parseInventoryReviewFormData(
    formData,
    existing,
    now,
    reviewerId,
  );
  if (!parsed.ok) {
    return parsed;
  }

  const rules = assertInventoryReviewBusinessRules({
    data: parsed.data,
    existingAssetId: existing.id,
  });
  if (!rules.ok) {
    return rules;
  }

  const data = parsed.data;
  try {
    await persistReviewOverride(
      {
        assetId: data.assetId,
        projectSlug: existing.projectSlug,
        division: data.division,
        stage: data.stage,
        category: data.category,
        status: data.status,
        privacyStatus: data.privacyStatus,
        qualityStatus: data.qualityStatus,
        publishStatus: data.publishStatus,
        featured: data.featured,
        heroCandidate: data.heroCandidate,
        altText: data.altText,
        caption: data.caption,
        notes: data.notes,
        privacyChecklist: data.privacyChecklist,
        updatedAt: now,
        updatedBy: reviewerId,
      },
      session.actor,
      repoRoot,
    );
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to save review',
    };
  }

  revalidatePath('/media/inventory');
  revalidatePath(`/media/inventory/${data.assetId}`);
  return { ok: true };
}
