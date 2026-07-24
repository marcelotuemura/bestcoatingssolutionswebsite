import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { thumbnailDir, type VaultLayout } from '@/lib/media-vault/layout';
import { THUMBNAIL_SIZES, type ThumbnailSize } from '@/lib/media-vault/types';
import { fileExists } from '@/lib/media-vault/checksum';

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function baseName(assetId: string): string {
  return assetId.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export type ImageDerivativeResult = {
  readonly thumbnails: Partial<Record<ThumbnailSize, string>>;
  readonly webp?: string;
  readonly avif?: string;
  readonly preview?: string;
};

/**
 * Generate private derivatives from an original image.
 * Never writes to the originals directory.
 */
export async function generateImageDerivatives(input: {
  readonly layout: VaultLayout;
  readonly assetId: string;
  readonly originalAbsolutePath: string;
}): Promise<ImageDerivativeResult> {
  const id = baseName(input.assetId);
  const source = sharp(input.originalAbsolutePath, { failOn: 'none' }).rotate();
  const meta = await source.metadata();
  const thumbnails: Partial<Record<ThumbnailSize, string>> = {};

  for (const size of THUMBNAIL_SIZES) {
    const dir = thumbnailDir(input.layout, size);
    await ensureDir(dir);
    const relative = path.join(
      'derivatives',
      'thumbnails',
      String(size),
      `${id}.jpg`,
    );
    const absolute = path.join(input.layout.root, relative);
    if (!(await fileExists(absolute))) {
      await sharp(input.originalAbsolutePath, { failOn: 'none' })
        .rotate()
        .resize({
          width: size,
          height: size,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(absolute);
    }
    thumbnails[size] = relative;
  }

  await ensureDir(input.layout.webp);
  const webpRel = path.join('derivatives', 'webp', `${id}.webp`);
  const webpAbs = path.join(input.layout.root, webpRel);
  if (!(await fileExists(webpAbs))) {
    await sharp(input.originalAbsolutePath, { failOn: 'none' })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(webpAbs);
  }

  await ensureDir(input.layout.avif);
  const avifRel = path.join('derivatives', 'avif', `${id}.avif`);
  const avifAbs = path.join(input.layout.root, avifRel);
  if (!(await fileExists(avifAbs))) {
    await sharp(input.originalAbsolutePath, { failOn: 'none' })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .avif({ quality: 55 })
      .toFile(avifAbs);
  }

  await ensureDir(input.layout.previews);
  const previewRel = path.join('derivatives', 'previews', `${id}.jpg`);
  const previewAbs = path.join(input.layout.root, previewRel);
  if (!(await fileExists(previewAbs))) {
    await sharp(input.originalAbsolutePath, { failOn: 'none' })
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(previewAbs);
  }

  void meta;
  return {
    thumbnails,
    webp: webpRel,
    avif: avifRel,
    preview: previewRel,
  };
}
