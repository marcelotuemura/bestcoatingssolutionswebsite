import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { CatalogAsset } from '@/lib/media-library';
import { sha256File } from '@/lib/media-vault/checksum';
import { expectedDerivativePaths } from '@/lib/media-vault/derivative-paths';
import {
  generateImageDerivatives,
  imageDerivativesComplete,
} from '@/lib/media-vault/derivatives/images';
import {
  generateVideoDerivatives,
  videoDerivativesComplete,
} from '@/lib/media-vault/derivatives/video';
import { readImageExif } from '@/lib/media-vault/exif';
import {
  getVaultLayout,
  resolveVaultRoot,
  type VaultLayout,
} from '@/lib/media-vault/layout';
import { mergeVaultManifestAtomic } from '@/lib/media-vault/manifest';
import { detectMediaFromFile } from '@/lib/media-vault/mime';
import {
  preserveOriginalExclusive,
  VaultIntegrityConflictError,
} from '@/lib/media-vault/preserve-original';
import type {
  VaultAssetRecord,
  VaultDerivatives,
} from '@/lib/media-vault/types';

/**
 * Explicit re-ingestion / ingest result status model.
 * Never label derivative writes as a generic "skipped".
 */
export type IngestStatus =
  | 'ingested'
  | 'already_present'
  | 'derivatives_repaired'
  | 'rejected'
  | 'integrity_conflict'
  | 'failed';

export type IngestResult = {
  readonly status: IngestStatus;
  readonly asset: VaultAssetRecord | null;
  readonly reason?: string;
};

export type IngestBatchResult = {
  readonly processed: number;
  readonly ingested: number;
  readonly alreadyPresent: number;
  readonly derivativesRepaired: number;
  readonly rejected: number;
  readonly integrityConflicts: number;
  readonly failed: number;
  readonly errors: readonly string[];
  readonly assets: readonly VaultAssetRecord[];
  readonly durationMs: number;
};

export type IngestFileOptions = {
  readonly sourcePath: string;
  readonly layout?: VaultLayout;
  readonly relativeFolder?: string;
  /**
   * Explicit repair path: generate missing derivatives (never overwrite unless
   * forceRegenerateDerivatives is also set).
   */
  readonly repairDerivatives?: boolean;
  /** Explicit regeneration: overwrite existing derivatives. */
  readonly forceRegenerateDerivatives?: boolean;
};

async function* walkFiles(root: string): AsyncGenerator<string> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (entry.isFile() && !entry.name.startsWith('.')) {
      yield full;
    }
  }
}

function assetIdFromChecksum(checksum: string): string {
  return `vault_${checksum.slice(0, 16)}`;
}

function rejectedAsset(
  sourcePath: string,
  filename: string,
  folder: string,
): VaultAssetRecord {
  return {
    id: `rejected_${createHash('sha1').update(sourcePath).digest('hex').slice(0, 12)}`,
    filename,
    originalFilename: filename,
    fileType: 'application/octet-stream',
    mediaKind: 'image',
    folder,
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
  };
}

async function buildDerivatives(input: {
  readonly layout: VaultLayout;
  readonly assetId: string;
  readonly absolutePath: string;
  readonly mediaKind: 'image' | 'video';
  readonly repair: boolean;
  readonly forceRegenerate: boolean;
}): Promise<{
  readonly derivatives: VaultDerivatives;
  readonly width?: number;
  readonly height?: number;
  readonly orientation: CatalogAsset['orientation'];
  readonly hasExif: boolean;
  readonly exifDate?: string;
  readonly camera?: string;
  readonly videoMeta?: VaultAssetRecord['videoMeta'];
  readonly createdCount: number;
}> {
  if (input.mediaKind === 'image') {
    const exif = await readImageExif(input.absolutePath);
    const imageDerivatives = await generateImageDerivatives({
      layout: input.layout,
      assetId: input.assetId,
      originalAbsolutePath: input.absolutePath,
      options: {
        forceRegenerate: input.forceRegenerate,
      },
    });
    return {
      derivatives: {
        thumbnails: imageDerivatives.thumbnails,
        webp: imageDerivatives.webp,
        avif: imageDerivatives.avif,
        preview: imageDerivatives.preview,
      },
      width: exif.width,
      height: exif.height,
      orientation: exif.orientation ?? 'unknown',
      hasExif: exif.hasExif,
      exifDate: exif.exifDate,
      camera: exif.camera,
      createdCount: imageDerivatives.createdCount,
    };
  }

  const video = await generateVideoDerivatives({
    layout: input.layout,
    assetId: input.assetId,
    originalAbsolutePath: input.absolutePath,
    options: {
      forceRegenerate: input.forceRegenerate,
    },
  });
  const width = video.videoMeta.width ?? undefined;
  const height = video.videoMeta.height ?? undefined;
  return {
    derivatives: {
      poster: video.poster,
      thumbnails: video.thumbnails,
      preview: video.preview,
      webp: video.webp,
      avif: video.avif,
    },
    width,
    height,
    orientation:
      width && height
        ? width === height
          ? 'square'
          : width > height
            ? 'landscape'
            : 'portrait'
        : 'unknown',
    hasExif: false,
    videoMeta: video.videoMeta,
    createdCount: video.createdCount,
  };
}

