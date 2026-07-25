import path from 'node:path';
import {
  THUMBNAIL_SIZES,
  type VaultDerivatives,
} from '@/lib/media-vault/types';

function baseName(assetId: string): string {
  return assetId.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

/** Resolve expected derivative relative paths without writing. */
export function expectedDerivativePaths(
  assetId: string,
  mediaKind: 'image' | 'video',
): VaultDerivatives {
  const id = baseName(assetId);
  const thumbnails = Object.fromEntries(
    THUMBNAIL_SIZES.map((size) => [
      size,
      path.join('derivatives', 'thumbnails', String(size), `${id}.jpg`),
    ]),
  ) as VaultDerivatives['thumbnails'];

  const base: VaultDerivatives = {
    thumbnails,
    webp: path.join('derivatives', 'webp', `${id}.webp`),
    avif: path.join('derivatives', 'avif', `${id}.avif`),
    preview: path.join('derivatives', 'previews', `${id}.jpg`),
  };

  if (mediaKind === 'video') {
    return {
      ...base,
      poster: path.join('derivatives', 'posters', `${id}.jpg`),
    };
  }
  return base;
}
