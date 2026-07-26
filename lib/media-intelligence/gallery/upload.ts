/**
 * Phase 7 — Durable gallery upload.
 *
 * Production/staging: private Supabase Storage is required and fatal on failure.
 * Local vault: explicit MEDIA_GALLERY_STORAGE_MODE=local only (dev/tests).
 *
 * Sequence:
 * 1. Auth/role (caller)  2. membership  3. MIME/size  4. SHA-256
 * 5. duplicate check     6. durable original upload  7. register RPC
 * 8. derivatives         9. derivative metadata
 *
 * Never returns success when the required durable original write failed.
 * Never returns a fabricated asset ID for duplicates.
 */

import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { resolveVaultRoot } from '@/lib/media-vault/layout';
import {
  validateGalleryMimeType,
  validateGalleryFileSize,
} from '@/lib/media-intelligence/gallery/validation';
import {
  dbFindGalleryAssetByChecksum,
  dbGalleryEnsureMembership,
  dbRegisterGalleryAsset,
  dbRegisterGalleryDerivative,
} from '@/lib/media-intelligence/gallery/db-repository';
import type { GalleryUploadResult } from '@/lib/media-intelligence/gallery/types';
import {
  assertGalleryStorageModeAllowed,
  galleryStorageBucketForMode,
  galleryThumbnailBucketForMode,
  type GalleryStorageMode,
} from '@/lib/media-intelligence/gallery/storage-mode';
import {
  buildGalleryOriginalObjectKey,
  buildGalleryThumbnailObjectKey,
} from '@/lib/media-intelligence/gallery/object-keys';
import { validateSupabaseConfig } from '@/lib/media-intelligence/supabase/config';
import { MEDIA_STORAGE_BUCKETS } from '@/lib/media-intelligence/storage/object-keys';

const THUMBNAIL_SIZES = [200, 400, 800] as const;

async function sha256Buffer(buf: Buffer): Promise<string> {
  return createHash('sha256').update(buf).digest('hex');
}

function galleryVaultRoot(): string {
  return path.join(resolveVaultRoot(), 'gallery');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\-]/g, '_').slice(0, 200);
}

function mimeToMediaKind(mimeType: string): 'image' | 'video' {
  const mt = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  return mt.startsWith('video/') ? 'video' : 'image';
}

function mimeToExtension(mimeType: string): string {
  const MAP: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/heic': '.heic',
    'image/heif': '.heif',
    'image/tiff': '.tiff',
    'image/bmp': '.bmp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
  };
  const mt = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  return MAP[mt] ?? (path.extname(mimeType) || '.bin');
}

async function readImageDimensions(
  buf: Buffer,
  mimeType: string,
): Promise<{ width: number; height: number; orientation: string } | null> {
  const mt = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!mt.startsWith('image/')) return null;
  try {
    const meta = await sharp(buf).metadata();
    return {
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      orientation: String(meta.orientation ?? 'unknown'),
    };
  } catch {
    return null;
  }
}

type StorageClient = {
  upload(
    bucket: string,
    objectKey: string,
    buf: Buffer,
    contentType: string,
  ): Promise<
    { ok: true } | { ok: false; error: string; alreadyExists?: boolean }
  >;
  remove(bucket: string, objectKey: string): Promise<void>;
};

async function createSupabaseStorageClient(): Promise<StorageClient> {
  const validated = validateSupabaseConfig({ requireServiceRole: true });
  if (!validated.ok || !validated.config.serviceRoleKey) {
    throw new Error(
      `Supabase Storage is required but not configured: ${validated.ok === false ? validated.reason : 'service role missing'}`,
    );
  }
  const { createClient } = await import('@supabase/supabase-js');
  const client = createClient(
    validated.config.url,
    validated.config.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  return {
    async upload(bucket, objectKey, buf, contentType) {
      const { error } = await client.storage
        .from(bucket)
        .upload(objectKey, buf, {
          contentType,
          upsert: false,
        });
      if (!error) return { ok: true };
      const msg = error.message ?? String(error);
      if (/already exists|Duplicate|resource already/i.test(msg)) {
        return { ok: false, error: msg, alreadyExists: true };
      }
      return { ok: false, error: msg };
    },
    async remove(bucket, objectKey) {
      await client.storage.from(bucket).remove([objectKey]);
    },
  };
}

async function writeLocalOriginal(input: {
  workspaceId: string;
  objectKey: string;
  buf: Buffer;
}): Promise<string> {
  const absolutePath = path.join(galleryVaultRoot(), input.objectKey);
  const root = path.resolve(galleryVaultRoot());
  if (!path.resolve(absolutePath).startsWith(root + path.sep)) {
    throw new Error('Local vault path escape blocked');
  }
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await fs.access(absolutePath);
    return absolutePath;
  } catch {
    // write
  }
  const tempPath = `${absolutePath}.tmp.${process.pid}.${Date.now()}`;
  await fs.writeFile(tempPath, input.buf);
  try {
    await fs.rename(tempPath, absolutePath);
  } catch (err) {
    await fs.unlink(tempPath).catch(() => undefined);
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code)
        : '';
    if (code !== 'EEXIST') throw err;
  }
  return absolutePath;
}

