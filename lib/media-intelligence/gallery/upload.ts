/**
 * Phase 7 — Real file upload implementation.
 *
 * Validates mime/size, computes SHA-256, writes to local vault
 * (MEDIA_VAULT_ROOT or os.tmpdir()), optionally uploads to Supabase Storage,
 * then registers via SECURITY DEFINER RPC + generates sharp thumbnails.
 *
 * Never fakes success. If local write or RPC registration fails, rejects.
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
  dbGalleryEnsureMembership,
  dbRegisterGalleryAsset,
  dbRegisterGalleryDerivative,
} from '@/lib/media-intelligence/gallery/db-repository';
import type { GalleryUploadResult } from '@/lib/media-intelligence/gallery/types';
import { validateSupabaseConfig } from '@/lib/media-intelligence/supabase/config';

const THUMBNAIL_SIZES = [200, 400, 800] as const;
const GALLERY_STORAGE_BUCKET = 'gallery';
const GALLERY_ORIGINALS_PREFIX = 'originals';
const GALLERY_THUMBNAILS_PREFIX = 'thumbnails';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sha256Buffer(buf: Buffer): Promise<string> {
  return createHash('sha256').update(buf).digest('hex');
}

function galleryVaultRoot(): string {
  const vaultRoot = resolveVaultRoot();
  return path.join(vaultRoot, 'gallery');
}

function galleryOriginalsDir(): string {
  return path.join(galleryVaultRoot(), 'originals');
}

function galleryThumbnailsDir(sizePx: number): string {
  return path.join(galleryVaultRoot(), 'thumbnails', String(sizePx));
}

/** Sanitize a filename for local filesystem storage. */
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

// ── Image metadata ────────────────────────────────────────────────────────────

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

// ── Local vault write ─────────────────────────────────────────────────────────

async function writeToLocalVault(
  buf: Buffer,
  filename: string,
  checksum: string,
): Promise<{ localPath: string; objectKey: string }> {
  const originalsDir = galleryOriginalsDir();
  await fs.mkdir(originalsDir, { recursive: true });

  const ext = path.extname(filename) || '.bin';
  const baseName = `${checksum}${ext}`;
  const objectKey = `${GALLERY_ORIGINALS_PREFIX}/${baseName}`;
  const localPath = path.join(originalsDir, baseName);

  // Write-once: skip if already exists (same checksum = same content).
  try {
    await fs.access(localPath);
  } catch {
    const tempPath = `${localPath}.tmp.${process.pid}.${Date.now()}`;
    await fs.writeFile(tempPath, buf);
    try {
      await fs.rename(tempPath, localPath);
    } catch (renameErr) {
      await fs.unlink(tempPath).catch(() => undefined);
      const code =
        renameErr && typeof renameErr === 'object' && 'code' in renameErr
          ? String((renameErr as { code?: string }).code)
          : '';
      if (code !== 'EEXIST') throw renameErr;
    }
  }

  return { localPath, objectKey };
}

// ── Thumbnail generation ──────────────────────────────────────────────────────

async function generateThumbnails(
  buf: Buffer,
  mimeType: string,
  checksum: string,
): Promise<
  Array<{
    sizePx: number;
    localPath: string;
    objectKey: string;
    bytes: number;
    checksum: string;
  }>
> {
  const mt = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!mt.startsWith('image/')) return [];

  const results: Array<{
    sizePx: number;
    localPath: string;
    objectKey: string;
    bytes: number;
    checksum: string;
  }> = [];

  for (const size of THUMBNAIL_SIZES) {
    const thumbDir = galleryThumbnailsDir(size);
    await fs.mkdir(thumbDir, { recursive: true });

    const objectKey = `${GALLERY_THUMBNAILS_PREFIX}/${size}/${checksum}_${size}.webp`;
    const localPath = path.join(thumbDir, `${checksum}_${size}.webp`);

    try {
      await fs.access(localPath);
      const stat = await fs.stat(localPath);
      const thumbBuf = await fs.readFile(localPath);
      results.push({
        sizePx: size,
        localPath,
        objectKey,
        bytes: stat.size,
        checksum: await sha256Buffer(thumbBuf),
      });
      continue;
    } catch {
      // Generate
    }

    const tempPath = `${localPath}.tmp.${process.pid}.${Date.now()}`;
    try {
      const thumbBuf = await sharp(buf)
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      await fs.writeFile(tempPath, thumbBuf);
      try {
        await fs.rename(tempPath, localPath);
      } catch (renameErr) {
        await fs.unlink(tempPath).catch(() => undefined);
        const code =
          renameErr && typeof renameErr === 'object' && 'code' in renameErr
            ? String((renameErr as { code?: string }).code)
            : '';
        if (code !== 'EEXIST') throw renameErr;
      }

      const thumbChecksum = await sha256Buffer(thumbBuf);
      results.push({
        sizePx: size,
        localPath,
        objectKey,
        bytes: thumbBuf.length,
        checksum: thumbChecksum,
      });
    } catch (thumbErr) {
      await fs.unlink(tempPath).catch(() => undefined);
      // Non-fatal: thumbnail generation failure should not block upload
      console.error(`Thumbnail generation failed for size ${size}:`, thumbErr);
    }
  }

  return results;
}

