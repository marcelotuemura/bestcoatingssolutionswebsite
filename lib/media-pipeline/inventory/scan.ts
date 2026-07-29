/**
 * Build a deterministic media inventory from data/pictures.
 * Never modifies originals.
 */

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sha256File } from '@/lib/media-vault/checksum';
import { readImageExif } from '@/lib/media-vault/exif';
import {
  LOW_RESOLUTION_MIN_EDGE,
  LOW_RESOLUTION_MIN_MEGAPIXELS,
  MEDIA_ARCHIVE_ROOT,
  MEDIA_MANIFEST_PATH,
} from '@/lib/media-pipeline/constants';
import { discoverMediaFiles } from '@/lib/media-pipeline/inventory/discover';
import {
  detectGpsExif,
  defaultPrivacyChecklist,
} from '@/lib/media-pipeline/privacy';
import type {
  MediaAssetRecord,
  MediaManifest,
  MediaOrientation,
} from '@/lib/media-pipeline/types';
import { mediaManifestSchema } from '@/lib/media-pipeline/types';

export type InventoryScanOptions = {
  readonly repoRoot: string;
  readonly archiveRootRelative?: string;
  /** Fixed timestamp for deterministic tests. */
  readonly importedAt?: string;
  readonly generatedAt?: string;
};

function assetIdFromChecksum(checksum: string): string {
  return `pic_${checksum.slice(0, 16)}`;
}

function isLowResolution(width: number | null, height: number | null): boolean {
  if (!width || !height) return false;
  const minEdge = Math.min(width, height);
  const megapixels = (width * height) / 1_000_000;
  return (
    minEdge < LOW_RESOLUTION_MIN_EDGE ||
    megapixels < LOW_RESOLUTION_MIN_MEGAPIXELS
  );
}

function orientationOf(
  width: number | null,
  height: number | null,
): MediaOrientation {
  if (!width || !height) return 'unknown';
  if (width === height) return 'square';
  return width > height ? 'landscape' : 'portrait';
}

