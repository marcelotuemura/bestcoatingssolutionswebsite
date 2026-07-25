/**
 * Collision-safe private storage object keys.
 * Never absolute filesystem paths. Never client-controlled raw paths.
 */

import type { ThumbnailSize, VaultObjectKind } from '@/lib/media-vault/types';

export const MEDIA_STORAGE_BUCKETS = {
  original: 'media-originals',
  thumbnail: 'media-thumbnails',
  preview: 'media-previews',
  webp: 'media-webp',
  avif: 'media-avif',
  poster: 'media-video-posters',
} as const;

export type MediaStorageBucket =
  (typeof MEDIA_STORAGE_BUCKETS)[keyof typeof MEDIA_STORAGE_BUCKETS];

const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/;

export function assertSafeObjectKey(objectKey: string): string {
  if (!objectKey || objectKey.length > 512) {
    throw new Error('Invalid object key length');
  }
  if (objectKey.startsWith('/') || /^[A-Za-z]:/.test(objectKey)) {
    throw new Error('Absolute filesystem paths are not allowed as object keys');
  }
  if (objectKey.includes('..') || objectKey.includes('\\')) {
    throw new Error('Path traversal is not allowed in object keys');
  }
  const parts = objectKey.split('/');
  if (parts.some((p) => !p || !SAFE_SEGMENT.test(p))) {
    throw new Error('Object key contains unsafe segments');
  }
  return objectKey;
}

export function bucketForKind(kind: VaultObjectKind): MediaStorageBucket {
  switch (kind) {
    case 'original':
      return MEDIA_STORAGE_BUCKETS.original;
    case 'thumbnail':
      return MEDIA_STORAGE_BUCKETS.thumbnail;
    case 'preview':
      return MEDIA_STORAGE_BUCKETS.preview;
    case 'webp':
      return MEDIA_STORAGE_BUCKETS.webp;
    case 'avif':
      return MEDIA_STORAGE_BUCKETS.avif;
    case 'poster':
      return MEDIA_STORAGE_BUCKETS.poster;
    default:
      throw new Error(`Unknown vault object kind: ${kind}`);
  }
}

/**
 * Checksum-addressed original key: originals/{checksum16}_{safeFilename}
 */
export function buildOriginalObjectKey(input: {
  readonly checksum: string;
  readonly filename: string;
}): string {
  const ext = input.filename.includes('.')
    ? input.filename.slice(input.filename.lastIndexOf('.'))
    : '';
  const base = input.filename
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 120);
  const key = `originals/${input.checksum.slice(0, 16)}_${base}${ext.toLowerCase()}`;
  return assertSafeObjectKey(key);
}

export function buildDerivativeObjectKey(input: {
  readonly assetExternalId: string;
  readonly kind: Exclude<VaultObjectKind, 'original'>;
  readonly size?: ThumbnailSize;
  readonly extension: string;
}): string {
  const id = input.assetExternalId.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const ext = input.extension.startsWith('.')
    ? input.extension
    : `.${input.extension}`;
  let key: string;
  if (input.kind === 'thumbnail') {
    const size = input.size ?? 400;
    key = `thumbnails/${size}/${id}${ext}`;
  } else {
    key = `${input.kind}/${id}${ext}`;
  }
  return assertSafeObjectKey(key);
}

export function isAllowedMediaMime(
  mime: string,
  kind: VaultObjectKind,
): boolean {
  const lower = mime.toLowerCase();
  if (kind === 'original') {
    return (
      lower.startsWith('image/') ||
      lower === 'video/mp4' ||
      lower === 'video/quicktime'
    );
  }
  if (kind === 'webp') return lower === 'image/webp';
  if (kind === 'avif') return lower === 'image/avif';
  return lower.startsWith('image/');
}
