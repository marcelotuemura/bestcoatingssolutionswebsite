/**
 * Phase 7 durable storage policy + object key + upload outcome tests.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  assertGalleryStorageModeAllowed,
  resolveGalleryStorageMode,
  galleryStorageBucketForMode,
  buildGalleryOriginalObjectKey,
  buildGalleryThumbnailObjectKey,
  isWorkspaceScopedGalleryKey,
} from '@/lib/media-intelligence/gallery';

describe('gallery storage mode policy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to supabase (durable)', () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', '');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'development');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', '');
    const resolved = resolveGalleryStorageMode();
    expect(resolved.mode).toBe('supabase');
    expect(resolved.allowsLocalVault).toBe(false);
    expect(galleryStorageBucketForMode(resolved.mode)).toBe('media-originals');
  });

  it('allows local only with explicit opt-in outside production/staging', () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'local');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'development');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', '');
    const resolved = resolveGalleryStorageMode();
    expect(resolved.mode).toBe('local');
    expect(resolved.source).toBe('explicit');
    expect(galleryStorageBucketForMode(resolved.mode)).toBe('local-vault');
  });

  it('rejects local mode in production', () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'local');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'production');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => resolveGalleryStorageMode()).toThrow(
      /forbidden in production/i,
    );
  });

  it('rejects local mode in staging', () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'local');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'staging');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(() => resolveGalleryStorageMode()).toThrow(
      /forbidden in production\/staging/i,
    );
  });

  it('staging defaults to supabase required', () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', '');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'staging');
    const resolved = assertGalleryStorageModeAllowed();
    expect(resolved.mode).toBe('supabase');
    expect(resolved.durableRequired).toBe(true);
  });

  it('rejects invalid mode values', () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 's3');
    expect(() => resolveGalleryStorageMode()).toThrow(
      /Invalid MEDIA_GALLERY_STORAGE_MODE/,
    );
  });
});

describe('workspace-scoped gallery object keys', () => {
  it('builds originals under workspaces/{workspace}/originals/', () => {
    const key = buildGalleryOriginalObjectKey({
      workspaceId: 'bcs-default',
      checksum: 'abcdef0123456789ffff',
      filename: 'Hull Photo.JPG',
    });
    expect(key).toBe(
      'workspaces/bcs-default/originals/abcdef0123456789_Hull_Photo.jpg',
    );
    expect(isWorkspaceScopedGalleryKey(key, 'bcs-default')).toBe(true);
    expect(isWorkspaceScopedGalleryKey(key, 'other-ws')).toBe(false);
  });

  it('isolates thumbnail keys by workspace and asset id', () => {
    const key = buildGalleryThumbnailObjectKey({
      workspaceId: 'ws_a',
      assetExternalId: 'gallery_abc',
      sizePx: 400,
    });
    expect(key).toBe('workspaces/ws_a/thumbnails/400/gallery_abc.webp');
    expect(isWorkspaceScopedGalleryKey(key, 'ws_a')).toBe(true);
  });

  it('rejects unsafe workspace ids', () => {
    expect(() =>
      buildGalleryOriginalObjectKey({
        workspaceId: '../escape',
        checksum: 'abcdef0123456789ffff',
        filename: 'a.jpg',
      }),
    ).toThrow(/Invalid workspace/);
  });
});

describe('uploadGalleryAsset durable failure modes', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('fails closed when supabase mode lacks credentials (no fabricated success)', async () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'supabase');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'staging');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    vi.resetModules();
    vi.doMock('@/lib/media-intelligence/gallery/db-repository', () => ({
      dbGalleryEnsureMembership: vi.fn(async () => undefined),
      dbFindGalleryAssetByChecksum: vi.fn(async () => null),
      dbRegisterGalleryAsset: vi.fn(async () => {
        throw new Error('should not register without durable upload');
      }),
      dbRegisterGalleryDerivative: vi.fn(),
    }));

    const { uploadGalleryAsset } =
      await import('@/lib/media-intelligence/gallery/upload');

    const result = await uploadGalleryAsset({
      actor: {
        id: 'owner-1',
        role: 'owner',
        roles: ['owner'],
        source: 'temporary-media-session',
      },
      workspaceId: 'bcs-default',
      filename: 'demo.jpg',
      mimeType: 'image/jpeg',
      data: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.outcome).toBe('failed');
      expect(result.error).toMatch(/Supabase Storage is required/i);
    }
  });

  it('returns duplicate_existing with the existing asset id (not a new id)', async () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'local');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'development');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', '');

    vi.resetModules();
    vi.doMock('@/lib/media-intelligence/gallery/db-repository', () => ({
      dbGalleryEnsureMembership: vi.fn(async () => undefined),
      dbFindGalleryAssetByChecksum: vi.fn(async () => ({
        id: 'uuid-1',
        externalId: 'gallery_existing_asset',
        workspaceId: 'bcs-default',
        filename: 'demo.jpg',
        originalFilename: 'demo.jpg',
        fileType: 'image/jpeg',
        mediaKind: 'image',
        checksum: 'x',
        fileSizeBytes: 4,
        privacyStatus: 'clear',
        reviewStatus: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      dbRegisterGalleryAsset: vi.fn(async () => {
        throw new Error('must not register on duplicate');
      }),
      dbRegisterGalleryDerivative: vi.fn(),
    }));

    const { uploadGalleryAsset } =
      await import('@/lib/media-intelligence/gallery/upload');

    const result = await uploadGalleryAsset({
      actor: {
        id: 'owner-1',
        role: 'owner',
        roles: ['owner'],
        source: 'temporary-media-session',
      },
      workspaceId: 'bcs-default',
      filename: 'demo.jpg',
      mimeType: 'image/jpeg',
      data: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.outcome).toBe('duplicate_existing');
      expect(result.assetId).toBe('gallery_existing_asset');
      expect(result.duplicate).toBe(true);
    }
  });

  it('rejects production configured for local storage before writing', async () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'local');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'production');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();
    const { uploadGalleryAsset } =
      await import('@/lib/media-intelligence/gallery/upload');

    const result = await uploadGalleryAsset({
      actor: {
        id: 'owner-1',
        role: 'owner',
        roles: ['owner'],
        source: 'temporary-media-session',
      },
      workspaceId: 'bcs-default',
      filename: 'demo.jpg',
      mimeType: 'image/jpeg',
      data: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.outcome).toBe('rejected');
      expect(result.error).toMatch(/forbidden in production/i);
    }
  });

  it('cleans up local original when registration fails (no orphan + no success)', async () => {
    const vaultRoot = await mkdtemp(path.join(tmpdir(), 'gallery-vault-'));
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'local');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'development');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('MEDIA_VAULT_ROOT', vaultRoot);

    const register = vi.fn(async () => {
      throw new Error('register boom');
    });

    vi.resetModules();
    vi.doMock('@/lib/media-intelligence/gallery/db-repository', () => ({
      dbGalleryEnsureMembership: vi.fn(async () => undefined),
      dbFindGalleryAssetByChecksum: vi.fn(async () => null),
      dbRegisterGalleryAsset: register,
      dbRegisterGalleryDerivative: vi.fn(),
    }));

    const { uploadGalleryAsset, __resolveGalleryVaultRoot } =
      await import('@/lib/media-intelligence/gallery/upload');
    const { createHash } = await import('node:crypto');
    const data = Buffer.from([0xff, 0xd8, 0xff, 0xd9, 0x01, 0x02]);
    const checksum = createHash('sha256').update(data).digest('hex');
    const objectKey = buildGalleryOriginalObjectKey({
      workspaceId: 'bcs-default',
      checksum,
      filename: 'demo.jpg',
    });

    const result = await uploadGalleryAsset({
      actor: {
        id: 'owner-1',
        role: 'owner',
        roles: ['owner'],
        source: 'temporary-media-session',
      },
      workspaceId: 'bcs-default',
      filename: 'demo.jpg',
      mimeType: 'image/jpeg',
      data,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.outcome).toBe('failed');
      expect(result.error).toMatch(/Asset registration failed/i);
    }
    expect(register).toHaveBeenCalledTimes(1);
    const absolute = path.join(__resolveGalleryVaultRoot(), objectKey);
    await expect(access(absolute)).rejects.toThrow();
  });

  it('does not return a fabricated asset id on failed upload', async () => {
    vi.stubEnv('MEDIA_GALLERY_STORAGE_MODE', 'supabase');
    vi.stubEnv('MEDIA_SUPABASE_ENV', 'staging');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    vi.resetModules();
    vi.doMock('@/lib/media-intelligence/gallery/db-repository', () => ({
      dbGalleryEnsureMembership: vi.fn(async () => undefined),
      dbFindGalleryAssetByChecksum: vi.fn(async () => null),
      dbRegisterGalleryAsset: vi.fn(),
      dbRegisterGalleryDerivative: vi.fn(),
    }));

    const { uploadGalleryAsset } =
      await import('@/lib/media-intelligence/gallery/upload');
    const result = await uploadGalleryAsset({
      actor: {
        id: 'owner-1',
        role: 'owner',
        roles: ['owner'],
        source: 'temporary-media-session',
      },
      workspaceId: 'bcs-default',
      filename: 'demo.jpg',
      mimeType: 'image/jpeg',
      data: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });

    expect(result.ok).toBe(false);
    expect('assetId' in result).toBe(false);
  });
});
