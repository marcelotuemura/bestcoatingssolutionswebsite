/**
 * Before/after matching protocol — explicit approval only.
 * Never infer pairs from filenames.
 */

import type {
  BeforeAfterMatchCriteria,
  BeforeAfterPairRecord,
  MediaAssetRecord,
} from '@/lib/media-pipeline/types';
import { beforeAfterMatchCriteriaSchema } from '@/lib/media-pipeline/types';

export function emptyMatchCriteria(): BeforeAfterMatchCriteria {
  return beforeAfterMatchCriteriaSchema.parse({});
}

export function allMatchCriteriaMet(
  criteria: BeforeAfterMatchCriteria,
): boolean {
  return (
    criteria.samePhysicalArea &&
    criteria.similarFraming &&
    criteria.similarCameraAngle &&
    criteria.similarDistance &&
    criteria.comparableOrientation &&
    criteria.sufficientResolution &&
    criteria.clearTemporalRelationship &&
    criteria.noPrivacyBlocker
  );
}

export function canApproveBeforeAfterPair(input: {
  readonly pair: BeforeAfterPairRecord;
  readonly before: MediaAssetRecord;
  readonly after: MediaAssetRecord;
}): { readonly ok: true } | { readonly ok: false; readonly reason: string } {
  const { pair, before, after } = input;
  if (before.id === after.id) {
    return { ok: false, reason: 'Before and after must be different assets' };
  }
  if (before.projectSlug !== after.projectSlug) {
    return {
      ok: false,
      reason: 'Before/after must share the same projectSlug',
    };
  }
  if (pair.beforeAssetId !== before.id || pair.afterAssetId !== after.id) {
    return { ok: false, reason: 'Pair asset ids do not match provided assets' };
  }
  if (
    before.privacyStatus === 'blocked' ||
    after.privacyStatus === 'blocked' ||
    before.privacyStatus === 'unchecked' ||
    after.privacyStatus === 'unchecked'
  ) {
    return {
      ok: false,
      reason: 'Both assets must clear privacy review before BA approval',
    };
  }
  if (!allMatchCriteriaMet(pair.criteria)) {
    return {
      ok: false,
      reason: 'All match criteria must be explicitly confirmed',
    };
  }
  if (!pair.criteria.noPrivacyBlocker) {
    return { ok: false, reason: 'Privacy blocker criterion not satisfied' };
  }
  return { ok: true };
}

/**
 * Intentionally does NOT scan filenames for before/after.
 * Returns an empty list — pairs are operator-created only.
 */
export function autoDetectBeforeAfterPairs(
  _assets: readonly MediaAssetRecord[],
): readonly BeforeAfterPairRecord[] {
  return [];
}