async function removeLocalObject(objectKey: string): Promise<void> {
  const absolutePath = path.join(galleryVaultRoot(), objectKey);
  await fs.unlink(absolutePath).catch(() => undefined);
}

async function uploadOriginal(input: {
  mode: GalleryStorageMode;
  workspaceId: string;
  objectKey: string;
  buf: Buffer;
  mimeType: string;
  storage: StorageClient | null;
}): Promise<{ bucket: string; objectKey: string }> {
  const bucket = galleryStorageBucketForMode(input.mode);
  if (input.mode === 'supabase') {
    if (!input.storage) {
      throw new Error('Supabase Storage client required');
    }
    const result = await input.storage.upload(
      bucket,
      input.objectKey,
      input.buf,
      input.mimeType,
    );
    if (!result.ok && !result.alreadyExists) {
      throw new Error(`Durable storage upload failed: ${result.error}`);
    }
    return { bucket, objectKey: input.objectKey };
  }

  await writeLocalOriginal({
    workspaceId: input.workspaceId,
    objectKey: input.objectKey,
    buf: input.buf,
  });
  return { bucket, objectKey: input.objectKey };
}

async function cleanupOriginal(input: {
  mode: GalleryStorageMode;
  bucket: string;
  objectKey: string;
  storage: StorageClient | null;
}): Promise<void> {
  try {
    if (input.mode === 'supabase' && input.storage) {
      await input.storage.remove(input.bucket, input.objectKey);
      return;
    }
    await removeLocalObject(input.objectKey);
  } catch {
    // Best-effort compensation
  }
}

async function generateThumbnailBuffers(
  buf: Buffer,
  mimeType: string,
): Promise<Array<{ sizePx: number; data: Buffer; checksum: string }>> {
  const mt = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!mt.startsWith('image/')) return [];
  const out: Array<{ sizePx: number; data: Buffer; checksum: string }> = [];
  for (const size of THUMBNAIL_SIZES) {
    try {
      const data = await sharp(buf)
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      out.push({
        sizePx: size,
        data,
        checksum: await sha256Buffer(data),
      });
    } catch (err) {
      console.error(`Thumbnail generation failed for size ${size}:`, err);
    }
  }
  return out;
}

function fail(
  outcome: 'rejected' | 'failed',
  error: string,
  status: number,
): GalleryUploadResult {
  return { ok: false, outcome, error, status };
}

export type GalleryUploadInput = {
  readonly actor: MediaTrustedActor;
  readonly workspaceId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly data: Buffer;
};

