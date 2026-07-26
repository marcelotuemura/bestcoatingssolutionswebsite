/**
 * PostgreSQL-backed publication repository (default runtime path).
 * Mutations go through SECURITY DEFINER RPCs; reads use SELECT under actor JWT.
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import type { MediaAsset } from '@/lib/media-intelligence/schemas';
import {
  queryAsActor,
  withPublicationActor,
  withPublicationService,
} from '@/lib/media-intelligence/publishers/pg';
import type {
  Phase6PublishTarget,
  PublicationEvent,
  PublicationJob,
  PublicationJobStatus,
  PublicationPayload,
  ProviderDeliveryStatus,
} from '@/lib/media-intelligence/publishers/types';
import { publicationPayloadSchema } from '@/lib/media-intelligence/publishers/types';

const DEFAULT_WORKSPACE = 'bcs-default';

type JobRow = {
  id: string;
  external_id: string;
  workspace_id: string;
  asset_external_id: string;
  asset_revision: number | null;
  derivative_id: string | null;
  target: Phase6PublishTarget;
  status: PublicationJobStatus;
  provider_delivery_status: ProviderDeliveryStatus;
  payload: unknown;
  scheduled_for: Date | string | null;
  idempotency_key: string;
  approval_id: string | null;
  approval_version: number | null;
  destination_ref: string | null;
  failure_detail: string | null;
  provider_metadata: Record<string, unknown> | null;
  created_by: string | null;
  reviewed_by: string | null;
  published_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type EventRow = {
  id: string;
  job_id: string;
  actor_id: string | null;
  action: string;
  previous_status: PublicationJobStatus | null;
  next_status: PublicationJobStatus | null;
  target: Phase6PublishTarget;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
};

function iso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapJob(row: JobRow): PublicationJob {
  const payload = publicationPayloadSchema.parse(row.payload);
  return {
    id: row.id,
    externalId: row.external_id,
    assetId: row.asset_external_id,
    derivativeId: row.derivative_id ?? undefined,
    target: row.target,
    status: row.status,
    providerDeliveryStatus: row.provider_delivery_status,
    payload,
    scheduledFor: iso(row.scheduled_for),
    idempotencyKey: row.idempotency_key,
    approvalId: row.approval_id ?? undefined,
    approvalVersion: row.approval_version ?? undefined,
    destinationRef: row.destination_ref ?? undefined,
    failureDetail: row.failure_detail ?? undefined,
    providerMetadata: row.provider_metadata ?? {},
    createdBy: row.created_by ?? 'unknown',
    reviewedBy: row.reviewed_by ?? undefined,
    publishedBy: row.published_by ?? undefined,
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
  };
}

function mapEvent(row: EventRow): PublicationEvent {
  return {
    id: row.id,
    jobId: row.job_id,
    actorId: row.actor_id ?? 'unknown',
    action: row.action,
    previousStatus: row.previous_status ?? undefined,
    nextStatus: row.next_status ?? undefined,
    target: row.target,
    metadata: row.metadata ?? {},
    at: iso(row.created_at)!,
  };
}

/** Upsert catalog asset into Postgres so RPCs can enforce privacy/derivatives. */
export async function syncAssetToPublicationDatabase(
  asset: MediaAsset,
): Promise<void> {
  await withPublicationService(async (client) => {
    await client.query(
      `insert into public.media_assets (
         external_id, filename, original_filename, file_type, media_kind,
         checksum, privacy_status, privacy_issues, storage_bucket, storage_object_key,
         source_system, revision, notes
       ) values (
         $1, $2, $3, $4, 'image',
         $5, $6, $7::text[], 'media-originals', $8,
         'manual', $9, $10
       )
       on conflict (external_id) do update set
         privacy_status = excluded.privacy_status,
         privacy_issues = excluded.privacy_issues,
         revision = excluded.revision,
         notes = excluded.notes,
         updated_at = now()`,
      [
        asset.id,
        asset.originalFilename,
        asset.originalFilename,
        asset.mimeType,
        `sync-${asset.id}`,
        asset.privacyRisks.length > 0 ? 'blocked' : 'clear',
        asset.privacyRisks.map((r) => String(r)),
        asset.originalStorageKey,
        Math.max(1, asset.audit.length),
        asset.notes ?? null,
      ],
    );

    const { rows } = await client.query<{ id: string }>(
      `select id from public.media_assets where external_id = $1`,
      [asset.id],
    );
    const assetUuid = rows[0]?.id;
    if (!assetUuid) return;

    await client.query(
      `delete from public.media_privacy_flags where asset_id = $1::uuid`,
      [assetUuid],
    );
    for (const risk of asset.privacyRisks) {
      await client.query(
        `insert into public.media_privacy_flags (asset_id, risk, confidence, notes)
         values ($1::uuid, $2, 0.9, 'synced from catalog')`,
        [assetUuid, String(risk)],
      );
    }

    for (const der of asset.derivatives) {
      const kind = der.storageKey.includes('webp')
        ? 'webp'
        : der.storageKey.includes('avif')
          ? 'avif'
          : der.storageKey.includes('preview')
            ? 'preview'
            : 'thumbnail';
      if (der.storageKey.startsWith('originals/')) continue;
      await client.query(
        `insert into public.media_asset_derivatives (
           asset_id, kind, size_px, storage_bucket, object_key, content_type, bytes
         ) values ($1::uuid, $2, $3, 'media-derivatives', $4, $5, $6)
         on conflict (asset_id, kind, size_px) do update set
           object_key = excluded.object_key`,
        [
          assetUuid,
          kind,
          der.width ?? 800,
          der.storageKey,
          'image/jpeg',
          der.bytes ?? 0,
        ],
      );
    }
  });
}

