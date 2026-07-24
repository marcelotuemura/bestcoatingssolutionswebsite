import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import type { CatalogProject } from '@/lib/media-library/catalog-schema';
import type { DuplicateGroup } from '@/lib/media-library/catalog-schema';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';
import {
  buildDerivativeObjectKey,
  buildOriginalObjectKey,
  bucketForKind,
} from '@/lib/media-intelligence/storage/object-keys';

export type MigrationPlanItem =
  | {
      readonly type: 'asset';
      readonly externalId: string;
      readonly checksum?: string;
      readonly originalKey?: string;
      readonly derivativeKeys: readonly string[];
    }
  | {
      readonly type: 'project';
      readonly externalId: string;
    }
  | {
      readonly type: 'duplicate_group';
      readonly externalId: string;
    }
  | {
      readonly type: 'ai_analysis';
      readonly assetExternalId: string;
      readonly provider: string;
      readonly analysisVersion: string;
    };

export type MigrationPlan = {
  readonly destinationProjectRef: string;
  readonly isProductionTarget: boolean;
  readonly isFixtureCatalog: boolean;
  readonly dryRun: boolean;
  readonly items: readonly MigrationPlanItem[];
  readonly counts: {
    readonly assets: number;
    readonly projects: number;
    readonly duplicateGroups: number;
    readonly aiAnalyses: number;
    readonly originalUploads: number;
    readonly derivativeUploads: number;
  };
  readonly warnings: readonly string[];
};

export function mapAssetToDbRow(asset: CatalogAsset) {
  return {
    external_id: asset.id,
    filename: asset.filename,
    original_filename: asset.originalFilename,
    file_type: asset.fileType,
    media_kind: asset.mediaKind,
    folder: asset.folder ?? '',
    project_external_id: asset.projectId ?? null,
    project_name: asset.projectName ?? null,
    manufacturer: asset.manufacturer ?? null,
    boat_name: asset.boatName ?? null,
    boat_type: asset.boatType ?? null,
    repair_category: asset.repairCategory ?? null,
    stage: asset.stage,
    keywords: asset.keywords ?? [],
    camera: asset.camera ?? null,
    exif_date: asset.exifDate ?? null,
    has_exif: asset.hasExif,
    width: asset.width ?? null,
    height: asset.height ?? null,
    resolution: asset.resolution ?? null,
    orientation: asset.orientation,
    checksum: asset.checksum ?? asset.sha256 ?? null,
    file_size_bytes: asset.fileSizeBytes ?? null,
    score_website: asset.scores.website,
    score_marketing: asset.scores.marketing,
    score_technical: asset.scores.technical,
    score_quality: asset.scores.quality ?? null,
    score_seo: asset.scores.seo ?? null,
    score_social: asset.scores.social ?? null,
    score_overall: asset.scores.overall ?? null,
    privacy_status: asset.privacyStatus,
    privacy_issues: asset.privacyIssues ?? [],
    is_hero_candidate: asset.isHeroCandidate,
    is_exact_duplicate: asset.isExactDuplicate,
    is_near_duplicate: asset.isNearDuplicate,
    duplicate_group_external_id: asset.duplicateGroupId ?? null,
    near_duplicate_group_external_id: asset.nearDuplicateGroupId ?? null,
    recommendations: asset.recommendations ?? null,
    video_meta: asset.videoMeta ?? null,
    notes: asset.notes ?? null,
    source_system: 'migration',
    storage_bucket:
      asset.sha256 || asset.checksum ? bucketForKind('original') : null,
    storage_object_key:
      asset.sha256 || asset.checksum
        ? buildOriginalObjectKey({
            checksum: (asset.sha256 ?? asset.checksum)!,
            filename: asset.filename,
          })
        : null,
  };
}

export function mapProjectToDbRow(project: CatalogProject) {
  return {
    external_id: project.id,
    name: project.name,
    manufacturer: project.manufacturer ?? null,
    boat_name: project.boatName ?? null,
    boat_type: project.boatType ?? null,
    repair_category: project.repairCategory ?? null,
    folder: project.folder ?? null,
    media_count: project.mediaCount,
    image_count: project.imageCount,
    video_count: project.videoCount,
    before_count: project.beforeCount,
    during_count: project.duringCount,
    after_count: project.afterCount,
    best_website_asset_external_id: project.bestWebsiteAssetId ?? null,
    best_social_asset_external_id: project.bestSocialAssetId ?? null,
    top_hero_asset_external_id: project.topHeroAssetId ?? null,
    duplicate_alert_count: project.duplicateAlertCount,
    privacy_alert_count: project.privacyAlertCount,
    average_website_score: project.averageWebsiteScore ?? null,
    average_marketing_score: project.averageMarketingScore ?? null,
    average_technical_score: project.averageTechnicalScore ?? null,
    timeline_start: project.timelineStart ?? null,
    timeline_end: project.timelineEnd ?? null,
    notes: project.notes ?? null,
    source_system: 'migration',
  };
}

