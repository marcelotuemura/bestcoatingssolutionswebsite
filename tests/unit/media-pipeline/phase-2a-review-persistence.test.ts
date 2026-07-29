/**
 * Phase 2A review persistence hardening tests.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import {
  __resetInventoryReviewRepositoryForTests,
  assertInventoryReviewBusinessRules,
  canMarkPublished,
  clearMemoryInventoryReviewsForTests,
  FileReviewRepository,
  getInventoryReviewRepository,
  loadReviewState,
  mergeManifestWithReview,
  MemoryReviewRepository,
  parseInventoryReviewFormData,
  persistReviewOverride,
  resolveInventoryReviewRepositoryMode,
} from '@/lib/media-pipeline';
import type {
  MediaAssetRecord,
  MediaManifest,
} from '@/lib/media-pipeline/types';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function actor(
  role: MediaTrustedActor['role'],
  roles?: MediaTrustedActor['roles'],
): MediaTrustedActor {
  return {
    id: `${role}-actor`,
    role,
    roles: roles ?? [role],
    source: 'temporary-media-session',
  };
}

function sampleAsset(id = 'pic_abc'): MediaAssetRecord {
  return {
    id,
    projectSlug: 'demo',
    division: 'unknown',
    originalFilename: 'demo.jpg',
    archivePath: 'data/pictures/demo/demo.jpg',
    publishedPath: null,
    mimeType: 'image/jpeg',
    width: 1200,
    height: 900,
    fileSizeBytes: 1000,
    orientation: 'landscape',
    checksum: 'a'.repeat(64),
    perceptualHash: null,
    importedAt: '2026-01-01T00:00:00.000Z',
    capturedAt: null,
    status: 'imported',
    stage: 'unknown',
    category: 'unknown',
    manufacturer: null,
    vesselModel: null,
    year: null,
    photographer: null,
    privacyStatus: 'unchecked',
    qualityStatus: 'unchecked',
    publishStatus: 'not-published',
    featured: false,
    heroCandidate: false,
    altText: null,
    caption: null,
    notes: null,
    sourceAlbum: 'demo',
    derivatives: [],
    approval: {
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
    },
    privacyChecklist: {
      visibleFace: false,
      vesselRegistration: false,
      hin: false,
      licensePlate: false,
      customerDocument: false,
      invoice: false,
      address: false,
      gpsMetadata: false,
      otherPrivateInformation: false,
      reviewedAt: null,
      reviewedBy: null,
    },
    flags: {
      lowResolution: false,
      exactDuplicate: false,
      unsupportedFormat: false,
      hasGpsExif: false,
      hasExif: false,
      duplicateOfIds: [],
    },
  };
}

afterEach(() => {
  clearMemoryInventoryReviewsForTests();
  __resetInventoryReviewRepositoryForTests();
  vi.unstubAllEnvs();
  vi.stubEnv('MEDIA_INVENTORY_REVIEW_REPOSITORY', 'memory');
  vi.stubEnv('MEDIA_PUBLICATION_REPOSITORY', 'memory');
});

describe('inventory review authorization matrix', () => {
  it('allows reviewer with review_privacy and editor with edit_metadata', () => {
    expect(actorHasPermission(actor('reviewer'), 'review_privacy')).toBe(true);
    expect(actorHasPermission(actor('viewer'), 'review_privacy')).toBe(false);
    expect(actorHasPermission(actor('editor'), 'edit_metadata')).toBe(true);
    expect(actorHasPermission(actor('viewer'), 'edit_metadata')).toBe(false);
  });
});

describe('inventory review validation', () => {
  it('rejects invalid enum values from FormData', () => {
    const fd = new FormData();
    fd.set('assetId', 'pic_abc');
    fd.set('division', 'submarine');
    fd.set('stage', 'unknown');
    fd.set('category', 'unknown');
    fd.set('status', 'imported');
    fd.set('privacyStatus', 'unchecked');
    fd.set('qualityStatus', 'unchecked');
    fd.set('publishStatus', 'not-published');
    const parsed = parseInventoryReviewFormData(
      fd,
      sampleAsset(),
      '2026-01-01T00:00:00.000Z',
      'tester',
    );
    expect(parsed.ok).toBe(false);
  });

  it('rejects privacy clear without manual review metadata', () => {
    const rules = assertInventoryReviewBusinessRules({
      existingAssetId: 'pic_abc',
      data: {
        assetId: 'pic_abc',
        division: 'marine',
        stage: 'completed',
        category: 'result',
        status: 'approved',
        privacyStatus: 'clear',
        qualityStatus: 'acceptable',
        publishStatus: 'candidate',
        featured: false,
        heroCandidate: false,
        altText: null,
        caption: null,
        notes: null,
        privacyChecklist: {
          visibleFace: false,
          vesselRegistration: false,
          hin: false,
          licensePlate: false,
          customerDocument: false,
          invoice: false,
          address: false,
          gpsMetadata: false,
          otherPrivateInformation: false,
          reviewedAt: null,
          reviewedBy: null,
        },
        privacyReviewedNow: false,
      },
    });
    expect(rules.ok).toBe(false);
    if (!rules.ok) expect(rules.error).toMatch(/reviewedAt/i);
  });

  it('enforces publish gate for unchecked privacy', () => {
    expect(canMarkPublished('unchecked', 'published').ok).toBe(false);
    expect(canMarkPublished('clear', 'published').ok).toBe(true);
  });
});

describe('memory review repository', () => {
  it('upserts one row per asset and persists across repository instances', async () => {
    vi.stubEnv('MEDIA_INVENTORY_REVIEW_REPOSITORY', 'memory');
    __resetInventoryReviewRepositoryForTests();
    const a = actor('reviewer');
    await persistReviewOverride(
      {
        assetId: 'pic_1',
        projectSlug: 'demo',
        privacyStatus: 'unchecked',
        publishStatus: 'not-published',
        updatedAt: '2026-01-01T00:00:00.000Z',
        updatedBy: a.id,
      },
      a,
    );
    await persistReviewOverride(
      {
        assetId: 'pic_1',
        projectSlug: 'demo',
        privacyStatus: 'review-required',
        publishStatus: 'not-published',
        notes: 'updated',
        updatedAt: '2026-01-02T00:00:00.000Z',
        updatedBy: a.id,
      },
      a,
    );
    __resetInventoryReviewRepositoryForTests();
    const again = getInventoryReviewRepository();
    expect(again).toBeInstanceOf(MemoryReviewRepository);
    const listed = await again.listReviews();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.notes).toBe('updated');
    expect(listed[0]?.privacyStatus).toBe('review-required');

    const state = await loadReviewState(a);
    const manifest = {
      version: 1,
      generatedAt: '2026-01-01T00:00:00.000Z',
      archiveRoot: 'data/pictures',
      assetCount: 1,
      projectCount: 1,
      duplicateGroupCount: 0,
      lowResolutionCount: 0,
      unsupportedCount: 0,
      gpsExifCount: 0,
      projects: [
        { slug: 'demo', assetCount: 1, archivePath: 'data/pictures/demo' },
      ],
      assets: [sampleAsset('pic_1')],
    } satisfies MediaManifest;
    const merged = mergeManifestWithReview(manifest, state);
    expect(merged[0]?.privacyStatus).toBe('review-required');
    expect(merged[0]?.notes).toBe('updated');
  });
});

describe('review repository mode safety', () => {
  it('forbids file mode in production-like environments', () => {
    vi.stubEnv('MEDIA_INVENTORY_REVIEW_REPOSITORY', 'file');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(() => resolveInventoryReviewRepositoryMode()).toThrow(/forbidden/i);
  });

  it('production never writes repository JSON via FileReviewRepository', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcs-rev-'));
    const repo = new FileReviewRepository(dir, 'data/media-review-state.json');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    await expect(
      repo.upsertReview(
        {
          assetId: 'x',
          projectSlug: 'demo',
          updatedAt: '2026-01-01T00:00:00.000Z',
          updatedBy: 't',
        },
        actor('owner'),
      ),
    ).rejects.toThrow(/cannot persist/i);
  });

  it('defaults to memory under vitest when DB is unset', () => {
    vi.stubEnv('MEDIA_INVENTORY_REVIEW_REPOSITORY', '');
    vi.stubEnv('MEDIA_PUBLICATION_DATABASE_URL', '');
    vi.stubEnv('SUPABASE_DB_URL', '');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VITEST', 'true');
    expect(resolveInventoryReviewRepositoryMode()).toBe('memory');
  });
});

describe('unknown asset rejection helper', () => {
  it('parse keeps asset id and business rules detect mismatch', () => {
    const fd = new FormData();
    fd.set('assetId', 'pic_other');
    fd.set('division', 'unknown');
    fd.set('stage', 'unknown');
    fd.set('category', 'unknown');
    fd.set('status', 'imported');
    fd.set('privacyStatus', 'unchecked');
    fd.set('qualityStatus', 'unchecked');
    fd.set('publishStatus', 'not-published');
    const parsed = parseInventoryReviewFormData(
      fd,
      sampleAsset('pic_abc'),
      '2026-01-01T00:00:00.000Z',
      'tester',
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const rules = assertInventoryReviewBusinessRules({
      data: parsed.data,
      existingAssetId: 'pic_abc',
    });
    expect(rules.ok).toBe(false);
  });
});
