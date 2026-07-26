/**
 * Corpus service façade.
 * Default runtime: PostgreSQL SECURITY DEFINER RPCs.
 * Memory path: MEDIA_CORPUS_REPOSITORY=memory (unit tests only).
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorCanCorpusAction } from '@/lib/media-intelligence/corpora/permissions';
import { resolveCorpusRepositoryMode } from '@/lib/media-intelligence/corpora/runtime';
import { syncAssetToPublicationDatabase } from '@/lib/media-intelligence/publishers/db-repository';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import {
  dbAddItem,
  dbApproveVersion,
  dbArchiveCorpus,
  dbAssignSplit,
  dbBuildManifest,
  dbCancelVersion,
  dbConfirmLabel,
  dbCreateCorpus,
  dbCreateVersion,
  dbGenerateExport,
  dbGetCorpus,
  dbGetReadiness,
  dbGetVersion,
  dbListCorpora,
  dbListEvents,
  dbListExports,
  dbListItems,
  dbListLabels,
  dbListVersions,
  dbReleaseVersion,
  dbRemoveItem,
  dbReviewItem,
  dbSubmitVersion,
  dbSuggestLabel,
} from '@/lib/media-intelligence/corpora/db-repository';
import {
  memoryAddItem,
  memoryAssignSplit,
  memoryConfirmLabel,
  memoryCreateCorpus,
  memoryCreateVersion,
  memoryGetCorpus,
  memoryGetVersion,
  memoryListCorpora,
  memoryListEvents,
  memoryListItems,
  memoryListLabels,
  memoryListVersions,
  memorySetCorpusStatus,
  memorySetItemStatus,
  memorySetVersionStatus,
} from '@/lib/media-intelligence/corpora/store';
import type {
  CorpusIntendedUse,
  CorpusReviewDecision,
  DatasetSplit,
  MediaCorpus,
  MediaCorpusEvent,
  MediaCorpusExport,
  MediaCorpusItem,
  MediaCorpusItemLabel,
  MediaCorpusVersion,
  ReleaseReadiness,
} from '@/lib/media-intelligence/corpora/types';

type Result<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string; readonly status: number };

function deny(error: string, status = 403): Result<never> {
  return { ok: false, error, status };
}

function pgError(error: unknown): Result<never> {
  const message = error instanceof Error ? error.message : String(error);
  const status = /permission denied|42501/i.test(message)
    ? 403
    : /not found|P0002/i.test(message)
      ? 404
      : 400;
  return deny(
    message.replace(/^ERROR:\s*/i, '').split('\n')[0] ?? message,
    status,
  );
}

function isMemory(): boolean {
  return resolveCorpusRepositoryMode() === 'memory';
}

export async function listCorporaForActor(
  actor: MediaTrustedActor,
): Promise<MediaCorpus[]> {
  if (!actorCanCorpusAction(actor, 'read')) return [];
  if (isMemory()) return memoryListCorpora();
  return dbListCorpora(actor);
}

export async function getCorpusDetail(
  actor: MediaTrustedActor,
  corpusId: string,
): Promise<
  Result<{
    corpus: MediaCorpus;
    versions: MediaCorpusVersion[];
    events: MediaCorpusEvent[];
  }>
> {
  if (!actorCanCorpusAction(actor, 'read')) return deny('Permission denied.');
  try {
    if (isMemory()) {
      const corpus = memoryGetCorpus(corpusId);
      if (!corpus) return deny('Corpus not found.', 404);
      return {
        ok: true,
        data: {
          corpus,
          versions: memoryListVersions(corpusId),
          events: memoryListEvents(corpusId),
        },
      };
    }
    const corpus = await dbGetCorpus(actor, corpusId);
    if (!corpus) return deny('Corpus not found.', 404);
    const [versions, events] = await Promise.all([
      dbListVersions(actor, corpusId),
      dbListEvents(actor, corpusId),
    ]);
    return { ok: true, data: { corpus, versions, events } };
  } catch (error) {
    return pgError(error);
  }
}

