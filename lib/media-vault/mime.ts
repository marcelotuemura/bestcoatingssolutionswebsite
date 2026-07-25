import { promises as fs } from 'node:fs';
import path from 'node:path';
import { mediaIntelligenceConfig } from '@/config/media-intelligence';

export type DetectedMedia = {
  readonly mimeType: string;
  readonly mediaKind: 'image' | 'video';
  /** Extension suggested by content (may differ from filename). */
  readonly contentExtension: string;
  readonly filenameExtension: string;
};

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
};

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/tiff': '.tiff',
  'image/bmp': '.bmp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
};

function readAscii(buf: Buffer, start: number, length: number): string {
  return buf.subarray(start, start + length).toString('ascii');
}

function detectFromMagic(
  buf: Buffer,
): { mimeType: string; mediaKind: 'image' | 'video' } | null {
  if (buf.length < 12) return null;

  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mimeType: 'image/jpeg', mediaKind: 'image' };
  }

  // PNG
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { mimeType: 'image/png', mediaKind: 'image' };
  }

  // BMP
  if (buf[0] === 0x42 && buf[1] === 0x4d) {
    return { mimeType: 'image/bmp', mediaKind: 'image' };
  }

  // TIFF
  if (
    (buf[0] === 0x49 &&
      buf[1] === 0x49 &&
      buf[2] === 0x2a &&
      buf[3] === 0x00) ||
    (buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0x00 && buf[3] === 0x2a)
  ) {
    return { mimeType: 'image/tiff', mediaKind: 'image' };
  }

  // WEBP (RIFF....WEBP)
  if (readAscii(buf, 0, 4) === 'RIFF' && readAscii(buf, 8, 4) === 'WEBP') {
    return { mimeType: 'image/webp', mediaKind: 'image' };
  }

  // ISO BMFF (HEIC / MP4 / MOV) — "ftyp" at offset 4
  if (readAscii(buf, 4, 4) === 'ftyp') {
    const brand = readAscii(buf, 8, 4).toLowerCase();
    const heicBrands = new Set([
      'heic',
      'heix',
      'hevc',
      'hevx',
      'mif1',
      'msf1',
      'heim',
      'heis',
    ]);
    const qtBrands = new Set(['qt  ', 'qt']);
    const mp4Brands = new Set([
      'isom',
      'iso2',
      'iso3',
      'iso4',
      'iso5',
      'iso6',
      'mp41',
      'mp42',
      'mp71',
      'avc1',
      'mmp4',
      'msdh',
      'msix',
    ]);

    if (heicBrands.has(brand)) {
      return { mimeType: 'image/heic', mediaKind: 'image' };
    }
    if (qtBrands.has(brand) || brand === 'qt  ') {
      return { mimeType: 'video/quicktime', mediaKind: 'video' };
    }
    // Many QuickTime/MP4 files also carry compatible brands; treat major brand.
    if (
      mp4Brands.has(brand) ||
      brand.startsWith('mp4') ||
      brand.startsWith('iso')
    ) {
      return { mimeType: 'video/mp4', mediaKind: 'video' };
    }
    // Unknown ftyp — not accepted blindly.
    return null;
  }

  return null;
}

function extensionCompatible(
  filenameExtension: string,
  mimeType: string,
): boolean {
  const expected = EXT_TO_MIME[filenameExtension];
  if (!expected) return false;
  if (expected === mimeType) return true;
  // jpeg aliases
  if (
    mimeType === 'image/jpeg' &&
    (filenameExtension === '.jpg' || filenameExtension === '.jpeg')
  ) {
    return true;
  }
  // heic/heif
  if (
    (mimeType === 'image/heic' || mimeType === 'image/heif') &&
    (filenameExtension === '.heic' || filenameExtension === '.heif')
  ) {
    return true;
  }
  // mp4/m4v
  if (
    mimeType === 'video/mp4' &&
    (filenameExtension === '.mp4' || filenameExtension === '.m4v')
  ) {
    return true;
  }
  return false;
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

/**
 * Content-based media detection using binary magic bytes.
 * Filename extension is compared for consistency — never trusted alone.
 */
export async function detectMediaFromFile(
  absolutePath: string,
  filename = path.basename(absolutePath),
): Promise<DetectedMedia> {
  const handle = await fs.open(absolutePath, 'r');
  try {
    const buf = Buffer.alloc(64);
    const { bytesRead } = await handle.read(buf, 0, 64, 0);
    if (bytesRead === 0) {
      throw new Error('Empty media file');
    }
    if (bytesRead < 12) {
      throw new Error('Truncated or malformed media header');
    }

    const header = buf.subarray(0, bytesRead);
    const magic = detectFromMagic(header);
    if (!magic) {
      throw new Error(
        `Unrecognized or unsupported binary content for ${filename}`,
      );
    }
    if (!isSupportedMimeType(magic.mimeType)) {
      throw new Error(
        `Unsupported MIME type ${magic.mimeType} for ${filename}`,
      );
    }

    const filenameExtension = path.extname(filename).toLowerCase();
    if (!filenameExtension) {
      throw new Error(`Missing file extension for ${filename}`);
    }
    if (!extensionCompatible(filenameExtension, magic.mimeType)) {
      throw new Error(
        `MIME/extension mismatch for ${filename}: content is ${magic.mimeType} but extension is ${filenameExtension}`,
      );
    }

    return {
      mimeType: magic.mimeType,
      mediaKind: magic.mediaKind,
      contentExtension: MIME_TO_EXT[magic.mimeType] ?? filenameExtension,
      filenameExtension,
    };
  } finally {
    await handle.close();
  }
}

/** @deprecated Extension-only detection — do not use for ingestion authority. */
export function detectMimeFromFilename(filename: string): {
  readonly mimeType: string;
  readonly mediaKind: 'image' | 'video';
  readonly extension: string;
} | null {
  const extension = path.extname(filename).toLowerCase();
  const mimeType = EXT_TO_MIME[extension];
  if (!mimeType) return null;
  const mediaKind = mimeType.startsWith('video/') ? 'video' : 'image';
  return { mimeType, mediaKind, extension };
}