export async function dbListPublicationJobs(
  actor: MediaTrustedActor,
  workspaceId = DEFAULT_WORKSPACE,
): Promise<readonly PublicationJob[]> {
  const rows = await queryAsActor<JobRow>(
    actor,
    `select * from public.media_publication_jobs
     where workspace_id = $1
     order by updated_at desc`,
    [workspaceId],
  );
  return rows.map(mapJob);
}

export async function dbGetPublicationJob(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<PublicationJob | null> {
  const rows = await queryAsActor<JobRow>(
    actor,
    `select * from public.media_publication_jobs where id = $1::uuid`,
    [jobId],
  );
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function dbListPublicationEvents(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<readonly PublicationEvent[]> {
  const rows = await queryAsActor<EventRow>(
    actor,
    `select * from public.media_publication_events
     where job_id = $1::uuid
     order by created_at asc`,
    [jobId],
  );
  return rows.map(mapEvent);
}

export async function dbCreatePublicationDraft(input: {
  readonly actor: MediaTrustedActor;
  readonly asset: MediaAsset;
  readonly target: Phase6PublishTarget;
  readonly payload: PublicationPayload;
  readonly idempotencyKey: string;
  readonly derivativeId?: string;
  readonly scheduledFor?: string;
  readonly destinationRef?: string;
  readonly workspaceId?: string;
}): Promise<PublicationJob> {
  await syncAssetToPublicationDatabase(input.asset);
  return withPublicationActor(input.actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_create_publication_draft(
         $1, $2, $3, $4::jsonb, $5, $6, $7::timestamptz, $8
       )`,
      [
        input.workspaceId ?? DEFAULT_WORKSPACE,
        input.asset.id,
        input.target,
        JSON.stringify(input.payload),
        input.idempotencyKey,
        input.derivativeId ?? null,
        input.scheduledFor ?? null,
        input.destinationRef ?? null,
      ],
    );
    if (!rows[0]) throw new Error('create draft returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbUpdatePublicationDraft(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
  readonly payload?: PublicationPayload;
  readonly derivativeId?: string;
  readonly scheduledFor?: string | null;
}): Promise<PublicationJob> {
  return withPublicationActor(input.actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_update_publication_draft(
         $1::uuid, $2::jsonb, $3, $4::timestamptz, $5
       )`,
      [
        input.jobId,
        input.payload ? JSON.stringify(input.payload) : null,
        input.derivativeId ?? null,
        input.scheduledFor === undefined ? null : input.scheduledFor,
        input.scheduledFor === null,
      ],
    );
    if (!rows[0]) throw new Error('update draft returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbSubmitPublication(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<PublicationJob> {
  return withPublicationActor(actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_submit_publication($1::uuid)`,
      [jobId],
    );
    if (!rows[0]) throw new Error('submit returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbApprovePublication(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<PublicationJob> {
  return withPublicationActor(actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_approve_publication($1::uuid)`,
      [jobId],
    );
    if (!rows[0]) throw new Error('approve returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbSchedulePublication(
  actor: MediaTrustedActor,
  jobId: string,
  scheduledFor: string,
): Promise<PublicationJob> {
  return withPublicationActor(actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_schedule_publication($1::uuid, $2::timestamptz)`,
      [jobId, scheduledFor],
    );
    if (!rows[0]) throw new Error('schedule returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbCancelPublication(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<PublicationJob> {
  return withPublicationActor(actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_cancel_publication($1::uuid)`,
      [jobId],
    );
    if (!rows[0]) throw new Error('cancel returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbExecutePublication(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<PublicationJob> {
  return withPublicationActor(actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_execute_publication($1::uuid)`,
      [jobId],
    );
    if (!rows[0]) throw new Error('execute returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbRecordPublicationResult(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
  readonly externallyDelivered: boolean;
  readonly providerDeliveryStatus: ProviderDeliveryStatus;
  readonly providerMetadata?: Record<string, unknown>;
  readonly failureDetail?: string;
}): Promise<PublicationJob> {
  return withPublicationActor(input.actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_record_publication_result(
         $1::uuid, $2, $3, $4::jsonb, $5
       )`,
      [
        input.jobId,
        input.externallyDelivered,
        input.providerDeliveryStatus,
        JSON.stringify(input.providerMetadata ?? {}),
        input.failureDetail ?? null,
      ],
    );
    if (!rows[0]) throw new Error('record result returned no row');
    return mapJob(rows[0]);
  });
}

export async function dbRetryPublication(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<PublicationJob> {
  return withPublicationActor(actor, async (client) => {
    const { rows } = await client.query<JobRow>(
      `select * from public.media_retry_publication($1::uuid)`,
      [jobId],
    );
    if (!rows[0]) throw new Error('retry returned no row');
    return mapJob(rows[0]);
  });
}
