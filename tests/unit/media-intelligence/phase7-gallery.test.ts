/**
 * Phase 7 — Visual DAMS Gallery unit tests (memory backend).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetGalleryStoreForTests,
  memoryRegisterAsset,
  listGalleryAssets,
  getGalleryAsset,
  updateGalleryMetadata,
  setGalleryFavorite,
  listGalleryCollections,
  createGalleryCollection,
  galleryCollectionSetAssets,
  archiveGalleryAssets,
  submitGalleryAssetsForReview,
  reviewGalleryAsset,
  listGalleryActivity,
  actorCanGalleryEdit,
  actorCanGalleryReview,
  actorCanUpload,
  actorIsViewer,
  validateGalleryMimeType,
  validateGalleryFileSize,
  validateCollectionName,
  canPreparePublicationForAsset,
  isPrivacyBlocked,
  GALLERY_MAX_FILE_SIZE_BYTES,
  isMemoryGalleryRepositoryEnabled,
  PHASE7_GALLERY_RPC_CATALOG,
} from '@/lib/media-intelligence/gallery';
import type { GalleryAsset } from '@/lib/media-intelligence/gallery/types';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';

vi.stubEnv('MEDIA_GALLERY_REPOSITORY', 'memory');

// ── Actors ────────────────────────────────────────────────────────────────────

const owner: MediaTrustedActor = {
  id: 'owner-1',
  role: 'owner',
  roles: ['owner'],
  source: 'temporary-media-session',
};

const editor: MediaTrustedActor = {
  id: 'editor-1',
  role: 'editor',
  roles: ['editor'],
  source: 'temporary-media-session',
};

const reviewer: MediaTrustedActor = {
  id: 'reviewer-1',
  role: 'reviewer',
  roles: ['reviewer'],
  source: 'temporary-media-session',
};

const viewer: MediaTrustedActor = {
  id: 'viewer-1',
  role: 'viewer',
  roles: ['viewer'],
  source: 'temporary-media-session',
};

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeAsset(overrides: Partial<GalleryAsset> = {}): GalleryAsset {
  const id = `asset-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    externalId: id,
    workspaceId: 'bcs-default',
    filename: 'test.jpg',
    originalFilename: 'test.jpg',
    fileType: 'image/jpeg',
    mediaKind: 'image',
    checksum: `sha256-${id}`,
    fileSizeBytes: 500_000,
    privacyStatus: 'clear',
    reviewStatus: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function seedAsset(overrides: Partial<GalleryAsset> = {}): GalleryAsset {
  const asset = makeAsset(overrides);
  return memoryRegisterAsset(asset);
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetGalleryStoreForTests();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Phase 7 — runtime', () => {
  it('memory backend is enabled in test environment', () => {
    expect(isMemoryGalleryRepositoryEnabled()).toBe(true);
  });

  it('RPC catalog has all expected entries', () => {
    expect(PHASE7_GALLERY_RPC_CATALOG).toContain(
      'media_gallery_register_asset',
    );
    expect(PHASE7_GALLERY_RPC_CATALOG).toContain('media_gallery_set_favorite');
    expect(PHASE7_GALLERY_RPC_CATALOG).toContain(
      'media_gallery_create_collection',
    );
    expect(PHASE7_GALLERY_RPC_CATALOG).toContain(
      'media_gallery_archive_assets',
    );
    expect(PHASE7_GALLERY_RPC_CATALOG.length).toBeGreaterThanOrEqual(10);
  });
});

describe('Phase 7 — permissions', () => {
  it('owner has gallery edit and review', () => {
    expect(actorCanGalleryEdit(owner)).toBe(true);
    expect(actorCanGalleryReview(owner)).toBe(true);
    expect(actorCanUpload(owner)).toBe(true);
    expect(actorIsViewer(owner)).toBe(false);
  });

  it('editor has gallery edit but not review', () => {
    expect(actorCanGalleryEdit(editor)).toBe(true);
    expect(actorCanGalleryReview(editor)).toBe(false);
    expect(actorCanUpload(editor)).toBe(true);
    expect(actorIsViewer(editor)).toBe(false);
  });

  it('reviewer has review but not edit', () => {
    expect(actorCanGalleryEdit(reviewer)).toBe(false);
    expect(actorCanGalleryReview(reviewer)).toBe(true);
    expect(actorIsViewer(reviewer)).toBe(false);
  });

  it('viewer has neither edit nor review', () => {
    expect(actorCanGalleryEdit(viewer)).toBe(false);
    expect(actorCanGalleryReview(viewer)).toBe(false);
    expect(actorIsViewer(viewer)).toBe(true);
  });
});

describe('Phase 7 — validation', () => {
  it('accepts allowed image mime types', () => {
    for (const mime of [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ]) {
      expect(validateGalleryMimeType(mime).ok).toBe(true);
    }
  });

  it('accepts allowed video mime types', () => {
    expect(validateGalleryMimeType('video/mp4').ok).toBe(true);
    expect(validateGalleryMimeType('video/quicktime').ok).toBe(true);
  });

  it('rejects unsupported mime types', () => {
    expect(validateGalleryMimeType('application/pdf').ok).toBe(false);
    expect(validateGalleryMimeType('text/plain').ok).toBe(false);
    expect(validateGalleryMimeType('image/svg+xml').ok).toBe(false);
  });

  it('accepts valid file sizes', () => {
    expect(validateGalleryFileSize(1024).ok).toBe(true);
    expect(validateGalleryFileSize(GALLERY_MAX_FILE_SIZE_BYTES - 1).ok).toBe(
      true,
    );
  });

  it('rejects zero or over-limit file sizes', () => {
    expect(validateGalleryFileSize(0).ok).toBe(false);
    expect(validateGalleryFileSize(-1).ok).toBe(false);
    expect(validateGalleryFileSize(GALLERY_MAX_FILE_SIZE_BYTES + 1).ok).toBe(
      false,
    );
  });

  it('validates collection names', () => {
    expect(validateCollectionName('My Collection').ok).toBe(true);
    expect(validateCollectionName('').ok).toBe(false);
    expect(validateCollectionName(' ').ok).toBe(false);
    expect(validateCollectionName('a'.repeat(161)).ok).toBe(false);
  });

  it('canPreparePublicationForAsset rejects privacy-blocked assets', () => {
    const blocked = makeAsset({ privacyStatus: 'blocked' });
    expect(canPreparePublicationForAsset(blocked)).toBe(false);
    expect(isPrivacyBlocked(blocked)).toBe(true);

    const flagged = makeAsset({ privacyStatus: 'flagged' });
    expect(canPreparePublicationForAsset(flagged)).toBe(false);

    const clear = makeAsset({ privacyStatus: 'clear' });
    expect(canPreparePublicationForAsset(clear)).toBe(true);
  });

  it('canPreparePublicationForAsset rejects archived assets', () => {
    const archived = makeAsset({ archivedAt: new Date().toISOString() });
    expect(canPreparePublicationForAsset(archived)).toBe(false);
  });
});

describe('Phase 7 — list assets', () => {
  it('returns empty list when no assets', async () => {
    const result = await listGalleryAssets(owner);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.assets).toHaveLength(0);
    expect(result.data.total).toBe(0);
  });

  it('lists assets for owner', async () => {
    seedAsset();
    seedAsset();
    const result = await listGalleryAssets(owner);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(2);
  });

  it('viewer can list assets (read-only)', async () => {
    seedAsset();
    const result = await listGalleryAssets(viewer);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(1);
  });

  it('filters by kind', async () => {
    seedAsset({ mediaKind: 'image' });
    seedAsset({ mediaKind: 'video' });
    const result = await listGalleryAssets(owner, { kind: 'image' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(1);
  });

  it('filters by privacy status', async () => {
    seedAsset({ privacyStatus: 'clear' });
    seedAsset({ privacyStatus: 'blocked' });
    const result = await listGalleryAssets(owner, { privacy: 'blocked' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(1);
  });

  it('full-text search across title and filename', async () => {
    seedAsset({ displayTitle: 'Boat hull repair' });
    seedAsset({ originalFilename: 'gelcoat_fix.jpg' });
    seedAsset({ displayTitle: 'Unrelated' });

    const result = await listGalleryAssets(owner, { q: 'gelcoat' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(1);
  });

  it('excludes archived by default', async () => {
    seedAsset();
    seedAsset({ archivedAt: new Date().toISOString() });
    const result = await listGalleryAssets(owner);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(1);
  });

  it('includes archived when requested', async () => {
    seedAsset();
    seedAsset({ archivedAt: new Date().toISOString() });
    const result = await listGalleryAssets(owner, { archived: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(2);
  });

  it('paginates results', async () => {
    for (let i = 0; i < 10; i++) seedAsset();
    const result = await listGalleryAssets(owner, { pageSize: 3, page: 1 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.assets).toHaveLength(3);
    expect(result.data.total).toBe(10);
    expect(result.data.pageCount).toBe(4);
  });
});

describe('Phase 7 — get single asset', () => {
  it('returns asset by externalId', async () => {
    const seeded = seedAsset({ displayTitle: 'My Asset' });
    const result = await getGalleryAsset(owner, seeded.externalId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.displayTitle).toBe('My Asset');
  });

  it('returns 404 for missing asset', async () => {
    const result = await getGalleryAsset(owner, 'nonexistent');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe('Phase 7 — metadata', () => {
  it('owner can update metadata', async () => {
    const seeded = seedAsset();
    const result = await updateGalleryMetadata(owner, seeded.externalId, {
      displayTitle: 'Updated Title',
      description: 'Updated description',
      location: 'Miami, FL',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.displayTitle).toBe('Updated Title');
  });

  it('editor can update metadata', async () => {
    const seeded = seedAsset();
    const result = await updateGalleryMetadata(editor, seeded.externalId, {
      displayTitle: 'Editor title',
    });
    expect(result.ok).toBe(true);
  });

  it('viewer cannot update metadata', async () => {
    const seeded = seedAsset();
    const result = await updateGalleryMetadata(viewer, seeded.externalId, {
      displayTitle: 'Viewer title',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);
  });
});

describe('Phase 7 — favorites', () => {
  it('owner can favorite and unfavorite an asset', async () => {
    const seeded = seedAsset();

    const fav = await setGalleryFavorite(owner, seeded.externalId, true);
    expect(fav.ok).toBe(true);

    const unfav = await setGalleryFavorite(owner, seeded.externalId, false);
    expect(unfav.ok).toBe(true);
  });

  it('viewer can favorite (read permission suffices)', async () => {
    const seeded = seedAsset();
    const result = await setGalleryFavorite(viewer, seeded.externalId, true);
    expect(result.ok).toBe(true);
  });

  it('favorites filter shows only favorited assets', async () => {
    const a1 = seedAsset();
    const _a2 = seedAsset();
    await setGalleryFavorite(owner, a1.externalId, true);

    const result = await listGalleryAssets(owner, { onlyFavorites: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.total).toBe(1);
    expect(result.data.assets[0]?.externalId).toBe(a1.externalId);
  });
});

describe('Phase 7 — collections', () => {
  it('owner can create a collection', async () => {
    const result = await createGalleryCollection(
      owner,
      'bcs-default',
      'My Collection',
      'A test collection',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe('My Collection');
  });

  it('viewer cannot create a collection', async () => {
    const result = await createGalleryCollection(
      viewer,
      'bcs-default',
      'Viewer Collection',
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);
  });

  it('rejects empty collection name', async () => {
    const result = await createGalleryCollection(owner, 'bcs-default', '');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it('lists collections', async () => {
    await createGalleryCollection(owner, 'bcs-default', 'Col A');
    await createGalleryCollection(owner, 'bcs-default', 'Col B');
    const result = await listGalleryCollections(owner);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.length).toBe(2);
  });

  it('can add and remove assets from a collection', async () => {
    const asset = seedAsset();
    const colResult = await createGalleryCollection(
      owner,
      'bcs-default',
      'Test Col',
    );
    expect(colResult.ok).toBe(true);
    if (!colResult.ok) return;
    const collectionId = colResult.data.id;

    const addResult = await galleryCollectionSetAssets(
      owner,
      collectionId,
      [asset.externalId],
      'add',
    );
    expect(addResult.ok).toBe(true);
    if (!addResult.ok) return;
    expect(addResult.data).toBe(1);

    const listResult = await listGalleryAssets(owner, { collectionId });
    expect(listResult.ok).toBe(true);
    if (!listResult.ok) return;
    expect(listResult.data.total).toBe(1);

    const removeResult = await galleryCollectionSetAssets(
      owner,
      collectionId,
      [asset.externalId],
      'remove',
    );
    expect(removeResult.ok).toBe(true);
    if (!removeResult.ok) return;
    expect(removeResult.data).toBe(1);
  });
});

describe('Phase 7 — bulk actions', () => {
  it('owner can archive assets', async () => {
    const a1 = seedAsset();
    const _a2 = seedAsset();
    const result = await archiveGalleryAssets(owner, [a1.externalId]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.affected).toBe(1);

    const listResult = await listGalleryAssets(owner);
    expect(listResult.ok).toBe(true);
    if (!listResult.ok) return;
    expect(listResult.data.total).toBe(1);
    expect(listResult.data.assets[0]?.externalId).toBe(_a2.externalId);
  });

  it('viewer cannot archive assets', async () => {
    const asset = seedAsset();
    const result = await archiveGalleryAssets(viewer, [asset.externalId]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);
  });

  it('owner can submit assets for review', async () => {
    const asset = seedAsset();
    const result = await submitGalleryAssetsForReview(owner, [
      asset.externalId,
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.affected).toBeGreaterThanOrEqual(1);
  });
});

describe('Phase 7 — review', () => {
  it('reviewer can approve an asset', async () => {
    const asset = seedAsset({ reviewStatus: 'pending' });
    const result = await reviewGalleryAsset(
      reviewer,
      asset.externalId,
      'approve',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.reviewStatus).toBe('approved');
  });

  it('reviewer can reject an asset', async () => {
    const asset = seedAsset({ reviewStatus: 'pending' });
    const result = await reviewGalleryAsset(
      reviewer,
      asset.externalId,
      'reject',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.reviewStatus).toBe('rejected');
  });

  it('editor cannot review assets', async () => {
    const asset = seedAsset({ reviewStatus: 'pending' });
    const result = await reviewGalleryAsset(
      editor,
      asset.externalId,
      'approve',
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);
  });

  it('viewer cannot review assets', async () => {
    const asset = seedAsset({ reviewStatus: 'pending' });
    const result = await reviewGalleryAsset(
      viewer,
      asset.externalId,
      'approve',
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);
  });
});

describe('Phase 7 — activity', () => {
  it('returns empty activity initially', async () => {
    const result = await listGalleryActivity(owner);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(0);
  });

  it('records activity after favorite operations', async () => {
    const asset = seedAsset();
    await setGalleryFavorite(owner, asset.externalId, true);
    await setGalleryFavorite(owner, asset.externalId, false);

    const result = await listGalleryActivity(owner);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    const actions = result.data.map((e) => e.action);
    expect(actions).toContain('favorite_added');
    expect(actions).toContain('favorite_removed');
  });
});
