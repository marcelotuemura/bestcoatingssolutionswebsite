/**
 * Photo upload limits for the estimate request form.
 * Binaries go to Vercel Blob only when delivery is enabled and
 * `BLOB_READ_WRITE_TOKEN` is configured; otherwise client validation + email metadata.
 */
export const estimateUploadPolicy = {
  maxFiles: 8,
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
  acceptedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ] as const,
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'],
  acceptAttribute:
    'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif',
} as const;

export type EstimateUploadPolicy = typeof estimateUploadPolicy;