export async function uploadGalleryAsset(
  input: GalleryUploadInput,
): Promise<GalleryUploadResult> {
  const { actor, workspaceId, filename, mimeType, data } = input;

  let mode: GalleryStorageMode;
  try {
    mode = assertGalleryStorageModeAllowed().mode;
  } catch (err) {
    return fail(
      'rejected',
      err instanceof Error ? err.message : String(err),
      503,
    );
  }

  const mimeCheck = validateGalleryMimeType(mimeType);
  if (!mimeCheck.ok) {
    return fail('rejected', mimeCheck.error, 415);
  }
  const sizeCheck = validateGalleryFileSize(data.length);
  if (!sizeCheck.ok) {
    return fail('rejected', sizeCheck.error, 413);
  }

  const checksum = await sha256Buffer(data);
  const ext = mimeToExtension(mimeType);
  const mediaKind = mimeToMediaKind(mimeType);
  const safeFilename = sanitizeFilename(
    path.basename(filename, path.extname(filename)) + ext,
  );

  try {
    await dbGalleryEnsureMembership(actor, workspaceId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/permission denied/i.test(msg)) {
      return fail(
        'rejected',
        'Not authorized to upload to this workspace.',
        403,
      );
    }
    return fail('failed', `Membership check failed: ${msg}`, 500);
  }

  // Pre-check exact duplicate before any storage write
  try {
    const existing = await dbFindGalleryAssetByChecksum(
      actor,
      workspaceId,
      checksum,
    );
    if (existing) {
      return {
        ok: true,
        outcome: 'duplicate_existing',
        assetId: existing.externalId,
        checksum,
        duplicate: true,
        processingComplete: true,
      };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // If find RPC missing in older DB, continue; register will still catch.
    if (!/does not exist|PGRST202|function/i.test(msg)) {
      return fail('failed', `Duplicate check failed: ${msg}`, 500);
    }
  }

  let storage: StorageClient | null = null;
  if (mode === 'supabase') {
    try {
      storage = await createSupabaseStorageClient();
    } catch (err) {
      return fail(
        'failed',
        err instanceof Error ? err.message : String(err),
        503,
      );
    }
  }

  const externalId = `gallery_${randomUUID().replace(/-/g, '')}`;
  let objectKey: string;
  try {
    objectKey = buildGalleryOriginalObjectKey({
      workspaceId,
      checksum,
      filename: safeFilename,
    });
  } catch (err) {
    return fail(
      'rejected',
      err instanceof Error ? err.message : String(err),
      400,
    );
  }

  let uploadedBucket: string | null = null;
  try {
    const uploaded = await uploadOriginal({
      mode,
      workspaceId,
      objectKey,
      buf: data,
      mimeType,
      storage,
    });
    uploadedBucket = uploaded.bucket;

    // Race: another writer may have registered between find and upload
    try {
      const raced = await dbFindGalleryAssetByChecksum(
        actor,
        workspaceId,
        checksum,
      );
      if (raced) {
        await cleanupOriginal({
          mode,
          bucket: uploaded.bucket,
          objectKey: uploaded.objectKey,
          storage,
        });
        return {
          ok: true,
          outcome: 'duplicate_existing',
          assetId: raced.externalId,
          checksum,
          duplicate: true,
          processingComplete: true,
        };
      }
    } catch {
      // continue to register
    }

    const dims = await readImageDimensions(data, mimeType);

    let registeredAsset: Awaited<ReturnType<typeof dbRegisterGalleryAsset>>;
    try {
      registeredAsset = await dbRegisterGalleryAsset(actor, {
        workspaceId,
        externalId,
        filename: safeFilename,
        originalFilename: path.basename(filename),
        fileType: mimeType,
        mediaKind,
        checksum,
        fileSizeBytes: data.length,
        storageBucket: uploaded.bucket,
        storageObjectKey: uploaded.objectKey,
        width: dims?.width,
        height: dims?.height,
        orientation: dims?.orientation,
        displayTitle: path.basename(filename, path.extname(filename)),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/exact duplicate|23505/i.test(msg)) {
        const existing = await dbFindGalleryAssetByChecksum(
          actor,
          workspaceId,
          checksum,
        ).catch(() => null);
        await cleanupOriginal({
          mode,
          bucket: uploaded.bucket,
          objectKey: uploaded.objectKey,
          storage,
        });
        if (existing) {
          return {
            ok: true,
            outcome: 'duplicate_existing',
            assetId: existing.externalId,
            checksum,
            duplicate: true,
            processingComplete: true,
          };
        }
        return fail(
          'failed',
          'Exact duplicate detected but existing asset could not be resolved.',
          409,
        );
      }
      await cleanupOriginal({
        mode,
        bucket: uploaded.bucket,
        objectKey: uploaded.objectKey,
        storage,
      });
      if (/permission denied|42501/i.test(msg)) {
        return fail('rejected', 'Not authorized to upload assets.', 403);
      }
      return fail('failed', `Asset registration failed: ${msg}`, 500);
    }

    let processingComplete = true;
    if (mediaKind === 'image') {
      const thumbs = await generateThumbnailBuffers(data, mimeType);
      const thumbBucket = galleryThumbnailBucketForMode(mode);
      for (const thumb of thumbs) {
        const thumbKey = buildGalleryThumbnailObjectKey({
          workspaceId,
          assetExternalId: registeredAsset.externalId,
          sizePx: thumb.sizePx,
        });
        try {
          if (mode === 'supabase' && storage) {
            const up = await storage.upload(
              thumbBucket,
              thumbKey,
              thumb.data,
              'image/webp',
            );
            if (!up.ok && !up.alreadyExists) {
              processingComplete = false;
              continue;
            }
          } else {
            await writeLocalOriginal({
              workspaceId,
              objectKey: thumbKey,
              buf: thumb.data,
            });
          }
          await dbRegisterGalleryDerivative(actor, {
            assetExternalId: registeredAsset.externalId,
            kind: 'thumbnail',
            sizePx: thumb.sizePx,
            storageBucket: thumbBucket,
            objectKey: thumbKey,
            contentType: 'image/webp',
            bytes: thumb.data.length,
            checksum: thumb.checksum,
          });
        } catch (derivErr) {
          processingComplete = false;
          console.error('Derivative registration failed:', derivErr);
        }
      }
      if (thumbs.length === 0) processingComplete = false;
    }

    return {
      ok: true,
      outcome: 'created',
      assetId: registeredAsset.externalId,
      checksum,
      duplicate: false,
      processingComplete,
    };
  } catch (err) {
    if (uploadedBucket) {
      await cleanupOriginal({
        mode,
        bucket: uploadedBucket,
        objectKey,
        storage,
      });
    }
    return fail(
      'failed',
      err instanceof Error ? err.message : String(err),
      500,
    );
  }
}

export function __resolveGalleryVaultRoot(): string {
  return galleryVaultRoot();
}

export function __galleryOriginalBucket(): string {
  return MEDIA_STORAGE_BUCKETS.original;
}
