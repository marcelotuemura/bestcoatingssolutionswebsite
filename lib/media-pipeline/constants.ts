/** Phase 2A constants — archive layout and inventory thresholds. */

export const MEDIA_ARCHIVE_ROOT = 'data/pictures';
export const MEDIA_MANIFEST_PATH = 'data/media-manifest.json';
export const MEDIA_REVIEW_STATE_PATH = 'data/media-review-state.json';
export const MEDIA_PUBLISH_ROOT = 'public/images';

/** Supported still formats for inventory (HEIC when sharp/libvips allows). */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
] as const;

/** Recognized image extensions that are inventoried but flagged unsupported. */
export const UNSUPPORTED_IMAGE_EXTENSIONS = [
  '.tif',
  '.tiff',
  '.gif',
  '.bmp',
  '.avif',
] as const;

export const INVENTORY_IMAGE_EXTENSIONS = [
  ...SUPPORTED_IMAGE_EXTENSIONS,
  ...UNSUPPORTED_IMAGE_EXTENSIONS,
] as const;

export const SUPPORTED_MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

/**
 * Low-resolution threshold: shortest edge below this (px) is flagged.
 * Does not auto-reject — operator decides.
 */
export const LOW_RESOLUTION_MIN_EDGE = 800;

/** Absolute minimum megapixels before flagging (640×480 ≈ 0.307). */
export const LOW_RESOLUTION_MIN_MEGAPIXELS = 0.5;

export const ARCHIVE_RULES = {
  originalsImmutable: true,
  neverAutoDelete: true,
  neverPublishFromArchiveDirectly: true,
  neverInventBeforeAfter: true,
  requirePrivacyClearToPublish: true,
} as const;
