/**
 * Phase 7 — Training corpus domain types.
 * Human-reviewed data only. No external training or signed URLs.
 */

import { z } from 'zod';

export const corpusStatusSchema = z.enum([
  'draft',
  'under_review',
  'approved',
  'archived',
]);
export type CorpusStatus = z.infer<typeof corpusStatusSchema>;

export const corpusVersionStatusSchema = z.enum([
  'building',
  'review_ready',
  'approved',
  'released',
  'superseded',
  'cancelled',
]);
export type CorpusVersionStatus = z.infer<typeof corpusVersionStatusSchema>;

export const corpusItemStatusSchema = z.enum([
  'candidate',
  'included',
  'excluded',
  'needs_review',
]);
export type CorpusItemStatus = z.infer<typeof corpusItemStatusSchema>;

export const datasetSplitSchema = z.enum([
  'train',
  'validation',
  'test',
  'holdout',
]);
export type DatasetSplit = z.infer<typeof datasetSplitSchema>;

export const corpusIntendedUseSchema = z.enum([
  'damage_detection',
  'estimate_assist',
  'quality_scoring',
  'privacy_detection',
  'general_evaluation',
  'other',
]);
export type CorpusIntendedUse = z.infer<typeof corpusIntendedUseSchema>;

export const corpusReviewDecisionSchema = z.enum([
  'include',
  'exclude',
  'needs_review',
  'acknowledge_near_duplicate',
]);
export type CorpusReviewDecision = z.infer<typeof corpusReviewDecisionSchema>;

export const labelSourceSchema = z.enum(['ai_suggested', 'human_confirmed']);
export type LabelSource = z.infer<typeof labelSourceSchema>;

export type MediaCorpus = {
  readonly id: string;
  readonly externalId: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly description: string;
  readonly intendedUse: CorpusIntendedUse;
  readonly status: CorpusStatus;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
};

export type MediaCorpusVersion = {
  readonly id: string;
  readonly corpusId: string;
  readonly versionNumber: number;
  readonly status: CorpusVersionStatus;
  readonly notes: string;
  readonly manifestSchemaVersion: string;
  readonly manifestChecksum?: string;
  readonly releasedAt?: string;
  readonly releasedBy?: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MediaCorpusItem = {
  readonly id: string;
  readonly versionId: string;
  readonly assetExternalId: string;
  readonly assetRevision: number;
  readonly analysisExternalId?: string;
  readonly status: CorpusItemStatus;
  readonly datasetSplit?: DatasetSplit;
  readonly inclusionReason?: string;
  readonly exclusionReason?: string;
  readonly privacyStatusSnapshot: string;
  readonly isExactDuplicateSnapshot: boolean;
  readonly isNearDuplicateSnapshot: boolean;
  readonly duplicateGroupSnapshot?: string;
  readonly nearDuplicateGroupSnapshot?: string;
  readonly checksumSnapshot?: string;
  readonly nearDuplicateAcknowledged: boolean;
  readonly provenance: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MediaCorpusItemLabel = {
  readonly id: string;
  readonly itemId: string;
  readonly labelKey: string;
  readonly labelValue: string;
  readonly source: LabelSource;
  readonly confidence?: number;
  readonly createdBy?: string;
  readonly createdAt: string;
};

export type MediaCorpusReview = {
  readonly id: string;
  readonly itemId: string;
  readonly decision: CorpusReviewDecision;
  readonly notes: string;
  readonly reviewerId: string;
  readonly createdAt: string;
};

export type MediaCorpusEvent = {
  readonly id: string;
  readonly corpusId?: string;
  readonly versionId?: string;
  readonly itemId?: string;
  readonly actorId?: string;
  readonly action: string;
  readonly previousStatus?: string;
  readonly nextStatus?: string;
  readonly metadata: Record<string, unknown>;
  readonly at: string;
};

export type MediaCorpusExport = {
  readonly id: string;
  readonly versionId: string;
  readonly format: 'json_manifest';
  readonly status: 'pending' | 'ready' | 'failed' | 'cancelled';
  readonly manifest?: Record<string, unknown>;
  readonly manifestChecksum?: string;
  readonly createdBy?: string;
  readonly createdAt: string;
};

export type EligibilityFinding = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly count?: number;
};

export type ReleaseReadiness = {
  readonly ready: boolean;
  readonly totalItems: number;
  readonly includedItems: number;
  readonly errors: readonly EligibilityFinding[];
  readonly warnings: readonly EligibilityFinding[];
};
