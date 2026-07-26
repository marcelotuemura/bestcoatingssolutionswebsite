/**
 * Phase 7 gallery service façade.
 * Default runtime persists via PostgreSQL SECURITY DEFINER RPCs.
 * Memory path is opt-in for isolated unit tests only.
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import {
  actorCanGalleryEdit,
  actorCanGalleryReview,
} from '@/lib/media-intelligence/gallery/permissions';
import {
  validateCollectionName,
  validateReviewDecision,
  sanitizeMetadataInput,
  canPreparePublicationForAsset,
} from '@/lib/media-intelligence/gallery/validation';
import { resolveGalleryRepositoryMode } from '@/lib/media-intelligence/gallery/runtime';
import {
  dbListGalleryAssets,
  dbGetGalleryAsset,
  dbUpdateGalleryMetadata,
  dbSetGalleryFavorite,
  dbCreateGalleryCollection,
  dbUpdateGalleryCollection,
  dbGalleryCollectionSetAssets,
  dbListGalleryCollections,
  dbGetGalleryCollection,
  dbArchiveGalleryAssets,
  dbSubmitForReview,
  dbReviewGalleryAsset,
  dbListGalleryEvents,
  dbGalleryEnsureMembership,
} from '@/lib/media-intelligence/gallery/db-repository';
import {
  memoryListAssets,
  memoryGetAsset,
  memoryUpdateAssetMetadata,
  memorySetFavorite,
  memoryCreateCollection,
  memoryListCollections,
  memoryGetCollection,
  memoryCollectionSetAssets,
  memoryArchiveAssets,
  memoryListEvents,
} from '@/lib/media-intelligence/gallery/store';
import type {
  GalleryAsset,
  GalleryCollection,
  GalleryEvent,
  GalleryListParams,
  GalleryListResult,
  GalleryMetadataInput,
  BulkActionResult,
} from '@/lib/media-intelligence/gallery/types';
import { galleryActorIdToUuid as galleryActorIdToUuidFromPg } from '@/lib/media-intelligence/gallery/pg';

// Re-export for convenience
export { galleryActorIdToUuidFromPg as galleryActorIdToUuid };

type Result<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string; readonly status: number };

function deny(error: string, status = 403): Result<never> {
  return { ok: false, error, status };
}

function pgError(error: unknown): Result<never> {
  const message = error instanceof Error ? error.message : String(error);
  const status = /permission denied|42501/i.test(message)
    ? 403
    : /not found|P0002/i.test(message)
      ? 404
      : 400;
  return deny(
    message.replace(/^ERROR:\s*/i, '').split('\n')[0] ?? message,
    status,
  );
}

function isMemoryBackend(): boolean {
  try {
    return resolveGalleryRepositoryMode() === 'memory';
  } catch {
    return false;
  }
}

// ── List / search assets ──────────────────────────────────────────────────────

export async function listGalleryAssets(
  actor: MediaTrustedActor,
  params: Partial<GalleryListParams> = {},
): Promise<Result<GalleryListResult>> {
  if (!actorHasPermission(actor, 'read')) {
    return deny('Not authorized to view gallery.');
  }
  const resolved: GalleryListParams = {
    workspaceId: params.workspaceId ?? 'bcs-default',
    q: params.q,
    kind: params.kind,
    privacy: params.privacy,
    reviewStatus: params.reviewStatus,
    duplicate: params.duplicate,
    onlyFavorites: params.onlyFavorites,
    collectionId: params.collectionId,
    archived: params.archived ?? false,
    sort: params.sort ?? 'created_desc',
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 48,
  };
  try {
    if (isMemoryBackend()) {
      const actorUuid = galleryActorIdToUuidFromPg(actor.id);
      return { ok: true, data: memoryListAssets(resolved, actorUuid) };
    }
    const data = await dbListGalleryAssets(actor, resolved);
    return { ok: true, data };
  } catch (err) {
    return pgError(err);
  }
}

