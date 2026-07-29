/**
 * Phase 2A unit tests — inventory, privacy, BA protocol, publish gates.
 */

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ARCHIVE_RULES,
  autoDetectBeforeAfterPairs,
  canApproveBeforeAfterPair,
  canMarkPublished,
  defaultPrivacyStatus,
  emptyMatchCriteria,
  filterInventoryAssets,
  manifestContentFingerprint,
  mergeManifestWithReview,
  publishAsset,
  scanMediaArchive,
  upsertReviewOverride,
  emptyReviewState,
} from '@/lib/media-pipeline';
import type { MediaAssetRecord } from '@/lib/media-pipeline/types';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

async function makeTempArchive(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bcs-media-2a-'));
  tempDirs.push(root);
  const pictures = path.join(root, 'data', 'pictures', 'demo-boat');
  await fs.mkdir(pictures, { recursive: true });

  // Acceptable resolution
  await sharp({
    create: {
      width: 1200,
      height: 900,
      channels: 3,
      background: { r: 20, g: 40, b: 80 },
    },
  })
    .jpeg()
    .toFile(path.join(pictures, 'ok.jpg'));

  // Low resolution
  await sharp({
    create: {
      width: 640,
      height: 480,
      channels: 3,
      background: { r: 80, g: 80, b: 80 },
    },
  })
    .jpeg()
    .toFile(path.join(pictures, 'low.jpg'));

  // Exact duplicate of ok.jpg
  await fs.copyFile(
    path.join(pictures, 'ok.jpg'),
    path.join(pictures, 'ok-copy.jpg'),
  );

  // Unsupported extension marker (skip non-ext in discover — use .txt)
  await fs.writeFile(path.join(pictures, 'notes.txt'), 'not an image');

  // Unsupported but discovered extension
  await fs.writeFile(
    path.join(pictures, 'raw.tiff'),
    Buffer.from([0, 1, 2, 3]),
  );

  return root;
}

