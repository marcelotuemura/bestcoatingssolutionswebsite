/**
 * PostgreSQL-backed gallery repository (default runtime path).
 * Mutations go through SECURITY DEFINER RPCs; reads use SELECT under actor JWT.
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  withGalleryActor,
  galleryQueryAsActor,
} from '@/lib/media-intelligence/gallery/pg';
import type {
  GalleryAsset,
  GalleryCollection,
  GalleryEvent,
  GalleryListParams,
  GalleryListResult,
  GalleryMetadataInput,
} from '@/lib/media-intelligence/gallery/types';

const DEFAULT_WORKSPACE = 'bcs-default';

// ── Row types ─────────────────────────────────────────────────────────────────

type AssetRow = {
  id: string;
  external_id: string;
  workspace_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  media_kind: string;
  checksum: string;
  file_size_bytes: string | number;
  storage_bucket: string | null;
  storage_object_key: string | null;
  width: number | null;
  height: number | null;
  orientation: string | null;
  display_title: string | null;
  description: string | null;
  location: string | null;
  creator_name: string | null;
  capture_date: Date | string | null;
  customer_notes: string | null;
  keywords: string[] | null;
  privacy_status: string;
  review_status: string;
  archived_at: Date | string | null;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  is_favorite: boolean | null;
};

type CollectionRow = {
  id: string;
  external_id: string;
  workspace_id: string;
  name: string;
  description: string;
  cover_asset_external_id: string | null;
  archived_at: Date | string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  asset_count?: string | number;
};

type EventRow = {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  action: string;
  asset_external_id: string | null;
  collection_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function iso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapAsset(row: AssetRow, isFavorite = false): GalleryAsset {
  return {
    id: row.id,
    externalId: row.external_id,
    workspaceId: row.workspace_id,
    filename: row.filename,
    originalFilename: row.original_filename,
    fileType: row.file_type,
    mediaKind: row.media_kind as GalleryAsset['mediaKind'],
    checksum: row.checksum,
    fileSizeBytes: Number(row.file_size_bytes),
    storageBucket: row.storage_bucket,
    storageObjectKey: row.storage_object_key,
    width: row.width,
    height: row.height,
    orientation: row.orientation,
    displayTitle: row.display_title,
    description: row.description,
    location: row.location,
    creatorName: row.creator_name,
    captureDate: iso(row.capture_date),
    customerNotes: row.customer_notes,
    tags: row.keywords ?? [],
    privacyStatus: row.privacy_status as GalleryAsset['privacyStatus'],
    reviewStatus: row.review_status as GalleryAsset['reviewStatus'],
    archivedAt: iso(row.archived_at),
    createdBy: row.created_by,
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
    isFavorite: row.is_favorite ?? isFavorite,
  };
}

function mapCollection(row: CollectionRow): GalleryCollection {
  return {
    id: row.id,
    externalId: row.external_id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    coverAssetExternalId: row.cover_asset_external_id,
    archivedAt: iso(row.archived_at),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
    assetCount: row.asset_count ? Number(row.asset_count) : 0,
  };
}

function mapEvent(row: EventRow): GalleryEvent {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    actorId: row.actor_id,
    action: row.action,
    assetExternalId: row.asset_external_id,
    collectionId: row.collection_id,
    metadata: row.metadata ?? {},
    createdAt: iso(row.created_at)!,
  };
}

// ── Sort helpers ──────────────────────────────────────────────────────────────

function sortClause(sort: GalleryListParams['sort']): string {
  switch (sort) {
    case 'created_asc':
      return 'a.created_at asc';
    case 'updated_desc':
      return 'a.updated_at desc';
    case 'title_asc':
      return 'coalesce(a.display_title, a.original_filename) asc';
    case 'size_desc':
      return 'a.file_size_bytes desc';
    case 'capture_date_desc':
      return 'coalesce(a.capture_date, a.created_at) desc';
    default:
      return 'a.created_at desc';
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function dbListGalleryAssets(
  actor: MediaTrustedActor,
  params: GalleryListParams,
): Promise<GalleryListResult> {
  const start = Date.now();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE;

  return withGalleryActor(actor, async (client, actorUuid) => {
    const conditions: string[] = ['a.workspace_id = $1'];
    const bindings: unknown[] = [workspaceId];
    let idx = 2;

    if (!params.archived) {
      conditions.push('a.archived_at is null');
    }
    if (params.q) {
      conditions.push(
        `(a.display_title ilike $${idx} or a.original_filename ilike $${idx} or a.description ilike $${idx} or a.location ilike $${idx} or $${idx} = any(a.keywords))`,
      );
      bindings.push(`%${params.q}%`);
      idx++;
    }
    if (params.kind) {
      conditions.push(`a.media_kind = $${idx}`);
      bindings.push(params.kind);
      idx++;
    }
    if (params.privacy) {
      conditions.push(`a.privacy_status = $${idx}`);
      bindings.push(params.privacy);
      idx++;
    }
    if (params.reviewStatus) {
      conditions.push(`a.review_status = $${idx}`);
      bindings.push(params.reviewStatus);
      idx++;
    }
    if (params.onlyFavorites) {
      conditions.push(
        `exists (select 1 from public.media_favorites f where f.asset_external_id = a.external_id and f.user_id = $${idx} and f.workspace_id = $1)`,
      );
      bindings.push(actorUuid);
      idx++;
    }
    if (params.collectionId) {
      conditions.push(
        `exists (select 1 from public.media_collection_assets ca join public.media_collections c on c.id = ca.collection_id where ca.asset_external_id = a.external_id and c.id = $${idx}::uuid)`,
      );
      bindings.push(params.collectionId);
      idx++;
    }

    const where = conditions.join(' and ');
    const orderBy = sortClause(params.sort);
    const limit = params.pageSize;
    const offset = (params.page - 1) * params.pageSize;

    const countSql = `select count(*) from public.media_assets a where ${where}`;
    const countResult = await client.query<{ count: string }>(
      countSql,
      bindings,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataSql = `
      select a.*,
        exists (
          select 1 from public.media_favorites f
          where f.asset_external_id = a.external_id
            and f.user_id = $${idx}::uuid
            and f.workspace_id = $1
        ) as is_favorite
      from public.media_assets a
      where ${where}
      order by ${orderBy}
      limit $${idx + 1} offset $${idx + 2}
    `;
    bindings.push(actorUuid, limit, offset);
    const dataResult = await client.query<AssetRow>(dataSql, bindings);

    const pageCount = Math.max(1, Math.ceil(total / params.pageSize));

    return {
      assets: dataResult.rows.map((r) => mapAsset(r)),
      total,
      page: params.page,
      pageCount,
      durationMs: Date.now() - start,
    };
  });
}

export async function dbGetGalleryAsset(
  actor: MediaTrustedActor,
  externalId: string,
): Promise<GalleryAsset | null> {
  return withGalleryActor(actor, async (client, actorUuid) => {
    const { rows } = await client.query<AssetRow>(
      `select a.*,
         exists (
           select 1 from public.media_favorites f
           where f.asset_external_id = a.external_id
             and f.user_id = $2::uuid
             and f.workspace_id = a.workspace_id
         ) as is_favorite
       from public.media_assets a
       where a.external_id = $1`,
      [externalId, actorUuid],
    );
    return rows[0] ? mapAsset(rows[0]) : null;
  });
}

export async function dbGalleryEnsureMembership(
  actor: MediaTrustedActor,
  workspaceId = DEFAULT_WORKSPACE,
): Promise<void> {
  await withGalleryActor(actor, async (client) => {
    await client.query(
      `select public.media_gallery_ensure_own_membership($1)`,
      [workspaceId],
    );
  });
}

export async function dbRegisterGalleryAsset(
  actor: MediaTrustedActor,
  input: {
    workspaceId: string;
    externalId: string;
    filename: string;
    originalFilename: string;
    fileType: string;
    mediaKind: 'image' | 'video';
    checksum: string;
    fileSizeBytes: number;
    storageBucket: string;
    storageObjectKey: string;
    width?: number | null;
    height?: number | null;
    orientation?: string;
    displayTitle?: string;
  },
): Promise<GalleryAsset> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<AssetRow>(
      `select * from public.media_gallery_register_asset(
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
       )`,
      [
        input.workspaceId,
        input.externalId,
        input.filename,
        input.originalFilename,
        input.fileType,
        input.mediaKind,
        input.checksum,
        input.fileSizeBytes,
        input.storageBucket,
        input.storageObjectKey,
        input.width ?? null,
        input.height ?? null,
        input.orientation ?? 'unknown',
        input.displayTitle ?? null,
      ],
    );
    if (!rows[0]) throw new Error('register_asset returned no row');
    return mapAsset(rows[0]);
  });
}

export async function dbRegisterGalleryDerivative(
  actor: MediaTrustedActor,
  input: {
    assetExternalId: string;
    kind: string;
    sizePx: number;
    storageBucket: string;
    objectKey: string;
    contentType: string;
    bytes?: number;
    checksum?: string;
  },
): Promise<void> {
  await withGalleryActor(actor, async (client) => {
    await client.query(
      `select public.media_gallery_register_derivative($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.assetExternalId,
        input.kind,
        input.sizePx,
        input.storageBucket,
        input.objectKey,
        input.contentType,
        input.bytes ?? null,
        input.checksum ?? null,
      ],
    );
  });
}

export async function dbUpdateGalleryMetadata(
  actor: MediaTrustedActor,
  externalId: string,
  input: GalleryMetadataInput,
): Promise<GalleryAsset> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<AssetRow>(
      `select * from public.media_gallery_update_metadata(
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
       )`,
      [
        externalId,
        input.displayTitle ?? null,
        input.description ?? null,
        input.tags ?? null,
        input.projectName ?? null,
        input.vessel ?? null,
        input.location ?? null,
        input.creatorName ?? null,
        input.captureDate ?? null,
        input.customerNotes ?? null,
        input.internalNotes ?? null,
      ],
    );
    if (!rows[0]) throw new Error('update_metadata returned no row');
    return mapAsset(rows[0]);
  });
}

export async function dbSetGalleryFavorite(
  actor: MediaTrustedActor,
  assetExternalId: string,
  favorite: boolean,
  workspaceId = DEFAULT_WORKSPACE,
): Promise<void> {
  await withGalleryActor(actor, async (client) => {
    await client.query(`select public.media_gallery_set_favorite($1, $2, $3)`, [
      assetExternalId,
      favorite,
      workspaceId,
    ]);
  });
}

export async function dbCreateGalleryCollection(
  actor: MediaTrustedActor,
  workspaceId: string,
  name: string,
  description = '',
): Promise<GalleryCollection> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<CollectionRow>(
      `select * from public.media_gallery_create_collection($1, $2, $3)`,
      [workspaceId, name, description],
    );
    if (!rows[0]) throw new Error('create_collection returned no row');
    return mapCollection(rows[0]);
  });
}

export async function dbUpdateGalleryCollection(
  actor: MediaTrustedActor,
  collectionId: string,
  input: {
    name?: string;
    description?: string;
    coverAssetExternalId?: string;
    archive?: boolean;
  },
): Promise<GalleryCollection> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<CollectionRow>(
      `select * from public.media_gallery_update_collection($1::uuid, $2, $3, $4, $5)`,
      [
        collectionId,
        input.name ?? null,
        input.description ?? null,
        input.coverAssetExternalId ?? null,
        input.archive ?? false,
      ],
    );
    if (!rows[0]) throw new Error('update_collection returned no row');
    return mapCollection(rows[0]);
  });
}

export async function dbGalleryCollectionSetAssets(
  actor: MediaTrustedActor,
  collectionId: string,
  assetExternalIds: string[],
  mode: 'add' | 'remove',
): Promise<number> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<{
      media_gallery_collection_set_assets: number;
    }>(
      `select public.media_gallery_collection_set_assets($1::uuid, $2::text[], $3)`,
      [collectionId, assetExternalIds, mode],
    );
    return Number(rows[0]?.media_gallery_collection_set_assets ?? 0);
  });
}

export async function dbListGalleryCollections(
  actor: MediaTrustedActor,
  workspaceId = DEFAULT_WORKSPACE,
): Promise<GalleryCollection[]> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<
      CollectionRow & { asset_count: string }
    >(
      `select c.*,
         (select count(*) from public.media_collection_assets ca where ca.collection_id = c.id) as asset_count
       from public.media_collections c
       where c.workspace_id = $1 and c.archived_at is null
       order by c.created_at desc`,
      [workspaceId],
    );
    return rows.map(mapCollection);
  });
}

export async function dbGetGalleryCollection(
  actor: MediaTrustedActor,
  collectionId: string,
): Promise<GalleryCollection | null> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<
      CollectionRow & { asset_count: string }
    >(
      `select c.*,
         (select count(*) from public.media_collection_assets ca where ca.collection_id = c.id) as asset_count
       from public.media_collections c
       where c.id = $1::uuid`,
      [collectionId],
    );
    return rows[0] ? mapCollection(rows[0]) : null;
  });
}

export async function dbArchiveGalleryAssets(
  actor: MediaTrustedActor,
  assetExternalIds: string[],
  workspaceId = DEFAULT_WORKSPACE,
): Promise<number> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<{
      media_gallery_archive_assets: number;
    }>(`select public.media_gallery_archive_assets($1::text[], $2)`, [
      assetExternalIds,
      workspaceId,
    ]);
    return Number(rows[0]?.media_gallery_archive_assets ?? 0);
  });
}

export async function dbSubmitForReview(
  actor: MediaTrustedActor,
  assetExternalIds: string[],
  workspaceId = DEFAULT_WORKSPACE,
): Promise<number> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<{
      media_gallery_submit_for_review: number;
    }>(`select public.media_gallery_submit_for_review($1::text[], $2)`, [
      assetExternalIds,
      workspaceId,
    ]);
    return Number(rows[0]?.media_gallery_submit_for_review ?? 0);
  });
}

export async function dbReviewGalleryAsset(
  actor: MediaTrustedActor,
  assetExternalId: string,
  decision: 'approve' | 'reject' | 'in_review',
  notes = '',
): Promise<GalleryAsset> {
  return withGalleryActor(actor, async (client) => {
    const { rows } = await client.query<AssetRow>(
      `select * from public.media_gallery_review_asset($1, $2, $3)`,
      [assetExternalId, decision, notes],
    );
    if (!rows[0]) throw new Error('review_asset returned no row');
    return mapAsset(rows[0]);
  });
}

export async function dbListGalleryEvents(
  actor: MediaTrustedActor,
  workspaceId = DEFAULT_WORKSPACE,
  limit = 50,
): Promise<GalleryEvent[]> {
  const rows = await galleryQueryAsActor<EventRow>(
    actor,
    `select * from public.media_gallery_events
     where workspace_id = $1
     order by created_at desc
     limit $2`,
    [workspaceId, limit],
  );
  return rows.map(mapEvent);
}