// ── Supabase Storage upload ───────────────────────────────────────────────────

async function trySupabaseStorageUpload(
  buf: Buffer,
  objectKey: string,
  mimeType: string,
  bucket = GALLERY_STORAGE_BUCKET,
): Promise<boolean> {
  const validated = validateSupabaseConfig({ requireServiceRole: true });
  if (!validated.ok || !validated.config.serviceRoleKey) return false;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(
      validated.config.url,
      validated.config.serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await client.storage.from(bucket).upload(objectKey, buf, {
      contentType: mimeType,
      upsert: false,
    });
    if (error && !String(error.message ?? '').includes('already exists')) {
      console.error('Supabase Storage upload error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Storage upload failed:', err);
    return false;
  }
}

// ── Main upload ───────────────────────────────────────────────────────────────

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

  // 1. Validate
  const mimeCheck = validateGalleryMimeType(mimeType);
  if (!mimeCheck.ok) {
    return { ok: false, error: mimeCheck.error, status: 415 };
  }
  const sizeCheck = validateGalleryFileSize(data.length);
  if (!sizeCheck.ok) {
    return { ok: false, error: sizeCheck.error, status: 413 };
  }

  // 2. SHA-256
  const checksum = await sha256Buffer(data);
  const externalId = `gallery_${randomUUID().replace(/-/g, '')}`;
  const ext = mimeToExtension(mimeType);
  const mediaKind = mimeToMediaKind(mimeType);
  const safeFilename = sanitizeFilename(
    path.basename(filename, path.extname(filename)) + ext,
  );

  // 3. Ensure membership (idempotent)
  try {
    await dbGalleryEnsureMembership(actor, workspaceId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/permission denied/i.test(msg)) {
      return {
        ok: false,
        error: 'Not authorized to upload to this workspace.',
        status: 403,
      };
    }
    return { ok: false, error: `Membership check failed: ${msg}`, status: 500 };
  }

  // 4. Write to local vault
  let storageObjectKey: string;
  try {
    const result = await writeToLocalVault(data, safeFilename, checksum);
    storageObjectKey = result.objectKey;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `Local vault write failed: ${msg}`,
      status: 500,
    };
  }

  // 5. Optionally upload to Supabase Storage (non-fatal)
  let storageBucket = 'local-vault';
  const supabaseUploaded = await trySupabaseStorageUpload(
    data,
    storageObjectKey,
    mimeType,
  );
  if (supabaseUploaded) {
    storageBucket = GALLERY_STORAGE_BUCKET;
  }

  // 6. Read image dimensions
  const dims = await readImageDimensions(data, mimeType);

  // 7. Register asset via RPC
  let duplicate = false;
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
      storageBucket,
      storageObjectKey,
      width: dims?.width,
      height: dims?.height,
      orientation: dims?.orientation,
      displayTitle: path.basename(filename, path.extname(filename)),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // 23505 = unique_violation (duplicate checksum)
    if (/exact duplicate|23505/i.test(msg)) {
      duplicate = true;
      return { ok: true, assetId: externalId, checksum, duplicate: true };
    }
    if (/permission denied|42501/i.test(msg)) {
      return {
        ok: false,
        error: 'Not authorized to upload assets.',
        status: 403,
      };
    }
    return {
      ok: false,
      error: `Asset registration failed: ${msg}`,
      status: 500,
    };
  }

  // 8. Generate thumbnails and register derivatives
  if (mediaKind === 'image') {
    const thumbnails = await generateThumbnails(data, mimeType, checksum);
    for (const thumb of thumbnails) {
      // Upload thumbnail to Supabase Storage if available
      if (supabaseUploaded) {
        const thumbBuf = await fs.readFile(thumb.localPath).catch(() => null);
        if (thumbBuf) {
          await trySupabaseStorageUpload(
            thumbBuf,
            thumb.objectKey,
            'image/webp',
          );
        }
      }

      try {
        await dbRegisterGalleryDerivative(actor, {
          assetExternalId: registeredAsset.externalId,
          kind: 'thumbnail',
          sizePx: thumb.sizePx,
          storageBucket,
          objectKey: thumb.objectKey,
          contentType: 'image/webp',
          bytes: thumb.bytes,
          checksum: thumb.checksum,
        });
      } catch (derivErr) {
        // Non-fatal: derivative registration failure should not block main upload
        console.error('Derivative registration failed:', derivErr);
      }
    }
  }

  return {
    ok: true,
    assetId: registeredAsset.externalId,
    checksum,
    duplicate,
  };
}

// Exposed for testing purposes only
export function __resolveGalleryVaultRoot(): string {
  return galleryVaultRoot();
}
