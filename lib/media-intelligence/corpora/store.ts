/**
 * In-memory corpus store — unit-test fixture only.
 * Never used as production source of truth.
 */

import { randomUUID } from 'node:crypto';
import type {
  CorpusIntendedUse,
  CorpusItemStatus,
  CorpusStatus,
  CorpusVersionStatus,
  DatasetSplit,
  MediaCorpus,
  MediaCorpusEvent,
  MediaCorpusExport,
  MediaCorpusItem,
  MediaCorpusItemLabel,
  MediaCorpusReview,
  MediaCorpusVersion,
} from '@/lib/media-intelligence/corpora/types';

type Store = {
  corpora: MediaCorpus[];
  versions: MediaCorpusVersion[];
  items: MediaCorpusItem[];
  labels: MediaCorpusItemLabel[];
  reviews: MediaCorpusReview[];
  events: MediaCorpusEvent[];
  exports: MediaCorpusExport[];
};

let store: Store = emptyStore();

function emptyStore(): Store {
  return {
    corpora: [],
    versions: [],
    items: [],
    labels: [],
    reviews: [],
    events: [],
    exports: [],
  };
}

function now() {
  return new Date().toISOString();
}

export function resetCorpusStoreForTests(): void {
  store = emptyStore();
}

export function memoryCreateCorpus(input: {
  workspaceId: string;
  name: string;
  description: string;
  intendedUse: CorpusIntendedUse;
  actorId: string;
}): { corpus: MediaCorpus; version: MediaCorpusVersion } {
  const ts = now();
  const corpus: MediaCorpus = {
    id: randomUUID(),
    externalId: `corp_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    workspaceId: input.workspaceId,
    name: input.name,
    description: input.description,
    intendedUse: input.intendedUse,
    status: 'draft',
    createdBy: input.actorId,
    createdAt: ts,
    updatedAt: ts,
  };
  const version: MediaCorpusVersion = {
    id: randomUUID(),
    corpusId: corpus.id,
    versionNumber: 1,
    status: 'building',
    notes: 'Initial version',
    manifestSchemaVersion: '1.0.0',
    createdBy: input.actorId,
    createdAt: ts,
    updatedAt: ts,
  };
  store.corpora.push(corpus);
  store.versions.push(version);
  store.events.push({
    id: randomUUID(),
    corpusId: corpus.id,
    versionId: version.id,
    actorId: input.actorId,
    action: 'corpus_created',
    nextStatus: 'draft',
    metadata: {},
    at: ts,
  });
  return { corpus, version };
}

export function memoryListCorpora(): MediaCorpus[] {
  return [...store.corpora];
}

export function memoryGetCorpus(id: string): MediaCorpus | undefined {
  return store.corpora.find((c) => c.id === id);
}

export function memoryListVersions(corpusId: string): MediaCorpusVersion[] {
  return store.versions
    .filter((v) => v.corpusId === corpusId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

export function memoryCreateVersion(input: {
  corpusId: string;
  notes?: string;
  actorId: string;
}): MediaCorpusVersion {
  const corpus = store.corpora.find((c) => c.id === input.corpusId);
  if (!corpus) throw new Error('corpus not found');
  if (corpus.status === 'archived') {
    throw new Error('cannot version an archived corpus');
  }
  const nextNum =
    Math.max(
      0,
      ...store.versions
        .filter((v) => v.corpusId === corpus.id)
        .map((v) => v.versionNumber),
    ) + 1;
  const ts = now();
  const version: MediaCorpusVersion = {
    id: randomUUID(),
    corpusId: corpus.id,
    versionNumber: nextNum,
    status: 'building',
    notes: input.notes ?? '',
    manifestSchemaVersion: '1.0.0',
    createdBy: input.actorId,
    createdAt: ts,
    updatedAt: ts,
  };
  store.versions.push(version);
  if (corpus.status === 'approved') {
    memorySetCorpusStatus(corpus.id, 'draft');
  }
  return version;
}

export function memoryGetVersion(id: string): MediaCorpusVersion | undefined {
  return store.versions.find((v) => v.id === id);
}

export function memoryListItems(versionId: string): MediaCorpusItem[] {
  return store.items.filter((i) => i.versionId === versionId);
}

export function memoryListLabels(itemId: string): MediaCorpusItemLabel[] {
  return store.labels.filter((l) => l.itemId === itemId);
}

export function memoryListEvents(corpusId: string): MediaCorpusEvent[] {
  return store.events
    .filter((e) => e.corpusId === corpusId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function memoryAddItem(input: {
  versionId: string;
  assetExternalId: string;
  actorId: string;
  privacyStatus?: string;
  checksum?: string;
  isExactDuplicate?: boolean;
  isNearDuplicate?: boolean;
  duplicateGroup?: string;
}): MediaCorpusItem {
  const ts = now();
  const item: MediaCorpusItem = {
    id: randomUUID(),
    versionId: input.versionId,
    assetExternalId: input.assetExternalId,
    assetRevision: 1,
    status: input.isNearDuplicate ? 'needs_review' : 'candidate',
    privacyStatusSnapshot: input.privacyStatus ?? 'clear',
    isExactDuplicateSnapshot: Boolean(input.isExactDuplicate),
    isNearDuplicateSnapshot: Boolean(input.isNearDuplicate),
    duplicateGroupSnapshot: input.duplicateGroup,
    checksumSnapshot: input.checksum ?? `checksum-${input.assetExternalId}`,
    nearDuplicateAcknowledged: false,
    provenance: { source_system: 'memory' },
    createdAt: ts,
    updatedAt: ts,
  };
  store.items.push(item);
  return item;
}

export function memoryConfirmLabel(input: {
  itemId: string;
  labelKey: string;
  labelValue: string;
  actorId: string;
  source?: 'ai_suggested' | 'human_confirmed';
}): MediaCorpusItemLabel {
  const label: MediaCorpusItemLabel = {
    id: randomUUID(),
    itemId: input.itemId,
    labelKey: input.labelKey,
    labelValue: input.labelValue,
    source: input.source ?? 'human_confirmed',
    createdBy: input.actorId,
    createdAt: now(),
  };
  store.labels = store.labels.filter(
    (l) =>
      !(
        l.itemId === label.itemId &&
        l.labelKey === label.labelKey &&
        l.source === label.source
      ),
  );
  store.labels.push(label);
  return label;
}

export function memorySetItemStatus(
  itemId: string,
  status: CorpusItemStatus,
  patch?: Partial<MediaCorpusItem>,
): MediaCorpusItem {
  const idx = store.items.findIndex((i) => i.id === itemId);
  if (idx < 0) throw new Error('item not found');
  const next = { ...store.items[idx]!, status, ...patch, updatedAt: now() };
  store.items[idx] = next;
  return next;
}

export function memoryAssignSplit(
  itemId: string,
  split: DatasetSplit,
): MediaCorpusItem {
  const item = store.items.find((i) => i.id === itemId);
  if (!item) throw new Error('item not found');
  if (item.duplicateGroupSnapshot) {
    const conflict = store.items.find(
      (i) =>
        i.versionId === item.versionId &&
        i.id !== item.id &&
        i.duplicateGroupSnapshot === item.duplicateGroupSnapshot &&
        i.datasetSplit &&
        i.datasetSplit !== split,
    );
    if (conflict) {
      throw new Error('exact duplicate group cannot span conflicting splits');
    }
  }
  return memorySetItemStatus(itemId, item.status, { datasetSplit: split });
}

export function memorySetVersionStatus(
  versionId: string,
  status: CorpusVersionStatus,
  patch?: Partial<MediaCorpusVersion>,
): MediaCorpusVersion {
  const idx = store.versions.findIndex((v) => v.id === versionId);
  if (idx < 0) throw new Error('version not found');
  const current = store.versions[idx]!;
  if (
    current.status === 'released' &&
    status !== 'superseded' &&
    status !== 'released'
  ) {
    throw new Error('released corpus versions are immutable');
  }
  const next = { ...current, status, ...patch, updatedAt: now() };
  store.versions[idx] = next;
  return next;
}

export function memorySetCorpusStatus(
  corpusId: string,
  status: CorpusStatus,
): MediaCorpus {
  const idx = store.corpora.findIndex((c) => c.id === corpusId);
  if (idx < 0) throw new Error('corpus not found');
  const next = { ...store.corpora[idx]!, status, updatedAt: now() };
  store.corpora[idx] = next;
  return next;
}

export function memoryAppendEvent(
  event: Omit<MediaCorpusEvent, 'id' | 'at'>,
): void {
  store.events.push({ ...event, id: randomUUID(), at: now() });
}
