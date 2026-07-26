'use server';

import { requireMediaPermission } from '@/lib/media-intelligence/auth/guards';
import {
  addCorpusItem,
  approveCorpusVersion,
  archiveCorpus,
  assignCorpusSplit,
  cancelCorpusVersion,
  confirmCorpusLabel,
  createCorpus,
  createCorpusVersion,
  generateCorpusExport,
  previewCorpusManifest,
  releaseCorpusVersion,
  removeCorpusItem,
  reviewCorpusItem,
  submitCorpusVersion,
  suggestCorpusLabel,
  type CorpusIntendedUse,
  type CorpusReviewDecision,
  type DatasetSplit,
} from '@/lib/media-intelligence/corpora';

export async function createCorpusAction(input: {
  readonly name: string;
  readonly description: string;
  readonly intendedUse: string;
}): Promise<{ ok: boolean; error?: string; corpusId?: string }> {
  const session = await requireMediaPermission('manage_corpus_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await createCorpus({
    actor: session.actor,
    name: input.name,
    description: input.description,
    intendedUse: input.intendedUse as CorpusIntendedUse,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, corpusId: result.data.id };
}

export async function createCorpusVersionAction(input: {
  readonly corpusId: string;
  readonly notes?: string;
}): Promise<{ ok: boolean; error?: string; versionId?: string }> {
  const session = await requireMediaPermission('manage_corpus_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await createCorpusVersion({
    actor: session.actor,
    corpusId: input.corpusId,
    notes: input.notes,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, versionId: result.data.id };
}

export async function addCorpusItemAction(input: {
  readonly versionId: string;
  readonly assetExternalId: string;
}): Promise<{ ok: boolean; error?: string; itemId?: string }> {
  const session = await requireMediaPermission('manage_corpus_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await addCorpusItem({
    actor: session.actor,
    versionId: input.versionId,
    assetExternalId: input.assetExternalId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, itemId: result.data.id };
}

export async function removeCorpusItemAction(input: {
  readonly itemId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('manage_corpus_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await removeCorpusItem({
    actor: session.actor,
    itemId: input.itemId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function suggestCorpusLabelAction(input: {
  readonly itemId: string;
  readonly labelKey: string;
  readonly labelValue: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('manage_corpus_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await suggestCorpusLabel({
    actor: session.actor,
    ...input,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function confirmCorpusLabelAction(input: {
  readonly itemId: string;
  readonly labelKey: string;
  readonly labelValue: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('review_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await confirmCorpusLabel({
    actor: session.actor,
    ...input,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function reviewCorpusItemAction(input: {
  readonly itemId: string;
  readonly decision: string;
  readonly notes?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('review_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await reviewCorpusItem({
    actor: session.actor,
    itemId: input.itemId,
    decision: input.decision as CorpusReviewDecision,
    notes: input.notes,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function assignCorpusSplitAction(input: {
  readonly itemId: string;
  readonly split: string;
}): Promise<{ ok: boolean; error?: string }> {
  const draft = await requireMediaPermission('manage_corpus_draft');
  const review = draft.ok
    ? draft
    : await requireMediaPermission('review_corpus');
  if (!review.ok) return { ok: false, error: review.error };
  const result = await assignCorpusSplit({
    actor: review.actor,
    itemId: input.itemId,
    split: input.split as DatasetSplit,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function submitCorpusVersionAction(input: {
  readonly versionId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('approve_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await submitCorpusVersion({
    actor: session.actor,
    versionId: input.versionId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function approveCorpusVersionAction(input: {
  readonly versionId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('approve_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await approveCorpusVersion({
    actor: session.actor,
    versionId: input.versionId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function releaseCorpusVersionAction(input: {
  readonly versionId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('release_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await releaseCorpusVersion({
    actor: session.actor,
    versionId: input.versionId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function cancelCorpusVersionAction(input: {
  readonly versionId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('release_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await cancelCorpusVersion({
    actor: session.actor,
    versionId: input.versionId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function archiveCorpusAction(input: {
  readonly corpusId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('release_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await archiveCorpus({
    actor: session.actor,
    corpusId: input.corpusId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function previewCorpusManifestAction(input: {
  readonly versionId: string;
}): Promise<{
  ok: boolean;
  error?: string;
  manifest?: Record<string, unknown>;
}> {
  const session = await requireMediaPermission('read');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await previewCorpusManifest({
    actor: session.actor,
    versionId: input.versionId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, manifest: result.data };
}

export async function generateCorpusExportAction(input: {
  readonly versionId: string;
}): Promise<{ ok: boolean; error?: string; exportId?: string }> {
  const session = await requireMediaPermission('approve_corpus');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await generateCorpusExport({
    actor: session.actor,
    versionId: input.versionId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, exportId: result.data.id };
}
