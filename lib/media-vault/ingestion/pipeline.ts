import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { CatalogAsset } from '@/lib/media-library';
import { fileExists, sha256File } from '@/lib/media-vault/checksum';
import { generateImageDerivatives } from '@/lib/media-vault/derivatives/images';
import { generateVideoDerivatives } from '@/lib/media-vault/derivatives/video';
import { readImageExif } from '@/lib/media-vault/exif';
import {
  getVaultLayout,
  resolveVaultRoot,
  type VaultLayout,
} from '@/lib/media-vault/layout';
import { assertSupportedMedia } from '@/lib/media-vault/mime';
import type {
  VaultAssetRecord,
  VaultDerivatives,
} from '@/lib/media-vault/types';

export type IngestResult = {
  readonly asset: VaultAssetRecord;
  readonly skipped: boolean;
  readonly reason?: string;
};

export type IngestBatchResult = {
  readonly processed: number;
  readonly ingested: number;
  readonly skipped: number;
  readonly rejected: number;
  readonly errors: readonly string[];
  readonly assets: readonly VaultAssetRecord[];
  readonly durationMs: number;
};

async function* walkFiles(root: string): AsyncGenerator<string> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function assetIdFromChecksum(checksum: string): string {
  return `vault_${checksum.slice(0, 16)}`;
}

/**
 * Preserve original: copy into vault originals/ only if destination does not exist.
 * Never overwrite. Never delete.
 */
async function preserveOriginal(input: {
  readonly layout: VaultLayout;
  readonly sourcePath: string;
  readonly filename: string;
  readonly checksum: string;
}): Promise<{
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly created: boolean;
}> {
  const ext = path.extname(input.filename) || path.extname(input.sourcePath);
  const safeName =
    `${input.checksum.slice(0, 16)}_${path.basename(input.filename, ext)}${ext}`
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(0, 180);
  const absolutePath = path.join(input.layout.originals, safeName);
  const relativePath = path.join('originals', safeName);

  await fs.mkdir(input.layout.originals, { recursive: true });

  if (await fileExists(absolutePath)) {
    return { relativePath, absolutePath, created: false };
  }

  await fs.copyFile(input.sourcePath, absolutePath);
  // Write-once hardening: set read-only for owner group/other as best-effort.
  try {
    await fs.chmod(absolutePath, 0o444);
  } catch {
    // ignore platforms that disallow chmod
  }
  return { relativePath, absolutePath, created: true };
}

export async function ingestFile(input: {
  readonly sourcePath: string;
  readonly layout?: VaultLayout;
  readonly relativeFolder?: string;
}): Promise<IngestResult> {
  const layout = input.layout ?? getVaultLayout(resolveVaultRoot());
  const filename = path.basename(input.sourcePath);

  let detected;
  try {
    detected = assertSupportedMedia(filename);
  } catch (error) {
    return {
      asset: {
        id: `rejected_${createHash('sha1').update(input.sourcePath).digest('hex').slice(0, 12)}`,
        filename,
        originalFilename: filename,
        fileType: 'application/octet-stream',
        mediaKind: 'image',
        folder: input.relativeFolder ?? '',
        stage: 'unknown',
        keywords: [],
        hasExif: false,
        orientation: 'unknown',
        scores: { website: 0, marketing: 0, technical: 0 },
        privacyStatus: 'clear',
        privacyIssues: [],
        isHeroCandidate: false,
        isExactDuplicate: false,
        isNearDuplicate: false,
      },
      skipped: true,
      reason: error instanceof Error ? error.message : 'Unsupported format',
    };
  }

  const checksum = await sha256File(input.sourcePath);
  const id = assetIdFromChecksum(checksum);
  const preserved = await preserveOriginal({
    layout,
    sourcePath: input.sourcePath,
    filename,
    checksum,
  });

  let derivatives: VaultDerivatives = {};
  let width: number | undefined;
  let height: number | undefined;
  let orientation: CatalogAsset['orientation'] = 'unknown';
  let hasExif = false;
  let exifDate: string | undefined;
  let camera: string | undefined;
  let videoMeta: VaultAssetRecord['videoMeta'];

  if (detected.mediaKind === 'image') {
    const exif = await readImageExif(preserved.absolutePath);
    width = exif.width;
    height = exif.height;
    orientation = exif.orientation ?? 'unknown';
    hasExif = exif.hasExif;
    exifDate = exif.exifDate;
    camera = exif.camera;
    const imageDerivatives = await generateImageDerivatives({
      layout,
      assetId: id,
      originalAbsolutePath: preserved.absolutePath,
    });
    derivatives = {
      thumbnails: imageDerivatives.thumbnails,
      webp: imageDerivatives.webp,
      avif: imageDerivatives.avif,
      preview: imageDerivatives.preview,
    };
  } else {
    const video = await generateVideoDerivatives({
      layout,
      assetId: id,
      originalAbsolutePath: preserved.absolutePath,
    });
    videoMeta = video.videoMeta;
    width = video.videoMeta.width ?? undefined;
    height = video.videoMeta.height ?? undefined;
    orientation =
      width && height
        ? width === height
          ? 'square'
          : width > height
            ? 'landscape'
            : 'portrait'
        : 'unknown';
    derivatives = {
      poster: video.poster,
      thumbnails: video.thumbnails,
      preview: video.preview,
      webp: video.webp,
      avif: video.avif,
    };
  }

  const stat = await fs.stat(preserved.absolutePath);
  const asset: VaultAssetRecord = {
    id,
    filename,
    originalFilename: filename,
    fileType: detected.mimeType,
    mediaKind: detected.mediaKind,
    folder: input.relativeFolder ?? '',
    stage: 'unknown',
    keywords: [],
    camera,
    exifDate,
    hasExif,
    width,
    height,
    resolution: width && height ? `${width}x${height}` : undefined,
    orientation,
    checksum,
    sha256: checksum,
    fileSizeBytes: stat.size,
    scores: {
      website: 50,
      marketing: 50,
      technical: 50,
      quality: 50,
      overall: 50,
    },
    privacyStatus: 'clear',
    privacyIssues: [],
    isHeroCandidate: false,
    isExactDuplicate: false,
    isNearDuplicate: false,
    thumbnailPath: derivatives.thumbnails?.[400] ?? null,
    previewPath: derivatives.preview ?? derivatives.poster ?? null,
    originalRelativePath: preserved.relativePath,
    derivatives,
    videoMeta,
    indexedAt: new Date().toISOString(),
    ingestedAt: new Date().toISOString(),
    notes: preserved.created
      ? 'Ingested into media vault (original preserved write-once).'
      : 'Original already present in vault; derivatives refreshed if missing.',
  };

  return {
    asset,
    skipped: !preserved.created,
    reason: preserved.created ? undefined : 'original-already-present',
  };
}