export async function scanMediaArchive(
  options: InventoryScanOptions,
): Promise<MediaManifest> {
  const archiveRootRelative = options.archiveRootRelative ?? MEDIA_ARCHIVE_ROOT;
  const archiveRootAbsolute = path.join(options.repoRoot, archiveRootRelative);
  const importedAt = options.importedAt ?? new Date().toISOString();
  const generatedAt = options.generatedAt ?? importedAt;

  const discovered = await discoverMediaFiles({
    archiveRootAbsolute,
    archiveRootRelative,
    repoRoot: options.repoRoot,
  });

  const assets: MediaAssetRecord[] = [];

  for (const file of discovered) {
    const checksum = await sha256File(file.absolutePath);
    const stat = await fs.stat(file.absolutePath);

    let width: number | null = null;
    let height: number | null = null;
    let orientation: MediaOrientation = 'unknown';
    let capturedAt: string | null = null;
    let hasExif = false;
    let hasGpsExif = false;
    let unsupportedFormat = !file.supported;

    if (file.supported) {
      try {
        const exif = await readImageExif(file.absolutePath);
        width = exif.width ?? null;
        height = exif.height ?? null;
        orientation =
          (exif.orientation as MediaOrientation) ??
          orientationOf(width, height);
        capturedAt = exif.exifDate ?? null;
        hasExif = exif.hasExif;
        hasGpsExif = await detectGpsExif(file.absolutePath);
      } catch {
        unsupportedFormat = true;
      }
    }

    const lowResolution = isLowResolution(width, height);
    const checklist = {
      ...defaultPrivacyChecklist(),
      gpsMetadata: hasGpsExif,
    };

    assets.push({
      id: assetIdFromChecksum(checksum),
      projectSlug: file.projectSlug,
      division: 'unknown',
      originalFilename: file.originalFilename,
      archivePath: file.archivePath,
      publishedPath: null,
      mimeType: file.mimeType,
      width,
      height,
      fileSizeBytes: stat.size,
      orientation,
      checksum,
      perceptualHash: null,
      importedAt,
      capturedAt,
      status: 'imported',
      stage: 'unknown',
      category: 'unknown',
      manufacturer: null,
      vesselModel: null,
      year: null,
      photographer: null,
      privacyStatus: hasGpsExif ? 'review-required' : 'unchecked',
      qualityStatus: lowResolution ? 'low-resolution' : 'unchecked',
      publishStatus: 'not-published',
      featured: false,
      heroCandidate: false,
      altText: null,
      caption: null,
      notes: null,
      sourceAlbum: file.sourceAlbum,
      derivatives: [],
      approval: {
        approvedAt: null,
        approvedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
      },
      privacyChecklist: checklist,
      flags: {
        lowResolution,
        exactDuplicate: false,
        unsupportedFormat,
        hasGpsExif,
        hasExif,
        duplicateOfIds: [],
      },
    });
  }

  // Exact duplicate detection by checksum (never auto-delete)
  const byChecksum = new Map<string, string[]>();
  for (const asset of assets) {
    const list = byChecksum.get(asset.checksum) ?? [];
    list.push(asset.id);
    byChecksum.set(asset.checksum, list);
  }

  const withDuplicates = assets.map((asset) => {
    const group = byChecksum.get(asset.checksum) ?? [asset.id];
    if (group.length <= 1) return asset;
    return {
      ...asset,
      qualityStatus:
        asset.qualityStatus === 'unchecked'
          ? ('duplicate' as const)
          : asset.qualityStatus,
      flags: {
        ...asset.flags,
        exactDuplicate: true,
        duplicateOfIds: group.filter((id) => id !== asset.id),
      },
    };
  });

  // Deterministic asset order: archivePath
  withDuplicates.sort((a, b) => a.archivePath.localeCompare(b.archivePath));

  const projectMap = new Map<string, number>();
  for (const asset of withDuplicates) {
    projectMap.set(
      asset.projectSlug,
      (projectMap.get(asset.projectSlug) ?? 0) + 1,
    );
  }
  const projects = [...projectMap.entries()]
    .map(([slug, assetCount]) => ({
      slug,
      assetCount,
      archivePath: `${archiveRootRelative}/${slug}`,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  let duplicateGroupCount = 0;
  for (const ids of byChecksum.values()) {
    if (ids.length > 1) duplicateGroupCount += 1;
  }

  const manifest: MediaManifest = {
    version: 1,
    generatedAt,
    archiveRoot: archiveRootRelative,
    assetCount: withDuplicates.length,
    projectCount: projects.length,
    duplicateGroupCount,
    lowResolutionCount: withDuplicates.filter((a) => a.flags.lowResolution)
      .length,
    unsupportedCount: withDuplicates.filter((a) => a.flags.unsupportedFormat)
      .length,
    gpsExifCount: withDuplicates.filter((a) => a.flags.hasGpsExif).length,
    projects,
    assets: withDuplicates,
  };

  return mediaManifestSchema.parse(manifest);
}

/** Content fingerprint independent of generatedAt / importedAt for tests. */
export function manifestContentFingerprint(manifest: MediaManifest): string {
  const payload = {
    archiveRoot: manifest.archiveRoot,
    projects: manifest.projects,
    assets: manifest.assets.map((a) => ({
      id: a.id,
      archivePath: a.archivePath,
      checksum: a.checksum,
      width: a.width,
      height: a.height,
      flags: a.flags,
      privacyStatus: a.privacyStatus,
      qualityStatus: a.qualityStatus,
    })),
  };
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function writeMediaManifest(
  repoRoot: string,
  manifest: MediaManifest,
  outputRelative: string = MEDIA_MANIFEST_PATH,
): Promise<string> {
  const outPath = path.join(repoRoot, outputRelative);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  await fs.writeFile(outPath, json, 'utf8');
  return outPath;
}

export async function readMediaManifest(
  repoRoot: string,
  relativePath: string = MEDIA_MANIFEST_PATH,
): Promise<MediaManifest | null> {
  const full = path.join(repoRoot, relativePath);
  try {
    const raw = await fs.readFile(full, 'utf8');
    return mediaManifestSchema.parse(JSON.parse(raw));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw err;
  }
}