export function mapDuplicateGroupToDbRow(group: DuplicateGroup) {
  return {
    external_id: group.id,
    kind: group.kind,
    similarity: group.similarity,
    recommended_keep_asset_external_id: group.recommendedKeepAssetId ?? null,
    notes: group.notes ?? null,
  };
}

export function buildMigrationPlan(input: {
  readonly assets: readonly CatalogAsset[];
  readonly projects: readonly CatalogProject[];
  readonly duplicates: readonly DuplicateGroup[];
  readonly analyses: readonly AssetVisionAnalysis[];
  readonly destinationProjectRef: string;
  readonly isProductionTarget: boolean;
  readonly isFixtureCatalog: boolean;
  readonly dryRun: boolean;
  readonly allowFixtures?: boolean;
}): MigrationPlan {
  const warnings: string[] = [];
  if (input.isFixtureCatalog && !input.allowFixtures) {
    warnings.push(
      'Fixture catalog detected — execution blocked unless --allow-fixtures is set (non-production only).',
    );
  }
  if (input.isProductionTarget && input.isFixtureCatalog) {
    warnings.push(
      'Refusing fixture migration to production regardless of flags.',
    );
  }

  const items: MigrationPlanItem[] = [];
  let originalUploads = 0;
  let derivativeUploads = 0;

  for (const asset of input.assets) {
    const checksum = asset.sha256 ?? asset.checksum;
    const derivativeKeys: string[] = [];
    if (asset.derivatives?.thumbnails) {
      for (const size of [200, 400, 800, 1600] as const) {
        if (asset.derivatives.thumbnails[size]) {
          derivativeKeys.push(
            buildDerivativeObjectKey({
              assetExternalId: asset.id,
              kind: 'thumbnail',
              size,
              extension: '.jpg',
            }),
          );
        }
      }
    }
    for (const kind of ['webp', 'avif', 'preview', 'poster'] as const) {
      if (asset.derivatives?.[kind]) {
        derivativeKeys.push(
          buildDerivativeObjectKey({
            assetExternalId: asset.id,
            kind,
            extension:
              kind === 'webp' ? '.webp' : kind === 'avif' ? '.avif' : '.jpg',
          }),
        );
      }
    }
    if (checksum) originalUploads += 1;
    derivativeUploads += derivativeKeys.length;
    items.push({
      type: 'asset',
      externalId: asset.id,
      checksum: checksum ?? undefined,
      originalKey: checksum
        ? buildOriginalObjectKey({ checksum, filename: asset.filename })
        : undefined,
      derivativeKeys,
    });
  }

  for (const project of input.projects) {
    items.push({ type: 'project', externalId: project.id });
  }
  for (const group of input.duplicates) {
    items.push({ type: 'duplicate_group', externalId: group.id });
  }
  for (const analysis of input.analyses) {
    items.push({
      type: 'ai_analysis',
      assetExternalId: analysis.assetId,
      provider: analysis.provider,
      analysisVersion: analysis.analysisVersion,
    });
  }

  return {
    destinationProjectRef: input.destinationProjectRef,
    isProductionTarget: input.isProductionTarget,
    isFixtureCatalog: input.isFixtureCatalog,
    dryRun: input.dryRun,
    items,
    counts: {
      assets: input.assets.length,
      projects: input.projects.length,
      duplicateGroups: input.duplicates.length,
      aiAnalyses: input.analyses.length,
      originalUploads,
      derivativeUploads,
    },
    warnings,
  };
}

export async function sha256File(filePath: string): Promise<string> {
  const buf = await fs.readFile(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

export function resolveLocalCatalogPaths(catalogDir: string) {
  return {
    catalog: path.join(catalogDir, 'media_catalog.json'),
    projects: path.join(catalogDir, 'projects_report.json'),
    duplicates: path.join(catalogDir, 'duplicates_report.json'),
    aiAnalysis: path.join(catalogDir, 'ai_analysis.json'),
  };
}