export async function ingestDirectory(input: {
  readonly sourceDir: string;
  readonly vaultRoot?: string;
  readonly limit?: number;
}): Promise<IngestBatchResult> {
  const started = performance.now();
  const layout = getVaultLayout(input.vaultRoot ?? resolveVaultRoot());
  await fs.mkdir(layout.originals, { recursive: true });
  await fs.mkdir(layout.manifests, { recursive: true });

  const assets: VaultAssetRecord[] = [];
  const errors: string[] = [];
  let processed = 0;
  let ingested = 0;
  let skipped = 0;
  let rejected = 0;

  for await (const filePath of walkFiles(input.sourceDir)) {
    if (input.limit && processed >= input.limit) break;
    processed += 1;
    const relativeFolder = path.relative(
      input.sourceDir,
      path.dirname(filePath),
    );
    try {
      const result = await ingestFile({
        sourcePath: filePath,
        layout,
        relativeFolder,
      });
      if (result.reason?.startsWith('Unsupported')) {
        rejected += 1;
        errors.push(`${path.basename(filePath)}: ${result.reason}`);
        continue;
      }
      assets.push(result.asset);
      if (result.skipped) skipped += 1;
      else ingested += 1;
    } catch (error) {
      rejected += 1;
      errors.push(
        `${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Merge into vault catalog manifest (does not touch source originals tree).
  const catalogPath = path.join(layout.manifests, 'media_catalog.json');
  const existingRaw = (await fileExists(catalogPath))
    ? JSON.parse(await fs.readFile(catalogPath, 'utf8'))
    : null;
  const byId = new Map<string, VaultAssetRecord>();
  if (existingRaw?.assets && Array.isArray(existingRaw.assets)) {
    for (const asset of existingRaw.assets as VaultAssetRecord[]) {
      byId.set(asset.id, asset);
    }
  }
  for (const asset of assets) byId.set(asset.id, asset);

  const merged = {
    generatedAt: new Date().toISOString(),
    version: '1.0',
    source: 'media-vault-ingestion',
    isFixture: false,
    assets: [...byId.values()],
  };
  await fs.writeFile(catalogPath, JSON.stringify(merged, null, 2));

  const logLine = JSON.stringify({
    at: new Date().toISOString(),
    sourceDir: input.sourceDir,
    processed,
    ingested,
    skipped,
    rejected,
  });
  await fs.appendFile(
    path.join(layout.manifests, 'ingestion_log.jsonl'),
    `${logLine}\n`,
  );

  return {
    processed,
    ingested,
    skipped,
    rejected,
    errors,
    assets,
    durationMs: performance.now() - started,
  };
}
