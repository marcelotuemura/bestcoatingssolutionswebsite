import { z } from 'zod';

/**
 * Catalog schemas for Phase 2 Interactive Media Library.
 * Source of truth: indexing engine reports under 08_Reports/
 * (media_catalog.json, projects_report.json, duplicates_report.json, search_index.json).
 *
 * Read-only. Never mutates originals.
 */

export const catalogStageSchema = z.enum([
  'before',
  'during',
  'after',
  'detail',
  'context',
  'material',
  'unknown',
]);

export const catalogMediaKindSchema = z.enum(['image', 'video']);

export const catalogOrientationSchema = z.enum([
  'landscape',
  'portrait',
  'square',
  'unknown',
]);

export const catalogPrivacyStatusSchema = z.enum([
  'clear',
  'warning',
  'blocked',
]);

export const catalogScoresSchema = z.object({
  website: z.number().min(0).max(100),
  marketing: z.number().min(0).max(100),
  technical: z.number().min(0).max(100),
  quality: z.number().min(0).max(100).optional(),
  seo: z.number().min(0).max(100).optional(),
  social: z.number().min(0).max(100).optional(),
  overall: z.number().min(0).max(100).optional(),
});

export const catalogRecommendationsSchema = z.object({
  website: z.string().optional(),
  marketing: z.string().optional(),
  seo: z.string().optional(),
});

export const catalogAssetSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  originalFilename: z.string().min(1),
  fileType: z.string().min(1),
  mediaKind: catalogMediaKindSchema,
  folder: z.string().default(''),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  manufacturer: z.string().optional(),
  boatName: z.string().optional(),
  boatType: z.string().optional(),
  repairCategory: z.string().optional(),
  stage: catalogStageSchema.default('unknown'),
  keywords: z.array(z.string()).default([]),
  camera: z.string().optional(),
  exifDate: z.string().optional(),
  hasExif: z.boolean().default(false),
  width: z.number().int().nonnegative().optional(),
  height: z.number().int().nonnegative().optional(),
  resolution: z.string().optional(),
  orientation: catalogOrientationSchema.default('unknown'),
  checksum: z.string().optional(),
  fileSizeBytes: z.number().nonnegative().optional(),
  scores: catalogScoresSchema,
  privacyStatus: catalogPrivacyStatusSchema.default('clear'),
  privacyIssues: z.array(z.string()).default([]),
  isHeroCandidate: z.boolean().default(false),
  duplicateGroupId: z.string().nullable().optional(),
  nearDuplicateGroupId: z.string().nullable().optional(),
  isExactDuplicate: z.boolean().default(false),
  isNearDuplicate: z.boolean().default(false),
  thumbnailPath: z.string().nullable().optional(),
  previewPath: z.string().nullable().optional(),
  recommendations: catalogRecommendationsSchema.optional(),
  indexedAt: z.string().optional(),
  notes: z.string().optional(),
  /** Phase 3 vault fields (optional; ignored by Phase 2 UI when absent). */
  originalRelativePath: z.string().optional(),
  sha256: z.string().optional(),
  ingestedAt: z.string().optional(),
  derivatives: z
    .object({
      thumbnails: z
        .object({
          200: z.string().optional(),
          400: z.string().optional(),
          800: z.string().optional(),
          1600: z.string().optional(),
        })
        .partial()
        .optional(),
      webp: z.string().optional(),
      avif: z.string().optional(),
      preview: z.string().optional(),
      poster: z.string().optional(),
    })
    .optional(),
  videoMeta: z
    .object({
      durationSeconds: z.number().nullable(),
      width: z.number().nullable(),
      height: z.number().nullable(),
      codec: z.string().nullable(),
      container: z.string().nullable(),
      frameRate: z.number().nullable(),
    })
    .optional(),
});

export const mediaCatalogSchema = z.object({
  generatedAt: z.string(),
  version: z.string().default('1.0'),
  source: z.string().optional(),
  isFixture: z.boolean().optional(),
  assets: z.array(catalogAssetSchema),
});

export const catalogProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  manufacturer: z.string().optional(),
  boatName: z.string().optional(),
  boatType: z.string().optional(),
  repairCategory: z.string().optional(),
  folder: z.string().optional(),
  mediaCount: z.number().int().nonnegative(),
  imageCount: z.number().int().nonnegative().default(0),
  videoCount: z.number().int().nonnegative().default(0),
  beforeCount: z.number().int().nonnegative().default(0),
  duringCount: z.number().int().nonnegative().default(0),
  afterCount: z.number().int().nonnegative().default(0),
  bestWebsiteAssetId: z.string().optional(),
  bestSocialAssetId: z.string().optional(),
  topHeroAssetId: z.string().optional(),
  duplicateAlertCount: z.number().int().nonnegative().default(0),
  privacyAlertCount: z.number().int().nonnegative().default(0),
  averageWebsiteScore: z.number().min(0).max(100).optional(),
  averageMarketingScore: z.number().min(0).max(100).optional(),
  averageTechnicalScore: z.number().min(0).max(100).optional(),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
  notes: z.string().optional(),
  assetIds: z.array(z.string()).default([]),
});

export const projectsReportSchema = z.object({
  generatedAt: z.string(),
  version: z.string().default('1.0'),
  isFixture: z.boolean().optional(),
  projects: z.array(catalogProjectSchema),
});

export const duplicateMemberSchema = z.object({
  assetId: z.string(),
  filename: z.string().optional(),
  role: z.enum(['original', 'copy', 'candidate']).default('copy'),
});

export const duplicateGroupSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['exact', 'near']),
  similarity: z.number().min(0).max(1),
  recommendedKeepAssetId: z.string().optional(),
  members: z.array(duplicateMemberSchema).min(2),
  notes: z.string().optional(),
});

export const duplicatesReportSchema = z.object({
  generatedAt: z.string(),
  version: z.string().default('1.0'),
  isFixture: z.boolean().optional(),
  groups: z.array(duplicateGroupSchema),
});

export const searchIndexEntrySchema = z.object({
  id: z.string(),
  text: z.string(),
  tokens: z.array(z.string()).default([]),
});

export const searchIndexSchema = z.object({
  generatedAt: z.string(),
  version: z.string().default('1.0'),
  isFixture: z.boolean().optional(),
  entries: z.array(searchIndexEntrySchema),
});

export type CatalogStage = z.infer<typeof catalogStageSchema>;
export type CatalogMediaKind = z.infer<typeof catalogMediaKindSchema>;
export type CatalogOrientation = z.infer<typeof catalogOrientationSchema>;
export type CatalogPrivacyStatus = z.infer<typeof catalogPrivacyStatusSchema>;
export type CatalogScores = z.infer<typeof catalogScoresSchema>;
export type CatalogAsset = z.infer<typeof catalogAssetSchema>;
export type MediaCatalog = z.infer<typeof mediaCatalogSchema>;
export type CatalogProject = z.infer<typeof catalogProjectSchema>;
export type ProjectsReport = z.infer<typeof projectsReportSchema>;
export type DuplicateGroup = z.infer<typeof duplicateGroupSchema>;
export type DuplicatesReport = z.infer<typeof duplicatesReportSchema>;
export type SearchIndex = z.infer<typeof searchIndexSchema>;