export async function getVersionDetail(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<
  Result<{
    version: MediaCorpusVersion;
    items: MediaCorpusItem[];
    readiness: ReleaseReadiness;
    exports: MediaCorpusExport[];
    labelsByItem: Record<string, MediaCorpusItemLabel[]>;
  }>
> {
  if (!actorCanCorpusAction(actor, 'read')) return deny('Permission denied.');
  try {
    if (isMemory()) {
      const version = memoryGetVersion(versionId);
      if (!version) return deny('Version not found.', 404);
      const items = memoryListItems(versionId);
      const labelsByItem: Record<string, MediaCorpusItemLabel[]> = {};
      for (const item of items) {
        labelsByItem[item.id] = memoryListLabels(item.id);
      }
      const included = items.filter((i) => i.status === 'included');
      const readiness: ReleaseReadiness = {
        ready:
          included.length > 0 &&
          included.every(
            (i) =>
              i.datasetSplit &&
              memoryListLabels(i.id).some(
                (l) => l.source === 'human_confirmed',
              ),
          ),
        totalItems: items.length,
        includedItems: included.length,
        errors: [],
        warnings: included.some((i) => i.isNearDuplicateSnapshot)
          ? [{ code: 'near_duplicates_present', severity: 'warning' }]
          : [],
      };
      return {
        ok: true,
        data: { version, items, readiness, exports: [], labelsByItem },
      };
    }
    const version = await dbGetVersion(actor, versionId);
    if (!version) return deny('Version not found.', 404);
    const [items, readiness, exports] = await Promise.all([
      dbListItems(actor, versionId),
      dbGetReadiness(actor, versionId),
      dbListExports(actor, versionId),
    ]);
    const labelsByItem: Record<string, MediaCorpusItemLabel[]> = {};
    await Promise.all(
      items.map(async (item) => {
        labelsByItem[item.id] = await dbListLabels(actor, item.id);
      }),
    );
    return {
      ok: true,
      data: { version, items, readiness, exports, labelsByItem },
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function createCorpus(input: {
  actor: MediaTrustedActor;
  name: string;
  description: string;
  intendedUse: CorpusIntendedUse;
  workspaceId?: string;
}): Promise<Result<MediaCorpus>> {
  if (!actorCanCorpusAction(input.actor, 'draft')) {
    return deny('Editors and above may create draft corpora.');
  }
  try {
    if (isMemory()) {
      const { corpus } = memoryCreateCorpus({
        workspaceId: input.workspaceId ?? 'bcs-default',
        name: input.name,
        description: input.description,
        intendedUse: input.intendedUse,
        actorId: input.actor.id,
      });
      return { ok: true, data: corpus };
    }
    const corpus = await dbCreateCorpus(input.actor, input);
    return { ok: true, data: corpus };
  } catch (error) {
    return pgError(error);
  }
}

export async function createCorpusVersion(input: {
  actor: MediaTrustedActor;
  corpusId: string;
  notes?: string;
}): Promise<Result<MediaCorpusVersion>> {
  if (!actorCanCorpusAction(input.actor, 'draft')) {
    return deny('Editors and above may create versions.');
  }
  try {
    if (isMemory()) {
      try {
        return {
          ok: true,
          data: memoryCreateVersion({
            corpusId: input.corpusId,
            notes: input.notes,
            actorId: input.actor.id,
          }),
        };
      } catch (error) {
        return pgError(error);
      }
    }
    return {
      ok: true,
      data: await dbCreateVersion(
        input.actor,
        input.corpusId,
        input.notes ?? '',
      ),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function addCorpusItem(input: {
  actor: MediaTrustedActor;
  versionId: string;
  assetExternalId: string;
}): Promise<Result<MediaCorpusItem>> {
  if (!actorCanCorpusAction(input.actor, 'draft')) {
    return deny('Editors and above may add candidates.');
  }
  try {
    if (isMemory()) {
      const version = memoryGetVersion(input.versionId);
      if (!version || version.status !== 'building') {
        return deny('Candidates may only be added while building.', 400);
      }
      return {
        ok: true,
        data: memoryAddItem({
          versionId: input.versionId,
          assetExternalId: input.assetExternalId,
          actorId: input.actor.id,
        }),
      };
    }
    const asset = getMediaIntelligenceRepository().getAsset(
      input.assetExternalId,
    );
    if (asset) {
      await syncAssetToPublicationDatabase(asset);
    }
    return {
      ok: true,
      data: await dbAddItem(
        input.actor,
        input.versionId,
        input.assetExternalId,
      ),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function removeCorpusItem(input: {
  actor: MediaTrustedActor;
  itemId: string;
}): Promise<Result<true>> {
  if (!actorCanCorpusAction(input.actor, 'draft')) {
    return deny('Editors and above may remove candidates.');
  }
  try {
    if (isMemory()) {
      return deny('Memory remove not implemented for orphan items.', 400);
    }
    await dbRemoveItem(input.actor, input.itemId);
    return { ok: true, data: true };
  } catch (error) {
    return pgError(error);
  }
}

export async function suggestCorpusLabel(input: {
  actor: MediaTrustedActor;
  itemId: string;
  labelKey: string;
  labelValue: string;
  confidence?: number;
}): Promise<Result<MediaCorpusItemLabel>> {
  if (!actorCanCorpusAction(input.actor, 'draft')) {
    return deny('Only draft managers may store AI suggestions.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memoryConfirmLabel({
          itemId: input.itemId,
          labelKey: input.labelKey,
          labelValue: input.labelValue,
          actorId: input.actor.id,
          source: 'ai_suggested',
        }),
      };
    }
    return {
      ok: true,
      data: await dbSuggestLabel(
        input.actor,
        input.itemId,
        input.labelKey,
        input.labelValue,
        input.confidence,
      ),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function confirmCorpusLabel(input: {
  actor: MediaTrustedActor;
  itemId: string;
  labelKey: string;
  labelValue: string;
}): Promise<Result<MediaCorpusItemLabel>> {
  if (!actorCanCorpusAction(input.actor, 'review')) {
    return deny('Reviewers and above may confirm labels.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memoryConfirmLabel({
          itemId: input.itemId,
          labelKey: input.labelKey,
          labelValue: input.labelValue,
          actorId: input.actor.id,
          source: 'human_confirmed',
        }),
      };
    }
    return {
      ok: true,
      data: await dbConfirmLabel(
        input.actor,
        input.itemId,
        input.labelKey,
        input.labelValue,
      ),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function reviewCorpusItem(input: {
  actor: MediaTrustedActor;
  itemId: string;
  decision: CorpusReviewDecision;
  notes?: string;
}): Promise<Result<MediaCorpusItem>> {
  if (!actorCanCorpusAction(input.actor, 'review')) {
    return deny('Reviewers and above may review items.');
  }
  try {
    if (isMemory()) {
      if (input.decision === 'acknowledge_near_duplicate') {
        return {
          ok: true,
          data: memorySetItemStatus(input.itemId, 'needs_review', {
            nearDuplicateAcknowledged: true,
          }),
        };
      }
      if (input.decision === 'include') {
        const labels = memoryListLabels(input.itemId);
        if (!labels.some((l) => l.source === 'human_confirmed')) {
          return deny('human-confirmed labels required for inclusion', 400);
        }
        return {
          ok: true,
          data: memorySetItemStatus(input.itemId, 'included'),
        };
      }
      if (input.decision === 'exclude') {
        return {
          ok: true,
          data: memorySetItemStatus(input.itemId, 'excluded'),
        };
      }
      return {
        ok: true,
        data: memorySetItemStatus(input.itemId, 'needs_review'),
      };
    }
    return {
      ok: true,
      data: await dbReviewItem(
        input.actor,
        input.itemId,
        input.decision,
        input.notes ?? '',
      ),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function assignCorpusSplit(input: {
  actor: MediaTrustedActor;
  itemId: string;
  split: DatasetSplit;
}): Promise<Result<MediaCorpusItem>> {
  if (
    !actorCanCorpusAction(input.actor, 'draft') &&
    !actorCanCorpusAction(input.actor, 'review')
  ) {
    return deny('Permission denied for split assignment.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memoryAssignSplit(input.itemId, input.split),
      };
    }
    return {
      ok: true,
      data: await dbAssignSplit(input.actor, input.itemId, input.split),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function submitCorpusVersion(input: {
  actor: MediaTrustedActor;
  versionId: string;
}): Promise<Result<MediaCorpusVersion>> {
  if (!actorCanCorpusAction(input.actor, 'approve')) {
    return deny('Administrators and above may submit for review.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memorySetVersionStatus(input.versionId, 'review_ready'),
      };
    }
    return {
      ok: true,
      data: await dbSubmitVersion(input.actor, input.versionId),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function approveCorpusVersion(input: {
  actor: MediaTrustedActor;
  versionId: string;
}): Promise<Result<MediaCorpusVersion>> {
  if (!actorCanCorpusAction(input.actor, 'approve')) {
    return deny('Administrators and above may approve versions.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memorySetVersionStatus(input.versionId, 'approved'),
      };
    }
    return {
      ok: true,
      data: await dbApproveVersion(input.actor, input.versionId),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function releaseCorpusVersion(input: {
  actor: MediaTrustedActor;
  versionId: string;
}): Promise<Result<MediaCorpusVersion>> {
  if (!actorCanCorpusAction(input.actor, 'release')) {
    return deny('Only owners may release corpus versions.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memorySetVersionStatus(input.versionId, 'released', {
          releasedAt: new Date().toISOString(),
          releasedBy: input.actor.id,
          manifestChecksum: 'memory-checksum',
        }),
      };
    }
    return {
      ok: true,
      data: await dbReleaseVersion(input.actor, input.versionId),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function cancelCorpusVersion(input: {
  actor: MediaTrustedActor;
  versionId: string;
}): Promise<Result<MediaCorpusVersion>> {
  if (!actorCanCorpusAction(input.actor, 'release')) {
    return deny('Only owners may cancel corpus versions.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memorySetVersionStatus(input.versionId, 'cancelled'),
      };
    }
    return {
      ok: true,
      data: await dbCancelVersion(input.actor, input.versionId),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function archiveCorpus(input: {
  actor: MediaTrustedActor;
  corpusId: string;
}): Promise<Result<MediaCorpus>> {
  if (!actorCanCorpusAction(input.actor, 'archive')) {
    return deny('Only owners may archive corpora.');
  }
  try {
    if (isMemory()) {
      return {
        ok: true,
        data: memorySetCorpusStatus(input.corpusId, 'archived'),
      };
    }
    return {
      ok: true,
      data: await dbArchiveCorpus(input.actor, input.corpusId),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function previewCorpusManifest(input: {
  actor: MediaTrustedActor;
  versionId: string;
}): Promise<Result<Record<string, unknown>>> {
  if (!actorCanCorpusAction(input.actor, 'read')) {
    return deny('Permission denied.');
  }
  try {
    if (isMemory()) {
      const version = memoryGetVersion(input.versionId);
      if (!version) return deny('Version not found.', 404);
      const corpus = memoryGetCorpus(version.corpusId)!;
      const items = memoryListItems(version.id).filter(
        (i) => i.status === 'included',
      );
      return {
        ok: true,
        data: {
          manifestSchemaVersion: '1.0.0',
          corpusId: corpus.externalId,
          versionId: version.id,
          versionNumber: version.versionNumber,
          workspaceId: corpus.workspaceId,
          intendedUse: corpus.intendedUse,
          items: items.map((i) => ({
            assetExternalId: i.assetExternalId,
            checksum: i.checksumSnapshot,
            datasetSplit: i.datasetSplit,
            confirmedLabels: memoryListLabels(i.id)
              .filter((l) => l.source === 'human_confirmed')
              .map((l) => ({ key: l.labelKey, value: l.labelValue })),
          })),
        },
      };
    }
    return {
      ok: true,
      data: await dbBuildManifest(input.actor, input.versionId),
    };
  } catch (error) {
    return pgError(error);
  }
}

export async function generateCorpusExport(input: {
  actor: MediaTrustedActor;
  versionId: string;
}): Promise<Result<MediaCorpusExport>> {
  if (!actorCanCorpusAction(input.actor, 'export')) {
    return deny('Administrators and above may generate exports.');
  }
  try {
    if (isMemory()) {
      return deny('Memory export requires postgres for checksum parity.', 400);
    }
    return {
      ok: true,
      data: await dbGenerateExport(input.actor, input.versionId),
    };
  } catch (error) {
    return pgError(error);
  }
}