function toAssetRecord(input: {
  readonly id: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly mediaKind: 'image' | 'video';
  readonly folder: string;
  readonly checksum: string;
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly derivatives: VaultDerivatives;
  readonly width?: number;
  readonly height?: number;
  readonly orientation: CatalogAsset['orientation'];
  readonly hasExif: boolean;
  readonly exifDate?: string;
  readonly camera?: string;
  readonly videoMeta?: VaultAssetRecord['videoMeta'];
  readonly notes: string;
  readonly fileSizeBytes: number;
}): VaultAssetRecord {
  return {
    id: input.id,
    filename: input.filename,
    originalFilename: input.filename,
    fileType: input.mimeType,
    mediaKind: input.mediaKind,
    folder: input.folder,
    stage: 'unknown',
    keywords: [],
    camera: input.camera,
    exifDate: input.exifDate,
    hasExif: input.hasExif,
    width: input.width,
    height: input.height,
    resolution:
      input.width && input.height
        ? `${input.width}x${input.height}`
        : undefined,
    orientation: input.orientation,
    checksum: input.checksum,
    sha256: input.checksum,
    fileSizeBytes: input.fileSizeBytes,
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
    thumbnailPath: input.derivatives.thumbnails?.[400] ?? null,
    previewPath: input.derivatives.preview ?? input.derivatives.poster ?? null,
    originalRelativePath: input.relativePath,
    derivatives: input.derivatives,
    videoMeta: input.videoMeta,
    indexedAt: new Date().toISOString(),
    ingestedAt: new Date().toISOString(),
    notes: input.notes,
  };
}

/**
 * Ingest a single media file into the vault.
 *
 * Default re-ingestion is a true idempotent no-op when the original already
 * exists (checksum match) and required derivatives are present.
 * Missing derivatives are only generated when repairDerivatives=true.
 */
export async function ingestFile(
  input: IngestFileOptions,
): Promise<IngestResult> {
  const layout = input.layout ?? getVaultLayout(resolveVaultRoot());
  const filename = path.basename(input.sourcePath);
  const folder = input.relativeFolder ?? '';
  const repair = Boolean(input.repairDerivatives);
  const forceRegenerate = Boolean(input.forceRegenerateDerivatives);

  let detected;
  try {
    detected = await detectMediaFromFile(input.sourcePath, filename);
  } catch (error) {
    return {
      status: 'rejected',
      asset: rejectedAsset(input.sourcePath, filename, folder),
      reason: error instanceof Error ? error.message : 'Unsupported format',
    };
  }

  let checksum: string;
  try {
    checksum = await sha256File(input.sourcePath);
  } catch (error) {
    return {
      status: 'failed',
      asset: null,
      reason: error instanceof Error ? error.message : 'Checksum failed',
    };
  }

  const id = assetIdFromChecksum(checksum);

  let preserved;
  try {
    preserved = await preserveOriginalExclusive({
      layout,
      sourcePath: input.sourcePath,
      filename,
      checksum,
    });
  } catch (error) {
    if (error instanceof VaultIntegrityConflictError) {
      return {
        status: 'integrity_conflict',
        asset: null,
        reason: error.message,
      };
    }
    return {
      status: 'failed',
      asset: null,
      reason:
        error instanceof Error ? error.message : 'Preserve original failed',
    };
  }

  const complete =
    detected.mediaKind === 'image'
      ? await imageDerivativesComplete(layout, id)
      : await videoDerivativesComplete(layout, id);

  // Idempotent no-op: original already present + derivatives complete + no force.
  if (!preserved.created && complete && !forceRegenerate) {
    const stat = await fs.stat(preserved.absolutePath);
    const derivatives = expectedDerivativePaths(id, detected.mediaKind);
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
    } else {
      const { probeVideo } =
        await import('@/lib/media-vault/derivatives/video');
      videoMeta = await probeVideo(preserved.absolutePath);
      width = videoMeta.width ?? undefined;
      height = videoMeta.height ?? undefined;
      orientation =
        width && height
          ? width === height
            ? 'square'
            : width > height
              ? 'landscape'
              : 'portrait'
          : 'unknown';
    }

    const asset = toAssetRecord({
      id,
      filename,
      mimeType: detected.mimeType,
      mediaKind: detected.mediaKind,
      folder,
      checksum,
      absolutePath: preserved.absolutePath,
      relativePath: preserved.relativePath,
      derivatives,
      width,
      height,
      orientation,
      hasExif,
      exifDate,
      camera,
      videoMeta,
      notes:
        'Original already present; derivatives complete — idempotent no-op.',
      fileSizeBytes: stat.size,
    });
    return { status: 'already_present', asset };
  }

  // Original present but derivatives missing: only repair when explicitly requested.
  if (!preserved.created && !complete && !repair && !forceRegenerate) {
    const stat = await fs.stat(preserved.absolutePath);
    const asset = toAssetRecord({
      id,
      filename,
      mimeType: detected.mimeType,
      mediaKind: detected.mediaKind,
      folder,
      checksum,
      absolutePath: preserved.absolutePath,
      relativePath: preserved.relativePath,
      derivatives: {},
      width: undefined,
      height: undefined,
      orientation: 'unknown',
      hasExif: false,
      notes:
        'Original already present; derivatives incomplete. Pass repairDerivatives to generate missing copies.',
      fileSizeBytes: stat.size,
    });
    return { status: 'already_present', asset };
  }

  try {
    const built = await buildDerivatives({
      layout,
      assetId: id,
      absolutePath: preserved.absolutePath,
      mediaKind: detected.mediaKind,
      repair: repair || preserved.created,
      forceRegenerate,
    });
    const stat = await fs.stat(preserved.absolutePath);
    const asset = toAssetRecord({
      id,
      filename,
      mimeType: detected.mimeType,
      mediaKind: detected.mediaKind,
      folder,
      checksum,
      absolutePath: preserved.absolutePath,
      relativePath: preserved.relativePath,
      derivatives: built.derivatives,
      width: built.width,
      height: built.height,
      orientation: built.orientation,
      hasExif: built.hasExif,
      exifDate: built.exifDate,
      camera: built.camera,
      videoMeta: built.videoMeta,
      notes: preserved.created
        ? 'Ingested into media vault (original preserved write-once).'
        : 'Original already present; missing derivatives repaired.',
      fileSizeBytes: stat.size,
    });

    if (preserved.created) {
      return { status: 'ingested', asset };
    }
    return {
      status: 'derivatives_repaired',
      asset,
      reason: forceRegenerate
        ? 'force-regenerated-derivatives'
        : 'missing-derivatives-repaired',
    };
  } catch (error) {
    return {
      status: 'failed',
      asset: null,
      reason:
        error instanceof Error ? error.message : 'Derivative generation failed',
    };
  }
}

