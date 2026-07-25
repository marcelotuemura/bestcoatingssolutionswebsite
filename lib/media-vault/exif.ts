import sharp, { type Metadata } from 'sharp';

export type ExifSummary = {
  readonly hasExif: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly orientation?: 'landscape' | 'portrait' | 'square' | 'unknown';
  readonly exifDate?: string;
  readonly camera?: string;
  readonly format?: string;
};

function orientationOf(
  width?: number,
  height?: number,
): ExifSummary['orientation'] {
  if (!width || !height) return 'unknown';
  if (width === height) return 'square';
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Read image dimensions / EXIF via sharp (libvips).
 * Does not mutate the source file.
 */
export async function readImageExif(
  absolutePath: string,
): Promise<ExifSummary> {
  try {
    const image = sharp(absolutePath, { failOn: 'none' });
    const meta = await image.metadata();
    const width = meta.width;
    const height = meta.height;
    const exifDate = extractExifDate(meta);
    const camera = extractCamera(meta);
    return {
      hasExif: Boolean(meta.exif || meta.icc || meta.xmp || exifDate || camera),
      width,
      height,
      orientation: orientationOf(width, height),
      exifDate,
      camera,
      format: meta.format,
    };
  } catch {
    return { hasExif: false, orientation: 'unknown' };
  }
}

function extractExifDate(meta: Metadata): string | undefined {
  const anyMeta = meta as Metadata & { exif?: Buffer };
  if (!anyMeta.exif) return undefined;
  const text = anyMeta.exif.toString('latin1');
  const match = text.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!match) return undefined;
  const [, y, mo, d, h, mi, s] = match;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`;
}

function extractCamera(meta: Metadata): string | undefined {
  const anyMeta = meta as Metadata & { exif?: Buffer };
  if (!anyMeta.exif) return undefined;
  const text = anyMeta.exif.toString('latin1');
  const makers = [
    'Canon',
    'NIKON',
    'SONY',
    'Apple',
    'FUJIFILM',
    'OLYMPUS',
    'Panasonic',
    'Leica',
    'GoPro',
  ];
  for (const maker of makers) {
    if (text.includes(maker)) return maker;
  }
  return undefined;
}
