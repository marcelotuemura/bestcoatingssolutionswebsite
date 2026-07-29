/**
 * Archive / publish path rules for the BCS Media Pipeline.
 * Originals under data/pictures are immutable.
 */

import path from 'node:path';
import {
  ARCHIVE_RULES,
  MEDIA_ARCHIVE_ROOT,
  MEDIA_PUBLISH_ROOT,
} from '@/lib/media-pipeline/constants';
import type {
  MediaAssetRecord,
  MediaPrivacyStatus,
  MediaPublishStatus,
} from '@/lib/media-pipeline/types';

export function archiveProjectPath(projectSlug: string): string {
  return path.posix.join(MEDIA_ARCHIVE_ROOT, projectSlug);
}

export function publishedDivisionProjectPath(
  division: string,
  projectSlug: string,
): string {
  return path.posix.join(MEDIA_PUBLISH_ROOT, division, projectSlug);
}

export function isUnderArchiveRoot(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/');
  return (
    normalized === MEDIA_ARCHIVE_ROOT ||
    normalized.startsWith(`${MEDIA_ARCHIVE_ROOT}/`)
  );
}

export function isUnderPublishRoot(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/');
  return (
    normalized === MEDIA_PUBLISH_ROOT ||
    normalized.startsWith(`${MEDIA_PUBLISH_ROOT}/`)
  );
}

/**
 * Publishing gate — Phase 2A enforces the rule even though publish is stubbed.
 * Unchecked / blocked privacy may never become published.
 */
export function canMarkPublished(
  privacyStatus: MediaPrivacyStatus,
  publishStatus: MediaPublishStatus,
): { readonly ok: true } | { readonly ok: false; readonly reason: string } {
  if (!ARCHIVE_RULES.requirePrivacyClearToPublish) {
    return { ok: true };
  }
  if (publishStatus !== 'published' && publishStatus !== 'queued') {
    return { ok: true };
  }
  if (privacyStatus === 'unchecked') {
    return {
      ok: false,
      reason: 'Cannot publish while privacyStatus is unchecked',
    };
  }
  if (privacyStatus === 'blocked') {
    return {
      ok: false,
      reason: 'Cannot publish while privacyStatus is blocked',
    };
  }
  if (privacyStatus === 'review-required') {
    return {
      ok: false,
      reason: 'Cannot publish while privacyStatus is review-required',
    };
  }
  return { ok: true };
}

export function assertOriginalNotModified(
  asset: Pick<MediaAssetRecord, 'archivePath' | 'checksum'>,
  currentChecksum: string,
): void {
  if (asset.checksum !== currentChecksum) {
    throw new Error(
      `Archive integrity failure for ${asset.archivePath}: checksum changed (originals are immutable)`,
    );
  }
}

export { ARCHIVE_RULES };