export async function ingestDirectory(input: {
  readonly sourceDir: string;
  readonly vaultRoot?: string;
  readonly limit?: number;
  readonly repairDerivatives?: boolean;
  readonly forceRegenerateDerivatives?: boolean;
}): Promise<IngestBatchResult> {
  const started = performance.now();
  const layout = getVaultLayout(input.vaultRoot ?? resolveVaultRoot());
  await fs.mkdir(layout.originals, { recursive: true });
  await fs.mkdir(layout.manifests, { recursive: true });

  const assets: VaultAssetRecord[] = [];
  const errors: string[] = [];
  let processed = 0;
  let ingested = 0;
  let alreadyPresent = 0;
  let derivativesRepaired = 0;
  let rejected = 0;
  let integrityConflicts = 0;
  let failed = 0;

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
        repairDerivatives: input.repairDerivatives,
        forceRegenerateDerivatives: input.forceRegenerateDerivatives,
      });

      switch (result.status) {
        case 'ingested':
          ingested += 1;
          if (result.asset) assets.push(result.asset);
          break;
        case 'already_present':
          alreadyPresent += 1;
          if (result.asset) assets.push(result.asset);
          break;
        case 'derivatives_repaired':
          derivativesRepaired += 1;
          if (result.asset) assets.push(result.asset);
          break;
        case 'rejected':
          rejected += 1;
          errors.push(
            `${path.basename(filePath)}: ${result.reason ?? 'rejected'}`,
          );
          break;
        case 'integrity_conflict':
          integrityConflicts += 1;
          errors.push(
            `${path.basename(filePath)}: ${result.reason ?? 'integrity conflict'}`,
          );
          break;
        case 'failed':
          failed += 1;
          errors.push(
            `${path.basename(filePath)}: ${result.reason ?? 'failed'}`,
          );
          break;
      }
    } catch (error) {
      failed += 1;
      errors.push(
        `${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Only merge successfully recorded assets into the manifest.
  if (assets.length > 0) {
    await mergeVaultManifestAtomic({ layout, incoming: assets });
  }

  const logLine = JSON.stringify({
    at: new Date().toISOString(),
    sourceDir: input.sourceDir,
    processed,
    ingested,
    alreadyPresent,
    derivativesRepaired,
    rejected,
    integrityConflicts,
    failed,
  });
  await fs.appendFile(
    path.join(layout.manifests, 'ingestion_log.jsonl'),
    `${logLine}\n`,
  );

  return {
    processed,
    ingested,
    alreadyPresent,
    derivativesRepaired,
    rejected,
    integrityConflicts,
    failed,
    errors,
    assets,
    durationMs: performance.now() - started,
  };
}
