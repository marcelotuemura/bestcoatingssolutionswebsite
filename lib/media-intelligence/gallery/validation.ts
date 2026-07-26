import type {
  GalleryAsset,
  GalleryMetadataInput,
} from '@/lib/media-intelligence/gallery/types';

/** 500 MB hard limit per upload. */
export const GALLERY_MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

export const GALLERY_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
  'video/mp4',
  'video/quicktime',
]);

export function validateGalleryMimeType(
  mimeType: string,
): { ok: true } | { ok: false; error: string } {
  const normalized = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!GALLERY_ALLOWED_MIME_TYPES.has(normalized)) {
    return {
      ok: false,
      error: `Unsupported file type: ${mimeType}. Allowed: jpeg, png, webp, heic, heif, tiff, bmp, mp4, mov.`,
    };
  }
  return { ok: true };
}

export function validateGalleryFileSize(
  bytes: number,
): { ok: true } | { ok: false; error: string } {
  if (bytes <= 0) {
    return { ok: false, error: 'File is empty.' };
  }
  if (bytes > GALLERY_MAX_FILE_SIZE_BYTES) {
    const mb = Math.round(GALLERY_MAX_FILE_SIZE_BYTES / (1024 * 1024));
    return { ok: false, error: `File too large: maximum size is ${mb} MB.` };
  }
  return { ok: true };
}

export function sanitizeMetadataInput(
  input: GalleryMetadataInput,
): GalleryMetadataInput {
  return {
    displayTitle: input.displayTitle?.trim().slice(0, 160),
    description: input.description?.trim().slice(0, 4000),
    tags: input.tags?.map((t) => t.trim().slice(0, 80)).filter(Boolean),
    projectName: input.projectName?.trim().slice(0, 120),
    vessel: input.vessel?.trim().slice(0, 120),
    location: input.location?.trim().slice(0, 200),
    creatorName: input.creatorName?.trim().slice(0, 120),
    captureDate: input.captureDate,
    customerNotes: input.customerNotes?.trim().slice(0, 2000),
    internalNotes: input.internalNotes?.trim().slice(0, 2000),
  };
}

export function isPrivacyBlocked(asset: GalleryAsset): boolean {
  return asset.privacyStatus === 'flagged' || asset.privacyStatus === 'blocked';
}

export function canPreparePublicationForAsset(asset: GalleryAsset): boolean {
  return !isPrivacyBlocked(asset) && asset.archivedAt == null;
}

export function validateCollectionName(
  name: string,
): { ok: true } | { ok: false; error: string } {
  const trimmed = name.trim();
  if (trimmed.length < 1) {
    return { ok: false, error: 'Collection name is required.' };
  }
  if (trimmed.length > 160) {
    return {
      ok: false,
      error: 'Collection name must be 160 characters or fewer.',
    };
  }
  return { ok: true };
}

export function validateReviewDecision(
  decision: string,
): { ok: true } | { ok: false; error: string } {
  if (!['approve', 'reject', 'in_review'].includes(decision)) {
    return { ok: false, error: `Invalid review decision: ${decision}` };
  }
  return { ok: true };
}
