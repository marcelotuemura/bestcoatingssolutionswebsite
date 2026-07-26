/**
 * PostgreSQL-backed corpus repository (default runtime path).
 * Mutations go through SECURITY DEFINER RPCs.
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  queryAsActor,
  withPublicationActor,
} from '@/lib/media-intelligence/publishers/pg';
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
import { assertSafeManifest } from '@/lib/media-intelligence/corpora/validation';

const DEFAULT_WORKSPACE = 'bcs-default';

function iso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

type CorpusRow = {
  id: string;
  external_id: string;
  workspace_id: string;
  name: string;
  description: string;
  intended_use: CorpusIntendedUse;
  status: MediaCorpus['status'];
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  archived_at: Date | string | null;
};

type VersionRow = {
  id: string;
  corpus_id: string;
  version_number: number;
  status: MediaCorpusVersion['status'];
  notes: string;
  manifest_schema_version: string;
  manifest_checksum: string | null;
  released_at: Date | string | null;
  released_by: string | null;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type ItemRow = {
  id: string;
  version_id: string;
  asset_external_id: string;
  asset_revision: number;
  analysis_external_id: string | null;
  status: MediaCorpusItem['status'];
  dataset_split: DatasetSplit | null;
  inclusion_reason: string | null;
  exclusion_reason: string | null;
  privacy_status_snapshot: string;
  is_exact_duplicate_snapshot: boolean;
  is_near_duplicate_snapshot: boolean;
  duplicate_group_snapshot: string | null;
  near_duplicate_group_snapshot: string | null;
  checksum_snapshot: string | null;
  near_duplicate_acknowledged: boolean;
  provenance: Record<string, unknown> | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapCorpus(row: CorpusRow): MediaCorpus {
  return {
    id: row.id,
    externalId: row.external_id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    intendedUse: row.intended_use,
    status: row.status,
    createdBy: row.created_by ?? 'unknown',
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
    archivedAt: iso(row.archived_at),
  };
}

function mapVersion(row: VersionRow): MediaCorpusVersion {
  return {
    id: row.id,
    corpusId: row.corpus_id,
    versionNumber: row.version_number,
    status: row.status,
    notes: row.notes,
    manifestSchemaVersion: row.manifest_schema_version,
    manifestChecksum: row.manifest_checksum ?? undefined,
    releasedAt: iso(row.released_at),
    releasedBy: row.released_by ?? undefined,
    createdBy: row.created_by ?? 'unknown',
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
  };
}

function mapItem(row: ItemRow): MediaCorpusItem {
  return {
    id: row.id,
    versionId: row.version_id,
    assetExternalId: row.asset_external_id,
    assetRevision: row.asset_revision,
    analysisExternalId: row.analysis_external_id ?? undefined,
    status: row.status,
    datasetSplit: row.dataset_split ?? undefined,
    inclusionReason: row.inclusion_reason ?? undefined,
    exclusionReason: row.exclusion_reason ?? undefined,
    privacyStatusSnapshot: row.privacy_status_snapshot,
    isExactDuplicateSnapshot: row.is_exact_duplicate_snapshot,
    isNearDuplicateSnapshot: row.is_near_duplicate_snapshot,
    duplicateGroupSnapshot: row.duplicate_group_snapshot ?? undefined,
    nearDuplicateGroupSnapshot: row.near_duplicate_group_snapshot ?? undefined,
    checksumSnapshot: row.checksum_snapshot ?? undefined,
    nearDuplicateAcknowledged: row.near_duplicate_acknowledged,
    provenance: row.provenance ?? {},
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
  };
}

async function ensureMembership(
  actor: MediaTrustedActor,
  workspaceId = DEFAULT_WORKSPACE,
): Promise<void> {
  await withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      workspaceId,
    ]);
  });
}

export async function dbListCorpora(
  actor: MediaTrustedActor,
  workspaceId = DEFAULT_WORKSPACE,
): Promise<MediaCorpus[]> {
  await ensureMembership(actor, workspaceId);
  const rows = await queryAsActor<CorpusRow>(
    actor,
    `select * from public.media_corpora
     where workspace_id = $1
     order by updated_at desc`,
    [workspaceId],
  );
  return rows.map(mapCorpus);
}

export async function dbGetCorpus(
  actor: MediaTrustedActor,
  corpusId: string,
): Promise<MediaCorpus | null> {
  await ensureMembership(actor);
  const rows = await queryAsActor<CorpusRow>(
    actor,
    `select * from public.media_corpora where id = $1::uuid`,
    [corpusId],
  );
  return rows[0] ? mapCorpus(rows[0]) : null;
}

export async function dbListVersions(
  actor: MediaTrustedActor,
  corpusId: string,
): Promise<MediaCorpusVersion[]> {
  await ensureMembership(actor);
  const rows = await queryAsActor<VersionRow>(
    actor,
    `select * from public.media_corpus_versions
     where corpus_id = $1::uuid
     order by version_number desc`,
    [corpusId],
  );
  return rows.map(mapVersion);
}

export async function dbGetVersion(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusVersion | null> {
  await ensureMembership(actor);
  const rows = await queryAsActor<VersionRow>(
    actor,
    `select * from public.media_corpus_versions where id = $1::uuid`,
    [versionId],
  );
  return rows[0] ? mapVersion(rows[0]) : null;
}

export async function dbListItems(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusItem[]> {
  await ensureMembership(actor);
  const rows = await queryAsActor<ItemRow>(
    actor,
    `select * from public.media_corpus_items
     where version_id = $1::uuid
     order by created_at asc`,
    [versionId],
  );
  return rows.map(mapItem);
}

export async function dbListLabels(
  actor: MediaTrustedActor,
  itemId: string,
): Promise<MediaCorpusItemLabel[]> {
  await ensureMembership(actor);
  const rows = await queryAsActor<{
    id: string;
    item_id: string;
    label_key: string;
    label_value: string;
    source: MediaCorpusItemLabel['source'];
    confidence: string | number | null;
    created_by: string | null;
    created_at: Date | string;
  }>(
    actor,
    `select * from public.media_corpus_item_labels where item_id = $1::uuid`,
    [itemId],
  );
  return rows.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    labelKey: row.label_key,
    labelValue: row.label_value,
    source: row.source,
    confidence: row.confidence == null ? undefined : Number(row.confidence),
    createdBy: row.created_by ?? undefined,
    createdAt: iso(row.created_at)!,
  }));
}

export async function dbListEvents(
  actor: MediaTrustedActor,
  corpusId: string,
): Promise<MediaCorpusEvent[]> {
  await ensureMembership(actor);
  const rows = await queryAsActor<{
    id: string;
    corpus_id: string | null;
    version_id: string | null;
    item_id: string | null;
    actor_id: string | null;
    action: string;
    previous_status: string | null;
    next_status: string | null;
    metadata: Record<string, unknown> | null;
    created_at: Date | string;
  }>(
    actor,
    `select * from public.media_corpus_events
     where corpus_id = $1::uuid
     order by created_at desc
     limit 200`,
    [corpusId],
  );
  return rows.map((row) => ({
    id: row.id,
    corpusId: row.corpus_id ?? undefined,
    versionId: row.version_id ?? undefined,
    itemId: row.item_id ?? undefined,
    actorId: row.actor_id ?? undefined,
    action: row.action,
    previousStatus: row.previous_status ?? undefined,
    nextStatus: row.next_status ?? undefined,
    metadata: row.metadata ?? {},
    at: iso(row.created_at)!,
  }));
}

export async function dbListExports(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusExport[]> {
  await ensureMembership(actor);
  const rows = await queryAsActor<{
    id: string;
    version_id: string;
    format: 'json_manifest';
    status: MediaCorpusExport['status'];
    manifest: Record<string, unknown> | null;
    manifest_checksum: string | null;
    created_by: string | null;
    created_at: Date | string;
  }>(
    actor,
    `select * from public.media_corpus_exports
     where version_id = $1::uuid
     order by created_at desc`,
    [versionId],
  );
  return rows.map((row) => ({
    id: row.id,
    versionId: row.version_id,
    format: row.format,
    status: row.status,
    manifest: row.manifest ?? undefined,
    manifestChecksum: row.manifest_checksum ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: iso(row.created_at)!,
  }));
}

export async function dbCreateCorpus(
  actor: MediaTrustedActor,
  input: {
    workspaceId?: string;
    name: string;
    description: string;
    intendedUse: CorpusIntendedUse;
  },
): Promise<MediaCorpus> {
  const workspaceId = input.workspaceId ?? DEFAULT_WORKSPACE;
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      workspaceId,
    ]);
    const { rows } = await client.query<CorpusRow>(
      `select * from public.media_create_corpus($1, $2, $3, $4)`,
      [workspaceId, input.name, input.description, input.intendedUse],
    );
    return mapCorpus(rows[0]!);
  });
}

export async function dbCreateVersion(
  actor: MediaTrustedActor,
  corpusId: string,
  notes = '',
): Promise<MediaCorpusVersion> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<VersionRow>(
      `select * from public.media_create_corpus_version($1::uuid, $2)`,
      [corpusId, notes],
    );
    return mapVersion(rows[0]!);
  });
}

export async function dbAddItem(
  actor: MediaTrustedActor,
  versionId: string,
  assetExternalId: string,
  analysisExternalId?: string,
): Promise<MediaCorpusItem> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<ItemRow>(
      `select * from public.media_add_corpus_item($1::uuid, $2, $3)`,
      [versionId, assetExternalId, analysisExternalId ?? null],
    );
    return mapItem(rows[0]!);
  });
}

export async function dbRemoveItem(
  actor: MediaTrustedActor,
  itemId: string,
): Promise<void> {
  await withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    await client.query(`select public.media_remove_corpus_item($1::uuid)`, [
      itemId,
    ]);
  });
}

export async function dbSuggestLabel(
  actor: MediaTrustedActor,
  itemId: string,
  labelKey: string,
  labelValue: string,
  confidence?: number,
): Promise<MediaCorpusItemLabel> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<{
      id: string;
      item_id: string;
      label_key: string;
      label_value: string;
      source: MediaCorpusItemLabel['source'];
      confidence: string | number | null;
      created_by: string | null;
      created_at: Date | string;
    }>(
      `select * from public.media_suggest_corpus_label($1::uuid, $2, $3, $4)`,
      [itemId, labelKey, labelValue, confidence ?? null],
    );
    const row = rows[0]!;
    return {
      id: row.id,
      itemId: row.item_id,
      labelKey: row.label_key,
      labelValue: row.label_value,
      source: row.source,
      confidence: row.confidence == null ? undefined : Number(row.confidence),
      createdBy: row.created_by ?? undefined,
      createdAt: iso(row.created_at)!,
    };
  });
}

export async function dbConfirmLabel(
  actor: MediaTrustedActor,
  itemId: string,
  labelKey: string,
  labelValue: string,
): Promise<MediaCorpusItemLabel> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<{
      id: string;
      item_id: string;
      label_key: string;
      label_value: string;
      source: MediaCorpusItemLabel['source'];
      confidence: string | number | null;
      created_by: string | null;
      created_at: Date | string;
    }>(`select * from public.media_confirm_corpus_label($1::uuid, $2, $3)`, [
      itemId,
      labelKey,
      labelValue,
    ]);
    const row = rows[0]!;
    return {
      id: row.id,
      itemId: row.item_id,
      labelKey: row.label_key,
      labelValue: row.label_value,
      source: row.source,
      createdBy: row.created_by ?? undefined,
      createdAt: iso(row.created_at)!,
    };
  });
}

export async function dbReviewItem(
  actor: MediaTrustedActor,
  itemId: string,
  decision: CorpusReviewDecision,
  notes = '',
  inclusionReason?: string,
  exclusionReason?: string,
): Promise<MediaCorpusItem> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<ItemRow>(
      `select * from public.media_review_corpus_item($1::uuid, $2, $3, $4, $5)`,
      [
        itemId,
        decision,
        notes,
        inclusionReason ?? null,
        exclusionReason ?? null,
      ],
    );
    return mapItem(rows[0]!);
  });
}

export async function dbAssignSplit(
  actor: MediaTrustedActor,
  itemId: string,
  split: DatasetSplit,
): Promise<MediaCorpusItem> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<ItemRow>(
      `select * from public.media_assign_corpus_split($1::uuid, $2)`,
      [itemId, split],
    );
    return mapItem(rows[0]!);
  });
}

export async function dbSubmitVersion(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusVersion> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<VersionRow>(
      `select * from public.media_submit_corpus_version($1::uuid)`,
      [versionId],
    );
    return mapVersion(rows[0]!);
  });
}

export async function dbApproveVersion(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusVersion> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<VersionRow>(
      `select * from public.media_approve_corpus_version($1::uuid)`,
      [versionId],
    );
    return mapVersion(rows[0]!);
  });
}

export async function dbReleaseVersion(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusVersion> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<VersionRow>(
      `select * from public.media_release_corpus_version($1::uuid)`,
      [versionId],
    );
    return mapVersion(rows[0]!);
  });
}

export async function dbCancelVersion(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusVersion> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<VersionRow>(
      `select * from public.media_cancel_corpus_version($1::uuid)`,
      [versionId],
    );
    return mapVersion(rows[0]!);
  });
}

export async function dbArchiveCorpus(
  actor: MediaTrustedActor,
  corpusId: string,
): Promise<MediaCorpus> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<CorpusRow>(
      `select * from public.media_archive_corpus($1::uuid)`,
      [corpusId],
    );
    return mapCorpus(rows[0]!);
  });
}

export async function dbBuildManifest(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<Record<string, unknown>> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<{
      media_corpus_build_manifest: Record<string, unknown>;
    }>(`select public.media_corpus_build_manifest($1::uuid)`, [versionId]);
    const manifest = rows[0]!.media_corpus_build_manifest;
    assertSafeManifest(manifest);
    return manifest;
  });
}

export async function dbGetReadiness(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<ReleaseReadiness> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<{
      media_corpus_version_readiness: {
        ready: boolean;
        total_items: number;
        included_items: number;
        errors: Array<{ code: string; severity?: string; count?: number }>;
        warnings: Array<{ code: string; severity?: string; count?: number }>;
      };
    }>(`select public.media_corpus_version_readiness($1::uuid)`, [versionId]);
    const r = rows[0]!.media_corpus_version_readiness;
    return {
      ready: Boolean(r.ready),
      totalItems: r.total_items,
      includedItems: r.included_items,
      errors: (r.errors ?? []).map((e) => ({
        code: e.code,
        severity: 'error' as const,
        count: e.count,
      })),
      warnings: (r.warnings ?? []).map((e) => ({
        code: e.code,
        severity: 'warning' as const,
        count: e.count,
      })),
    };
  });
}

export async function dbGenerateExport(
  actor: MediaTrustedActor,
  versionId: string,
): Promise<MediaCorpusExport> {
  return withPublicationActor(actor, async (client) => {
    await client.query(`select public.media_corpus_ensure_own_membership($1)`, [
      DEFAULT_WORKSPACE,
    ]);
    const { rows } = await client.query<{
      id: string;
      version_id: string;
      format: 'json_manifest';
      status: MediaCorpusExport['status'];
      manifest: Record<string, unknown> | null;
      manifest_checksum: string | null;
      created_by: string | null;
      created_at: Date | string;
    }>(`select * from public.media_generate_corpus_export($1::uuid)`, [
      versionId,
    ]);
    const row = rows[0]!;
    if (row.manifest) assertSafeManifest(row.manifest);
    return {
      id: row.id,
      versionId: row.version_id,
      format: row.format,
      status: row.status,
      manifest: row.manifest ?? undefined,
      manifestChecksum: row.manifest_checksum ?? undefined,
      createdBy: row.created_by ?? undefined,
      createdAt: iso(row.created_at)!,
    };
  });
}
