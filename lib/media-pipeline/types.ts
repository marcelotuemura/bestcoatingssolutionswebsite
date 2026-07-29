/**
 * BCS Media Pipeline — Phase 2A types.
 * Local-first inventory + review. Do not invent metadata.
 */

import { z } from 'zod';

export const mediaDivisionSchema = z.enum([
  'marine',
  'aviation',
  'commercial',
  'unknown',
]);

export const mediaStageSchema = z.enum([
  'before',
  'damage',
  'disassembly',
  'preparation',
  'fairing',
  'fiberglass',
  'masking',
  'primer',
  'paint',
  'gelcoat',
  'polishing',
  'ceramic-coating',
  'completed',
  'unknown',
]);

export const mediaAssetStatusSchema = z.enum([
  'imported',
  'analyzing',
  'needs-review',
  'approved',
  'rejected',
  'published',
  'archived',
]);

export const mediaPrivacyStatusSchema = z.enum([
  'unchecked',
  'clear',
  'review-required',
  'blocked',
]);

export const mediaQualityStatusSchema = z.enum([
  'unchecked',
  'acceptable',
  'blurry',
  'duplicate',
  'low-resolution',
  'overexposed',
  'underexposed',
]);

export const mediaPublishStatusSchema = z.enum([
  'not-published',
  'candidate',
  'queued',
  'published',
  'unpublished',
]);

export const mediaOrientationSchema = z.enum([
  'landscape',
  'portrait',
  'square',
  'unknown',
]);

export const mediaCategorySchema = z.enum([
  'hull',
  'hardtop',
  'deck',
  'interior',
  'detail',
  'process',
  'result',
  'context',
  'unknown',
]);

/** Manual privacy checklist — never claim automated completeness. */
export const privacyChecklistSchema = z.object({
  visibleFace: z.boolean().default(false),
  vesselRegistration: z.boolean().default(false),
  hin: z.boolean().default(false),
  licensePlate: z.boolean().default(false),
  customerDocument: z.boolean().default(false),
  invoice: z.boolean().default(false),
  address: z.boolean().default(false),
  gpsMetadata: z.boolean().default(false),
  otherPrivateInformation: z.boolean().default(false),
  reviewedAt: z.string().nullable().default(null),
  reviewedBy: z.string().nullable().default(null),
});

export const mediaDerivativeRecordSchema = z.object({
  kind: z.enum(['thumbnail', 'webp', 'avif', 'preview', 'poster']),
  path: z.string(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  bytes: z.number().int().nonnegative().nullable().optional(),
});

export const mediaApprovalMetadataSchema = z.object({
  approvedAt: z.string().nullable().default(null),
  approvedBy: z.string().nullable().default(null),
  rejectedAt: z.string().nullable().default(null),
  rejectedBy: z.string().nullable().default(null),
  rejectionReason: z.string().nullable().default(null),
});

export const mediaAssetRecordSchema = z.object({
  id: z.string().min(1),
  projectSlug: z.string().min(1),
  division: mediaDivisionSchema.default('unknown'),
  originalFilename: z.string().min(1),
  archivePath: z.string().min(1),
  publishedPath: z.string().nullable().default(null),
  mimeType: z.string().nullable().default(null),
  width: z.number().int().nonnegative().nullable().default(null),
  height: z.number().int().nonnegative().nullable().default(null),
  fileSizeBytes: z.number().int().nonnegative().nullable().default(null),
  orientation: mediaOrientationSchema.default('unknown'),
  checksum: z.string().min(1),
  /** Placeholder for future perceptual hashing — null in Phase 2A. */
  perceptualHash: z.string().nullable().default(null),
  importedAt: z.string(),
  capturedAt: z.string().nullable().default(null),
  status: mediaAssetStatusSchema.default('imported'),
  stage: mediaStageSchema.default('unknown'),
  category: mediaCategorySchema.default('unknown'),
  manufacturer: z.string().nullable().default(null),
  vesselModel: z.string().nullable().default(null),
  year: z.number().int().nullable().default(null),
  photographer: z.string().nullable().default(null),
  privacyStatus: mediaPrivacyStatusSchema.default('unchecked'),
  qualityStatus: mediaQualityStatusSchema.default('unchecked'),
  publishStatus: mediaPublishStatusSchema.default('not-published'),
  featured: z.boolean().default(false),
  heroCandidate: z.boolean().default(false),
  altText: z.string().nullable().default(null),
  caption: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  sourceAlbum: z.string().min(1),
  derivatives: z.array(mediaDerivativeRecordSchema).default([]),
  approval: mediaApprovalMetadataSchema.default({}),
  privacyChecklist: privacyChecklistSchema.default({}),
  /** Inventory-only signals — not operator decisions. */
  flags: z
    .object({
      lowResolution: z.boolean().default(false),
      exactDuplicate: z.boolean().default(false),
      unsupportedFormat: z.boolean().default(false),
      hasGpsExif: z.boolean().default(false),
      hasExif: z.boolean().default(false),
      duplicateOfIds: z.array(z.string()).default([]),
    })
    .default({}),
});

export const mediaManifestSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string(),
  archiveRoot: z.string(),
  assetCount: z.number().int().nonnegative(),
  projectCount: z.number().int().nonnegative(),
  duplicateGroupCount: z.number().int().nonnegative(),
  lowResolutionCount: z.number().int().nonnegative(),
  unsupportedCount: z.number().int().nonnegative(),
  gpsExifCount: z.number().int().nonnegative(),
  projects: z.array(
    z.object({
      slug: z.string(),
      assetCount: z.number().int().nonnegative(),
      archivePath: z.string(),
    }),
  ),
  assets: z.array(mediaAssetRecordSchema),
});

