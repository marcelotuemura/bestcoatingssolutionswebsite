import path from 'node:path';
import { mediaIntelligenceConfig } from '@/config/media-intelligence';

const EXT_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.bmp': 'image/bmp',
  '.cr2': 'image/x-canon-cr2',
  '.nef': 'image/x-nikon-nef',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.m4v': 'video/mp4',
};

export type DetectedMedia = {
  readonly mimeType: string;
  readonly mediaKind: 'image' | 'video';
  readonly extension: string;
};

export function detectMimeFromFilename(filename: string): DetectedMedia | null {
  const extension = path.extname(filename).toLowerCase();
  const mimeType = EXT_MIME[extension];
  if (!mimeType) return null;
  const mediaKind = mimeType.startsWith('video/') ? 'video' : 'image';
  return { mimeType, mediaKind, extension };
}

export function isSupportedMimeType(mimeType: string): boolean {
  return (
    (
      mediaIntelligenceConfig.supportedImageMimeTypes as readonly string[]
    ).includes(mimeType) ||
    (
      mediaIntelligenceConfig.supportedVideoMimeTypes as readonly string[]
    ).includes(mimeType)
  );
}

export function assertSupportedMedia(filename: string): DetectedMedia {
  const detected = detectMimeFromFilename(filename);
  if (!detected) {
    throw new Error(`Unsupported or unknown media format: ${filename}`);
  }
  if (!isSupportedMimeType(detected.mimeType)) {
    throw new Error(
      `Unsupported MIME type ${detected.mimeType} for ${filename}`,
    );
  }
  return detected;
}
