/**
 * Phase 7 — Visual DAMS Gallery domain types.
 * Never persist signed URLs. Never expose service role to client.
 */

import { z } from 'zod';

export const galleryMediaKindSchema = z.enum(['image', 'video']);
export type GalleryMediaKind = z.infer<typeof galleryMediaKindSchema>;

export const galleryPrivacyStatusSchema = z.enum([
  'clear',
  'flagged',
  'blocked',
  'reviewed',
]);
export type GalleryPrivacyStatus = z.infer<typeof galleryPrivacyStatusSchema>;

export const galleryReviewStatusSchema = z.enum([
  'none',
  'pending',
  'in_review',
  'approved',
  'rejected',
]);
export type GalleryReviewStatus = z.infer<typeof galleryReviewStatusSchema>;

export const galleryAssetSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  workspaceId: z.string(),
  filename: z.string(),
  originalFilename: z.string(),
  fileType: z.string(),
  mediaKind: galleryMediaKindSchema,
  checksum: z.string(),
  fileSizeBytes: z.number().int().positive(),
  storageBucket: z.string().nullable().optional(),
  storageObjectKey: z.string().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  orientation: z.string().nullable().optional(),
  displayTitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  creatorName: z.string().nullable().optional(),
  captureDate: z.string().nullable().optional(),
  customerNotes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  privacyStatus: galleryPrivacyStatusSchema,
  reviewStatus: galleryReviewStatusSchema,
  archivedAt: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isFavorite: z.boolean().optional(),
  /** Vault-relative path to thumbnail (never a signed URL). */
  thumbnailPath: z.string().nullable().optional(),
  collectionIds: z.array(z.string()).optional(),
});
export type GalleryAsset = z.infer<typeof galleryAssetSchema>;

export const galleryCollectionSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  description: z.string(),
  coverAssetExternalId: z.string().nullable().optional(),
  archivedAt: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  assetCount: z.number().optional(),
});
export type GalleryCollection = z.infer<typeof galleryCollectionSchema>;

export const galleryEventSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  actorId: z.string().nullable().optional(),
  action: z.string(),
  assetExternalId: z.string().nullable().optional(),
  collectionId: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string(),
});
export type GalleryEvent = z.infer<typeof galleryEventSchema>;

export const galleryFavoriteSchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
  assetExternalId: z.string(),
  createdAt: z.string(),
});
export type GalleryFavorite = z.infer<typeof galleryFavoriteSchema>;

export const gallerySortSchema = z.enum([
  'created_desc',
  'created_asc',
  'updated_desc',
  'title_asc',
  'size_desc',
  'capture_date_desc',
]);
export type GallerySort = z.infer<typeof gallerySortSchema>;

export const galleryListParamsSchema = z.object({
  workspaceId: z.string().default('bcs-default'),
  q: z.string().optional(),
  kind: galleryMediaKindSchema.optional(),
  privacy: galleryPrivacyStatusSchema.optional(),
  reviewStatus: galleryReviewStatusSchema.optional(),
  duplicate: z.boolean().optional(),
  onlyFavorites: z.boolean().optional(),
  collectionId: z.string().optional(),
  archived: z.boolean().default(false),
  sort: gallerySortSchema.default('created_desc'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(200).default(48),
});
export type GalleryListParams = z.infer<typeof galleryListParamsSchema>;

export type GalleryListResult = {
  readonly assets: readonly GalleryAsset[];
  readonly total: number;
  readonly page: number;
  readonly pageCount: number;
  readonly durationMs: number;
};

export type GalleryUploadOutcome =
  'created' | 'duplicate_existing' | 'rejected' | 'failed';

export type GalleryUploadResult =
  | {
      readonly ok: true;
      readonly outcome: 'created' | 'duplicate_existing';
      readonly assetId: string;
      readonly checksum: string;
      /** @deprecated prefer outcome === 'duplicate_existing' */
      readonly duplicate: boolean;
      readonly processingComplete?: boolean;
    }
  | {
      readonly ok: false;
      readonly outcome: 'rejected' | 'failed';
      readonly error: string;
      readonly status: number;
    };

export type GalleryMetadataInput = {
  readonly displayTitle?: string;
  readonly description?: string;
  readonly tags?: string[];
  readonly projectName?: string;
  readonly vessel?: string;
  readonly location?: string;
  readonly creatorName?: string;
  readonly captureDate?: string;
  readonly customerNotes?: string;
  readonly internalNotes?: string;
};

export type BulkActionResult = {
  readonly ok: boolean;
  readonly affected: number;
  readonly error?: string;
};
