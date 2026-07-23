import { put } from '@vercel/blob';
import { estimateUploadPolicy } from '@/config/estimate-upload';

export interface UploadedEstimatePhoto {
  readonly pathname: string;
  readonly url: string;
  readonly contentType: string;
  readonly size: number;
}

export function isBlobUploadConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80) || 'photo';
}

/**
 * Upload estimate photos to Vercel Blob when configured.
 * Returns empty array when Blob is not configured (metadata-only email path).
 */
export async function uploadEstimatePhotos(input: {
  readonly referenceId: string;
  readonly files: readonly File[];
}): Promise<readonly UploadedEstimatePhoto[]> {
  if (!isBlobUploadConfigured() || input.files.length === 0) {
    return [];
  }

  const uploaded: UploadedEstimatePhoto[] = [];
  for (const [index, file] of input.files.entries()) {
    if (file.size > estimateUploadPolicy.maxFileSizeBytes) {
      continue;
    }
    if (
      !(estimateUploadPolicy.acceptedMimeTypes as readonly string[]).includes(
        file.type,
      )
    ) {
      continue;
    }
    const pathname = `estimates/${input.referenceId}/${index}-${sanitizeFileName(file.name)}`;
    const blob = await put(pathname, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });
    uploaded.push({
      pathname: blob.pathname,
      url: blob.url,
      contentType: file.type,
      size: file.size,
    });
  }
  return uploaded;
}