export async function getGalleryAsset(
  actor: MediaTrustedActor,
  externalId: string,
): Promise<Result<GalleryAsset>> {
  if (!actorHasPermission(actor, 'read')) {
    return deny('Not authorized.');
  }
  try {
    if (isMemoryBackend()) {
      const asset = memoryGetAsset(externalId);
      if (!asset) return deny('Asset not found.', 404);
      return { ok: true, data: asset };
    }
    const asset = await dbGetGalleryAsset(actor, externalId);
    if (!asset) return deny('Asset not found.', 404);
    return { ok: true, data: asset };
  } catch (err) {
    return pgError(err);
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function updateGalleryMetadata(
  actor: MediaTrustedActor,
  externalId: string,
  input: GalleryMetadataInput,
): Promise<Result<GalleryAsset>> {
  if (!actorCanGalleryEdit(actor)) {
    return deny('Viewers cannot edit metadata.');
  }
  const sanitized = sanitizeMetadataInput(input);
  try {
    if (isMemoryBackend()) {
      const asset = memoryUpdateAssetMetadata(
        externalId,
        sanitized,
        'bcs-default',
      );
      return { ok: true, data: asset };
    }
    const asset = await dbUpdateGalleryMetadata(actor, externalId, sanitized);
    return { ok: true, data: asset };
  } catch (err) {
    return pgError(err);
  }
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export async function setGalleryFavorite(
  actor: MediaTrustedActor,
  assetExternalId: string,
  favorite: boolean,
  workspaceId = 'bcs-default',
): Promise<Result<void>> {
  if (!actorHasPermission(actor, 'read')) {
    return deny('Not authorized.');
  }
  try {
    if (isMemoryBackend()) {
      const actorUuid = galleryActorIdToUuidFromPg(actor.id);
      memorySetFavorite(actorUuid, assetExternalId, workspaceId, favorite);
      return { ok: true, data: undefined };
    }
    await dbSetGalleryFavorite(actor, assetExternalId, favorite, workspaceId);
    return { ok: true, data: undefined };
  } catch (err) {
    return pgError(err);
  }
}

// ── Collections ───────────────────────────────────────────────────────────────

export async function listGalleryCollections(
  actor: MediaTrustedActor,
  workspaceId = 'bcs-default',
): Promise<Result<GalleryCollection[]>> {
  if (!actorHasPermission(actor, 'read')) {
    return deny('Not authorized.');
  }
  try {
    if (isMemoryBackend()) {
      return { ok: true, data: memoryListCollections(workspaceId) };
    }
    const collections = await dbListGalleryCollections(actor, workspaceId);
    return { ok: true, data: collections };
  } catch (err) {
    return pgError(err);
  }
}

export async function getGalleryCollection(
  actor: MediaTrustedActor,
  collectionId: string,
): Promise<Result<GalleryCollection>> {
  if (!actorHasPermission(actor, 'read')) {
    return deny('Not authorized.');
  }
  try {
    if (isMemoryBackend()) {
      const col = memoryGetCollection(collectionId);
      if (!col) return deny('Collection not found.', 404);
      return { ok: true, data: col };
    }
    const col = await dbGetGalleryCollection(actor, collectionId);
    if (!col) return deny('Collection not found.', 404);
    return { ok: true, data: col };
  } catch (err) {
    return pgError(err);
  }
}

export async function createGalleryCollection(
  actor: MediaTrustedActor,
  workspaceId: string,
  name: string,
  description = '',
): Promise<Result<GalleryCollection>> {
  if (!actorCanGalleryEdit(actor)) {
    return deny('Viewers cannot create collections.');
  }
  const nameCheck = validateCollectionName(name);
  if (!nameCheck.ok) {
    return deny(nameCheck.error, 400);
  }
  try {
    if (isMemoryBackend()) {
      const actorUuid = galleryActorIdToUuidFromPg(actor.id);
      const col = memoryCreateCollection(
        workspaceId,
        name,
        description,
        actorUuid,
      );
      return { ok: true, data: col };
    }
    const col = await dbCreateGalleryCollection(
      actor,
      workspaceId,
      name,
      description,
    );
    return { ok: true, data: col };
  } catch (err) {
    return pgError(err);
  }
}

export async function updateGalleryCollection(
  actor: MediaTrustedActor,
  collectionId: string,
  input: {
    name?: string;
    description?: string;
    coverAssetExternalId?: string;
    archive?: boolean;
  },
): Promise<Result<GalleryCollection>> {
  if (!actorCanGalleryEdit(actor)) {
    return deny('Viewers cannot update collections.');
  }
  if (input.name !== undefined) {
    const nameCheck = validateCollectionName(input.name);
    if (!nameCheck.ok) return deny(nameCheck.error, 400);
  }
  try {
    if (isMemoryBackend()) {
      const col = memoryGetCollection(collectionId);
      if (!col) return deny('Collection not found.', 404);
      return {
        ok: true,
        data: { ...col, ...input, updatedAt: new Date().toISOString() },
      };
    }
    const col = await dbUpdateGalleryCollection(actor, collectionId, input);
    return { ok: true, data: col };
  } catch (err) {
    return pgError(err);
  }
}

export async function galleryCollectionSetAssets(
  actor: MediaTrustedActor,
  collectionId: string,
  assetExternalIds: string[],
  mode: 'add' | 'remove',
  workspaceId = 'bcs-default',
): Promise<Result<number>> {
  if (!actorCanGalleryEdit(actor)) {
    return deny('Viewers cannot modify collections.');
  }
  try {
    if (isMemoryBackend()) {
      const n = memoryCollectionSetAssets(
        collectionId,
        assetExternalIds,
        mode,
        workspaceId,
      );
      return { ok: true, data: n };
    }
    const n = await dbGalleryCollectionSetAssets(
      actor,
      collectionId,
      assetExternalIds,
      mode,
    );
    return { ok: true, data: n };
  } catch (err) {
    return pgError(err);
  }
}

// ── Bulk actions ──────────────────────────────────────────────────────────────

export async function archiveGalleryAssets(
  actor: MediaTrustedActor,
  assetExternalIds: string[],
  workspaceId = 'bcs-default',
): Promise<Result<BulkActionResult>> {
  if (!actorCanGalleryEdit(actor)) {
    return deny('Viewers cannot archive assets.');
  }
  try {
    if (isMemoryBackend()) {
      const n = memoryArchiveAssets(assetExternalIds, workspaceId);
      return { ok: true, data: { ok: true, affected: n } };
    }
    const n = await dbArchiveGalleryAssets(
      actor,
      assetExternalIds,
      workspaceId,
    );
    return { ok: true, data: { ok: true, affected: n } };
  } catch (err) {
    return pgError(err);
  }
}

export async function submitGalleryAssetsForReview(
  actor: MediaTrustedActor,
  assetExternalIds: string[],
  workspaceId = 'bcs-default',
): Promise<Result<BulkActionResult>> {
  if (!actorCanGalleryEdit(actor)) {
    return deny('Viewers cannot submit assets for review.');
  }
  try {
    if (isMemoryBackend()) {
      return {
        ok: true,
        data: { ok: true, affected: assetExternalIds.length },
      };
    }
    const n = await dbSubmitForReview(actor, assetExternalIds, workspaceId);
    return { ok: true, data: { ok: true, affected: n } };
  } catch (err) {
    return pgError(err);
  }
}

export async function reviewGalleryAsset(
  actor: MediaTrustedActor,
  assetExternalId: string,
  decision: 'approve' | 'reject' | 'in_review',
  notes = '',
): Promise<Result<GalleryAsset>> {
  if (!actorCanGalleryReview(actor)) {
    return deny('Viewers and editors cannot review assets.');
  }
  const decisionCheck = validateReviewDecision(decision);
  if (!decisionCheck.ok) return deny(decisionCheck.error, 400);
  try {
    if (isMemoryBackend()) {
      const asset = memoryGetAsset(assetExternalId);
      if (!asset) return deny('Asset not found.', 404);
      return {
        ok: true,
        data: {
          ...asset,
          reviewStatus:
            decision === 'approve'
              ? 'approved'
              : decision === 'reject'
                ? 'rejected'
                : 'in_review',
          updatedAt: new Date().toISOString(),
        },
      };
    }
    const asset = await dbReviewGalleryAsset(
      actor,
      assetExternalId,
      decision,
      notes,
    );
    return { ok: true, data: asset };
  } catch (err) {
    return pgError(err);
  }
}

// ── Activity ──────────────────────────────────────────────────────────────────

export async function listGalleryActivity(
  actor: MediaTrustedActor,
  workspaceId = 'bcs-default',
  limit = 50,
): Promise<Result<GalleryEvent[]>> {
  if (!actorHasPermission(actor, 'read')) {
    return deny('Not authorized.');
  }
  try {
    if (isMemoryBackend()) {
      return { ok: true, data: memoryListEvents(workspaceId, limit) };
    }
    const events = await dbListGalleryEvents(actor, workspaceId, limit);
    return { ok: true, data: events };
  } catch (err) {
    return pgError(err);
  }
}

// ── Ensure membership ─────────────────────────────────────────────────────────

export async function ensureGalleryMembership(
  actor: MediaTrustedActor,
  workspaceId = 'bcs-default',
): Promise<Result<void>> {
  if (!actorHasPermission(actor, 'read')) {
    return deny('Not authorized.');
  }
  try {
    if (!isMemoryBackend()) {
      await dbGalleryEnsureMembership(actor, workspaceId);
    }
    return { ok: true, data: undefined };
  } catch (err) {
    return pgError(err);
  }
}

// ── Re-export canPreparePublicationForAsset ───────────────────────────────────

export { canPreparePublicationForAsset };
