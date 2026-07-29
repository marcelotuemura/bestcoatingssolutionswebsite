/**
 * Privacy review foundation — checklist + EXIF GPS detection.
 * Does not claim OCR / face recognition completeness.
 */

import { promises as fs } from 'node:fs';
import sharp from 'sharp';
import type {
  MediaPrivacyStatus,
  PrivacyChecklist,
} from '@/lib/media-pipeline/types';
import { privacyChecklistSchema } from '@/lib/media-pipeline/types';

export function defaultPrivacyChecklist(): PrivacyChecklist {
  return privacyChecklistSchema.parse({});
}

export function defaultPrivacyStatus(): MediaPrivacyStatus {
  return 'unchecked';
}

/**
 * Detect GPS EXIF presence via raw EXIF buffer markers.
 * Heuristic only — not a full EXIF parser.
 */
export async function detectGpsExif(absolutePath: string): Promise<boolean> {
  try {
    const image = sharp(absolutePath, { failOn: 'none' });
    const meta = await image.metadata();
    const exif = (meta as { exif?: Buffer }).exif;
    if (!exif || exif.length < 16) return false;
    const latin = exif.toString('latin1');
    // GPS IFD pointers / tags commonly appear as "GPS" in APP1 EXIF blobs.
    if (/\bGPS\b/.test(latin) || latin.includes('GPSLatitude')) {
      return true;
    }
    // TIFF IFD tag 0x8825 (GPSInfo) appears as little/big-endian bytes.
    for (let i = 0; i < exif.length - 1; i += 1) {
      const a = exif[i];
      const b = exif[i + 1];
      if ((a === 0x88 && b === 0x25) || (a === 0x25 && b === 0x88)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function checklistHasBlocker(checklist: PrivacyChecklist): boolean {
  return (
    checklist.visibleFace ||
    checklist.vesselRegistration ||
    checklist.hin ||
    checklist.licensePlate ||
    checklist.customerDocument ||
    checklist.invoice ||
    checklist.address ||
    checklist.otherPrivateInformation
  );
}

/**
 * Derive privacyStatus from checklist + GPS signal.
 * GPS alone → review-required (strip before publish); blockers → blocked.
 * Empty unchecked checklist stays unchecked until reviewedAt is set.
 */
export function derivePrivacyStatus(input: {
  readonly checklist: PrivacyChecklist;
  readonly hasGpsExif: boolean;
}): MediaPrivacyStatus {
  const { checklist, hasGpsExif } = input;
  if (checklistHasBlocker(checklist)) {
    return 'blocked';
  }
  if (!checklist.reviewedAt) {
    // Inventory may pre-flag GPS on the checklist without a human review.
    if (hasGpsExif || checklist.gpsMetadata) {
      return 'review-required';
    }
    return 'unchecked';
  }
  if (checklist.gpsMetadata || hasGpsExif) {
    return 'review-required';
  }
  return 'clear';
}

/** Read-only probe — never mutates the file. */
export async function probeFileUnchanged(
  absolutePath: string,
  expectedBytes: number,
): Promise<boolean> {
  const stat = await fs.stat(absolutePath);
  return stat.size === expectedBytes;
}