/**
 * Before/after pair — never auto-populated from filenames.
 * Requires explicit operator approval of match criteria.
 */
export const beforeAfterMatchCriteriaSchema = z.object({
  samePhysicalArea: z.boolean().default(false),
  similarFraming: z.boolean().default(false),
  similarCameraAngle: z.boolean().default(false),
  similarDistance: z.boolean().default(false),
  comparableOrientation: z.boolean().default(false),
  sufficientResolution: z.boolean().default(false),
  clearTemporalRelationship: z.boolean().default(false),
  noPrivacyBlocker: z.boolean().default(false),
});

export const beforeAfterPairRecordSchema = z.object({
  id: z.string().min(1),
  beforeAssetId: z.string().min(1),
  afterAssetId: z.string().min(1),
  projectSlug: z.string().min(1),
  criteria: beforeAfterMatchCriteriaSchema,
  approved: z.boolean().default(false),
  approvedAt: z.string().nullable().default(null),
  approvedBy: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
});

/** Operator review overlay — merges onto inventory without mutating originals. */
export const mediaReviewOverrideSchema = z.object({
  assetId: z.string().min(1),
  division: mediaDivisionSchema.optional(),
  stage: mediaStageSchema.optional(),
  category: mediaCategorySchema.optional(),
  status: mediaAssetStatusSchema.optional(),
  privacyStatus: mediaPrivacyStatusSchema.optional(),
  qualityStatus: mediaQualityStatusSchema.optional(),
  publishStatus: mediaPublishStatusSchema.optional(),
  featured: z.boolean().optional(),
  heroCandidate: z.boolean().optional(),
  altText: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  manufacturer: z.string().nullable().optional(),
  vesselModel: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  photographer: z.string().nullable().optional(),
  publishedPath: z.string().nullable().optional(),
  privacyChecklist: privacyChecklistSchema.partial().optional(),
  approval: mediaApprovalMetadataSchema.partial().optional(),
  updatedAt: z.string(),
  updatedBy: z.string().nullable().default(null),
});

export const mediaReviewStateSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  overrides: z.array(mediaReviewOverrideSchema).default([]),
  beforeAfterPairs: z.array(beforeAfterPairRecordSchema).default([]),
});

export type MediaDivision = z.infer<typeof mediaDivisionSchema>;
export type MediaStage = z.infer<typeof mediaStageSchema>;
export type MediaAssetStatus = z.infer<typeof mediaAssetStatusSchema>;
export type MediaPrivacyStatus = z.infer<typeof mediaPrivacyStatusSchema>;
export type MediaQualityStatus = z.infer<typeof mediaQualityStatusSchema>;
export type MediaPublishStatus = z.infer<typeof mediaPublishStatusSchema>;
export type MediaOrientation = z.infer<typeof mediaOrientationSchema>;
export type MediaCategory = z.infer<typeof mediaCategorySchema>;
export type PrivacyChecklist = z.infer<typeof privacyChecklistSchema>;
export type MediaAssetRecord = z.infer<typeof mediaAssetRecordSchema>;
export type MediaManifest = z.infer<typeof mediaManifestSchema>;
export type BeforeAfterPairRecord = z.infer<typeof beforeAfterPairRecordSchema>;
export type BeforeAfterMatchCriteria = z.infer<
  typeof beforeAfterMatchCriteriaSchema
>;
export type MediaReviewOverride = z.infer<typeof mediaReviewOverrideSchema>;
export type MediaReviewState = z.infer<typeof mediaReviewStateSchema>;
