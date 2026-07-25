import { constants as fsConstants, promises as fs } from 'node:fs';
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
  readonly createdCount: number;
  readonly missingBefore: number;
};

export type DerivativeWriteOptions = {
  /**
   * When true, regenerate even if destination exists (explicit repair).
   * Default false: never overwrite existing derivatives.
   */
  readonly forceRegenerate?: boolean;
};

async function writeDerivative(input: {
  readonly absolutePath: string;
  readonly forceRegenerate: boolean;
  readonly write: (tempPath: string) => Promise<void>;
}): Promise<'created' | 'already_present'> {
  const tempPath = `${input.absolutePath}.tmp.${process.pid}.${Date.now()}`;
  try {
    if (!input.forceRegenerate && (await fileExists(input.absolutePath))) {
      return 'already_present';
    }

    await input.write(tempPath);

    if (input.forceRegenerate) {
      await fs.rename(tempPath, input.absolutePath);
      return 'created';
    }

    try {
      await fs.copyFile(
        tempPath,
        input.absolutePath,
        fsConstants.COPYFILE_EXCL,
      );
      await fs.unlink(tempPath).catch(() => undefined);
      return 'created';
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      await fs.unlink(tempPath).catch(() => undefined);
      if (code === 'EEXIST') return 'already_present';
      throw error;
    }
  } catch (error) {
    await fs.unlink(tempPath).catch(() => undefined);
    throw error;
  }
}

/**
 * Generate private derivatives from an original image.
 * Never writes to the originals directory.
 * Existing derivatives are not overwritten unless forceRegenerate is set.
 */
export async function generateImageDerivatives(input: {
  readonly layout: VaultLayout;
  readonly assetId: string;
  readonly originalAbsolutePath: string;
  readonly options?: DerivativeWriteOptions;
}): Promise<ImageDerivativeResult> {
  const id = baseName(input.assetId);
  const force = Boolean(input.options?.forceRegenerate);
  const thumbnails: Partial<Record<ThumbnailSize, string>> = {};
  let createdCount = 0;
  let missingBefore = 0;

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
    if (!(await fileExists(absolute))) missingBefore += 1;
    const status = await writeDerivative({
      absolutePath: absolute,
      forceRegenerate: force,
      write: async (tempPath) => {
        await sharp(input.originalAbsolutePath, { failOn: 'none' })
          .rotate()
          .resize({
            width: size,
            height: size,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(tempPath);
      },
    });
    if (status === 'created') createdCount += 1;
    thumbnails[size] = relative;
  }

  await ensureDir(input.layout.webp);
  const webpRel = path.join('derivatives', 'webp', `${id}.webp`);
  const webpAbs = path.join(input.layout.root, webpRel);
  if (!(await fileExists(webpAbs))) missingBefore += 1;
  if (
    (await writeDerivative({
      absolutePath: webpAbs,
      forceRegenerate: force,
      write: async (tempPath) => {
        await sharp(input.originalAbsolutePath, { failOn: 'none' })
          .rotate()
          .resize({
            width: 2400,
            height: 2400,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toFile(tempPath);
      },
    })) === 'created'
  ) {
    createdCount += 1;
  }

  await ensureDir(input.layout.avif);
  const avifRel = path.join('derivatives', 'avif', `${id}.avif`);
  const avifAbs = path.join(input.layout.root, avifRel);
  if (!(await fileExists(avifAbs))) missingBefore += 1;
  if (
    (await writeDerivative({
      absolutePath: avifAbs,
      forceRegenerate: force,
      write: async (tempPath) => {
        await sharp(input.originalAbsolutePath, { failOn: 'none' })
          .rotate()
          .resize({
            width: 2400,
            height: 2400,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .avif({ quality: 55 })
          .toFile(tempPath);
      },
    })) === 'created'
  ) {
    createdCount += 1;
  }

  await ensureDir(input.layout.previews);
  const previewRel = path.join('derivatives', 'previews', `${id}.jpg`);
  const previewAbs = path.join(input.layout.root, previewRel);
  if (!(await fileExists(previewAbs))) missingBefore += 1;
  if (
    (await writeDerivative({
      absolutePath: previewAbs,
      forceRegenerate: force,
      write: async (tempPath) => {
        await sharp(input.originalAbsolutePath, { failOn: 'none' })
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(tempPath);
      },
    })) === 'created'
  ) {
    createdCount += 1;
  }

  return {
    thumbnails,
    webp: webpRel,
    avif: avifRel,
    preview: previewRel,
    createdCount,
    missingBefore,
  };
}

/** True when all required image derivatives exist for an asset id. */
export async function imageDerivativesComplete(
  layout: VaultLayout,
  assetId: string,
): Promise<boolean> {
  const id = baseName(assetId);
  const required = [
    ...THUMBNAIL_SIZES.map((size) =>
      path.join(
        layout.root,
        'derivatives',
        'thumbnails',
        String(size),
        `${id}.jpg`,
      ),
    ),
    path.join(layout.root, 'derivatives', 'webp', `${id}.webp`),
    path.join(layout.root, 'derivatives', 'avif', `${id}.avif`),
    path.join(layout.root, 'derivatives', 'previews', `${id}.jpg`),
  ];
  for (const file of required) {
    if (!(await fileExists(file))) return false;
  }
  return true;
}
