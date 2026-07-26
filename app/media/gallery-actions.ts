'use server';

import { requireMediaPermission } from '@/lib/media-intelligence/auth/guards';
import {
  listGalleryAssets,
  getGalleryAsset,
  updateGalleryMetadata,
  setGalleryFavorite,
  listGalleryCollections,
  createGalleryCollection,
  updateGalleryCollection,
  galleryCollectionSetAssets,
  archiveGalleryAssets,
  submitGalleryAssetsForReview,
  reviewGalleryAsset,
  listGalleryActivity,
  ensureGalleryMembership,
} from '@/lib/media-intelligence/gallery';
import type {
  GalleryAsset,
  GalleryCollection,
  GalleryEvent,
  GalleryListParams,
  GalleryListResult,
  GalleryMetadataInput,
} from '@/lib/media-intelligence/gallery';

type ActionOk = { ok: true; error?: never };
type ActionFail = { ok: false; error: string };

// ── List assets ───────────────────────────────────────────────────────────────

export async function listGalleryAssetsAction(
  params: Partial<GalleryListParams> = {},
): Promise<{ ok: boolean; error?: string; data?: GalleryListResult }> {
  const session = await requireMediaPermission('read');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await listGalleryAssets(session.actor, params);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}

// ── Get single asset ──────────────────────────────────────────────────────────

export async function getGalleryAssetAction(
  externalId: string,
): Promise<{ ok: boolean; error?: string; asset?: GalleryAsset }> {
  const session = await requireMediaPermission('read');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await getGalleryAsset(session.actor, externalId);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, asset: result.data };
}

// ── Update metadata ───────────────────────────────────────────────────────────

export async function updateGalleryMetadataAction(input: {
  externalId: string;
  metadata: GalleryMetadataInput;
}): Promise<ActionOk | ActionFail> {
  const session = await requireMediaPermission('edit_metadata');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await updateGalleryMetadata(
    session.actor,
    input.externalId,
    input.metadata,
  );
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export async function setGalleryFavoriteAction(input: {
  assetExternalId: string;
  favorite: boolean;
  workspaceId?: string;
}): Promise<ActionOk | ActionFail> {
  const session = await requireMediaPermission('read');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await setGalleryFavorite(
    session.actor,
    input.assetExternalId,
    input.favorite,
    input.workspaceId,
  );
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// ── Collections ───────────────────────────────────────────────────────────────

export async function listGalleryCollectionsAction(
  workspaceId?: string,
): Promise<{ ok: boolean; error?: string; collections?: GalleryCollection[] }> {
  const session = await requireMediaPermission('read');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await listGalleryCollections(session.actor, workspaceId);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, collections: result.data };
}

export async function createGalleryCollectionAction(input: {
  workspaceId: string;
  name: string;
  description?: string;
}): Promise<{ ok: boolean; error?: string; collectionId?: string }> {
  const session = await requireMediaPermission('edit_metadata');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await createGalleryCollection(
    session.actor,
    input.workspaceId,
    input.name,
    input.description,
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, collectionId: result.data.id };
}

export async function updateGalleryCollectionAction(input: {
  collectionId: string;
  name?: string;
  description?: string;
  coverAssetExternalId?: string;
  archive?: boolean;
}): Promise<ActionOk | ActionFail> {
  const session = await requireMediaPermission('edit_metadata');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await updateGalleryCollection(
    session.actor,
    input.collectionId,
    {
      name: input.name,
      description: input.description,
      coverAssetExternalId: input.coverAssetExternalId,
      archive: input.archive,
    },
  );
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function galleryCollectionSetAssetsAction(input: {
  collectionId: string;
  assetExternalIds: string[];
  mode: 'add' | 'remove';
  workspaceId?: string;
}): Promise<{ ok: boolean; error?: string; affected?: number }> {
  const session = await requireMediaPermission('edit_metadata');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await galleryCollectionSetAssets(
    session.actor,
    input.collectionId,
    input.assetExternalIds,
    input.mode,
    input.workspaceId,
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, affected: result.data };
}

// ── Bulk actions ──────────────────────────────────────────────────────────────

export async function archiveGalleryAssetsAction(input: {
  assetExternalIds: string[];
  workspaceId?: string;
}): Promise<{ ok: boolean; error?: string; affected?: number }> {
  const session = await requireMediaPermission('archive');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await archiveGalleryAssets(
    session.actor,
    input.assetExternalIds,
    input.workspaceId,
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, affected: result.data.affected };
}

export async function submitForReviewAction(input: {
  assetExternalIds: string[];
  workspaceId?: string;
}): Promise<{ ok: boolean; error?: string; affected?: number }> {
  const session = await requireMediaPermission('prepare_publish_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await submitGalleryAssetsForReview(
    session.actor,
    input.assetExternalIds,
    input.workspaceId,
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, affected: result.data.affected };
}

export async function reviewGalleryAssetAction(input: {
  assetExternalId: string;
  decision: 'approve' | 'reject' | 'in_review';
  notes?: string;
}): Promise<ActionOk | ActionFail> {
  const session = await requireMediaPermission('approve_workflow');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await reviewGalleryAsset(
    session.actor,
    input.assetExternalId,
    input.decision,
    input.notes,
  );
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// ── Activity ──────────────────────────────────────────────────────────────────

export async function listGalleryActivityAction(input?: {
  workspaceId?: string;
  limit?: number;
}): Promise<{ ok: boolean; error?: string; events?: GalleryEvent[] }> {
  const session = await requireMediaPermission('read');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await listGalleryActivity(
    session.actor,
    input?.workspaceId,
    input?.limit,
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, events: result.data };
}

// ── Ensure membership ─────────────────────────────────────────────────────────

export async function ensureGalleryMembershipAction(
  workspaceId?: string,
): Promise<ActionOk | ActionFail> {
  const session = await requireMediaPermission('read');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await ensureGalleryMembership(session.actor, workspaceId);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