describe('media pipeline phase 2a inventory', () => {
  it('recursively discovers images and skips non-image extensions without ext match', async () => {
    const root = await makeTempArchive();
    const manifest = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(manifest.assetCount).toBe(4); // ok, low, ok-copy, raw.tiff
    expect(manifest.projects).toHaveLength(1);
    expect(manifest.projects[0]?.slug).toBe('demo-boat');
    expect(manifest.unsupportedCount).toBe(1);
    expect(
      manifest.assets.every((a) => a.archivePath.startsWith('data/pictures/')),
    ).toBe(true);
  });

  it('computes sha-256 checksums and flags exact duplicates without deleting', async () => {
    const root = await makeTempArchive();
    const before = await fs.readdir(path.join(root, 'data/pictures/demo-boat'));
    const manifest = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    const after = await fs.readdir(path.join(root, 'data/pictures/demo-boat'));
    expect(after.sort()).toEqual(before.sort());
    expect(manifest.duplicateGroupCount).toBe(1);
    const dups = manifest.assets.filter((a) => a.flags.exactDuplicate);
    expect(dups.length).toBe(2);
    expect(dups[0]?.checksum).toBe(dups[1]?.checksum);
    expect(ARCHIVE_RULES.neverAutoDelete).toBe(true);
  });

  it('flags low-resolution images', async () => {
    const root = await makeTempArchive();
    const manifest = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    const low = manifest.assets.find((a) => a.originalFilename === 'low.jpg');
    expect(low?.flags.lowResolution).toBe(true);
    expect(low?.qualityStatus).toBe('low-resolution');
    expect(manifest.lowResolutionCount).toBeGreaterThanOrEqual(1);
  });

  it('produces a deterministic content fingerprint across runs', async () => {
    const root = await makeTempArchive();
    const a = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    const b = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2099-01-01T00:00:00.000Z',
      generatedAt: '2099-01-01T00:00:00.000Z',
    });
    expect(manifestContentFingerprint(a)).toBe(manifestContentFingerprint(b));
    expect(a.assets.map((x) => x.id)).toEqual(b.assets.map((x) => x.id));
  });

  it('defaults privacy to unchecked (unless GPS EXIF heuristic fires)', async () => {
    expect(defaultPrivacyStatus()).toBe('unchecked');
    const root = await makeTempArchive();
    const manifest = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    for (const asset of manifest.assets.filter((a) => !a.flags.hasGpsExif)) {
      expect(asset.privacyStatus).toBe('unchecked');
    }
  });

  it('blocks marking publish when privacy is unchecked', () => {
    expect(canMarkPublished('unchecked', 'published').ok).toBe(false);
    expect(canMarkPublished('blocked', 'published').ok).toBe(false);
    expect(canMarkPublished('clear', 'published').ok).toBe(true);
    expect(canMarkPublished('unchecked', 'candidate').ok).toBe(true);
  });

  it('never auto-detects before/after pairs from filenames', async () => {
    const root = await makeTempArchive();
    await sharp({
      create: {
        width: 1000,
        height: 800,
        channels: 3,
        background: { r: 1, g: 2, b: 3 },
      },
    })
      .jpeg()
      .toFile(path.join(root, 'data/pictures/demo-boat', 'before.jpg'));
    await sharp({
      create: {
        width: 1000,
        height: 800,
        channels: 3,
        background: { r: 4, g: 5, b: 6 },
      },
    })
      .jpeg()
      .toFile(path.join(root, 'data/pictures/demo-boat', 'after.jpg'));
    const manifest = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(autoDetectBeforeAfterPairs(manifest.assets)).toEqual([]);
  });

  it('requires explicit BA criteria approval', () => {
    const before = {
      id: 'a',
      projectSlug: 'demo',
      privacyStatus: 'clear',
    } as MediaAssetRecord;
    const after = {
      id: 'b',
      projectSlug: 'demo',
      privacyStatus: 'clear',
    } as MediaAssetRecord;
    const pair = {
      id: 'pair1',
      beforeAssetId: 'a',
      afterAssetId: 'b',
      projectSlug: 'demo',
      criteria: emptyMatchCriteria(),
      approved: false,
      approvedAt: null,
      approvedBy: null,
      notes: null,
    };
    expect(canApproveBeforeAfterPair({ pair, before, after }).ok).toBe(false);
  });

  it('defers publishAsset and rejects unchecked privacy', async () => {
    const asset = {
      id: 'x',
      archivePath: 'data/pictures/demo/x.jpg',
      privacyStatus: 'unchecked',
      altText: null,
      originalFilename: 'x.jpg',
      projectSlug: 'demo',
    } as MediaAssetRecord;
    const blocked = await publishAsset(asset);
    expect(blocked.ok).toBe(false);
    const cleared = await publishAsset({
      ...asset,
      privacyStatus: 'clear',
    });
    expect(cleared.ok).toBe(false);
    expect('deferred' in cleared && cleared.deferred).toBe(true);
  });

  it('upsertReviewOverride rejects published + unchecked privacy', () => {
    const state = emptyReviewState('2026-01-01T00:00:00.000Z');
    expect(() =>
      upsertReviewOverride(state, {
        assetId: 'x',
        privacyStatus: 'unchecked',
        publishStatus: 'published',
        updatedAt: '2026-01-01T00:00:00.000Z',
        updatedBy: 'test',
      }),
    ).toThrow(/unchecked/);
  });

  it('filters inventory assets', () => {
    const assets = [
      {
        id: '1',
        projectSlug: 'a',
        division: 'marine',
        stage: 'masking',
        status: 'imported',
        privacyStatus: 'unchecked',
        publishStatus: 'not-published',
        qualityStatus: 'unchecked',
        originalFilename: 'one.jpg',
        archivePath: 'data/pictures/a/one.jpg',
        sourceAlbum: 'a',
        altText: null,
        notes: null,
      },
      {
        id: '2',
        projectSlug: 'b',
        division: 'aviation',
        stage: 'completed',
        status: 'approved',
        privacyStatus: 'clear',
        publishStatus: 'candidate',
        qualityStatus: 'acceptable',
        originalFilename: 'two.jpg',
        archivePath: 'data/pictures/b/two.jpg',
        sourceAlbum: 'b',
        altText: null,
        notes: null,
      },
    ] as MediaAssetRecord[];
    expect(filterInventoryAssets(assets, { projectSlug: 'a' })).toHaveLength(1);
    expect(
      filterInventoryAssets(assets, { privacyStatus: 'clear' }),
    ).toHaveLength(1);
  });

  it('mergeManifestWithReview leaves assets unchanged when no overrides', async () => {
    const root = await makeTempArchive();
    const manifest = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    const merged = mergeManifestWithReview(manifest, emptyReviewState());
    expect(merged.map((a) => a.id)).toEqual(manifest.assets.map((a) => a.id));
  });

  it('checksum is stable sha-256 hex', async () => {
    const root = await makeTempArchive();
    const file = path.join(root, 'data/pictures/demo-boat/ok.jpg');
    const bytes = await fs.readFile(file);
    const expected = createHash('sha256').update(bytes).digest('hex');
    const manifest = await scanMediaArchive({
      repoRoot: root,
      importedAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });
    const asset = manifest.assets.find((a) => a.originalFilename === 'ok.jpg');
    expect(asset?.checksum).toBe(expected);
    expect(asset?.id).toBe(`pic_${expected.slice(0, 16)}`);
  });
});
