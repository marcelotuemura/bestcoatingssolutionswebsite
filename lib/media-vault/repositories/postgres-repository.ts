import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CatalogAsset,
  CatalogDataSource,
  CatalogProject,
  DuplicateGroup,
} from '@/lib/media-library';
import type {
  MediaRepository,
  PrivateObjectRef,
  ThumbnailSize,
  VaultObjectKind,
} from '@/lib/media-vault/types';
import {
  assertSafeObjectKey,
  bucketForKind,
} from '@/lib/media-intelligence/storage/object-keys';
import { createSupabaseServiceClient } from '@/lib/media-intelligence/supabase/client';
import { validateSupabaseConfig } from '@/lib/media-intelligence/supabase/config';
import { recordAuditEvent } from '@/lib/media-intelligence/audit/audit';

type AssetRow = {
  external_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  media_kind: 'image' | 'video';
  folder: string;
  project_external_id: string | null;
  project_name: string | null;
  manufacturer: string | null;
  boat_name: string | null;
  boat_type: string | null;
  repair_category: string | null;
  stage: CatalogAsset['stage'];
  keywords: string[] | null;
  camera: string | null;
  exif_date: string | null;
  has_exif: boolean;
  width: number | null;
  height: number | null;
  resolution: string | null;
  orientation: CatalogAsset['orientation'];
  checksum: string | null;
  file_size_bytes: number | null;
  score_website: number;
  score_marketing: number;
  score_technical: number;
  score_quality: number | null;
  score_seo: number | null;
  score_social: number | null;
  score_overall: number | null;
  privacy_status: CatalogAsset['privacyStatus'];
  privacy_issues: string[] | null;
  is_hero_candidate: boolean;
  is_exact_duplicate: boolean;
  is_near_duplicate: boolean;
  duplicate_group_external_id: string | null;
  near_duplicate_group_external_id: string | null;
  recommendations: CatalogAsset['recommendations'] | null;
  video_meta: CatalogAsset['videoMeta'] | null;
  notes: string | null;
  storage_bucket: string | null;
  storage_object_key: string | null;
  created_at: string;
  id: string;
};

function mapAsset(
  row: AssetRow,
  derivatives?: CatalogAsset['derivatives'],
): CatalogAsset {
  return {
    id: row.external_id,
    filename: row.filename,
    originalFilename: row.original_filename,
    fileType: row.file_type,
    mediaKind: row.media_kind,
    folder: row.folder ?? '',
    projectId: row.project_external_id ?? undefined,
    projectName: row.project_name ?? undefined,
    manufacturer: row.manufacturer ?? undefined,
    boatName: row.boat_name ?? undefined,
    boatType: row.boat_type ?? undefined,
    repairCategory: row.repair_category ?? undefined,
    stage: row.stage,
    keywords: row.keywords ?? [],
    camera: row.camera ?? undefined,
    exifDate: row.exif_date ?? undefined,
    hasExif: row.has_exif,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    resolution: row.resolution ?? undefined,
    orientation: row.orientation,
    checksum: row.checksum ?? undefined,
    fileSizeBytes: row.file_size_bytes ?? undefined,
    scores: {
      website: Number(row.score_website),
      marketing: Number(row.score_marketing),
      technical: Number(row.score_technical),
      quality:
        row.score_quality != null ? Number(row.score_quality) : undefined,
      seo: row.score_seo != null ? Number(row.score_seo) : undefined,
      social: row.score_social != null ? Number(row.score_social) : undefined,
      overall:
        row.score_overall != null ? Number(row.score_overall) : undefined,
    },
    privacyStatus: row.privacy_status,
    privacyIssues: row.privacy_issues ?? [],
    isHeroCandidate: row.is_hero_candidate,
    isExactDuplicate: row.is_exact_duplicate,
    isNearDuplicate: row.is_near_duplicate,
    duplicateGroupId: row.duplicate_group_external_id,
    nearDuplicateGroupId: row.near_duplicate_group_external_id,
    recommendations: row.recommendations ?? undefined,
    videoMeta: row.video_meta ?? undefined,
    notes: row.notes ?? undefined,
    indexedAt: row.created_at,
    sha256: row.checksum ?? undefined,
    originalRelativePath: row.storage_object_key ?? undefined,
    derivatives,
  };
}

/**
 * PostgreSQL metadata repository (service-role server adapter).
 * UI depends only on MediaRepository — no direct Supabase SDK in components.
 */
export class PostgreSQLRepository implements MediaRepository {
  readonly name = 'postgresql-repository';
  readonly backend = 'postgres' as const;

  constructor(
    private readonly clientFactory: () => SupabaseClient = createSupabaseServiceClient,
  ) {}

  private client(): SupabaseClient {
    const config = validateSupabaseConfig({ requireServiceRole: true });
    if (!config.ok) {
      throw new Error(
        `PostgreSQLRepository unavailable: ${config.reason}. Keep MEDIA_REPOSITORY=json until Supabase is configured.`,
      );
    }
    return this.clientFactory();
  }

  async getCatalog(): Promise<CatalogDataSource> {
    const assets = await this.getAssets();
    const projects = await this.getProjects();
    const duplicates = await this.getDuplicateGroups();
    return {
      catalog: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        source: 'postgresql',
        isFixture: false,
        assets: [...assets],
      },
      projects: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        isFixture: false,
        projects: [...projects],
      },
      duplicates: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        isFixture: false,
        groups: [...duplicates],
      },
      searchIndex: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        isFixture: false,
        entries: assets.map((a) => ({
          id: a.id,
          text: [a.filename, a.manufacturer, a.boatName, a.repairCategory]
            .filter(Boolean)
            .join(' '),
          tokens: [],
        })),
      },
      sourcePath: 'postgresql://media_assets',
      isFixture: false,
    };
  }

  async getAssets(): Promise<readonly CatalogAsset[]> {
    const { data, error } = await this.client()
      .from('media_assets')
      .select('*')
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as AssetRow[];
    const derivMap = await this.loadDerivativesMap(rows.map((r) => r.id));
    return rows.map((row) => mapAsset(row, derivMap.get(row.id)));
  }

  async getAssetById(id: string): Promise<CatalogAsset | undefined> {
    const { data, error } = await this.client()
      .from('media_assets')
      .select('*')
      .eq('external_id', id)
      .is('archived_at', null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return undefined;
    const row = data as AssetRow;
    const derivMap = await this.loadDerivativesMap([row.id]);
    return mapAsset(row, derivMap.get(row.id));
  }

  async getProjects(): Promise<readonly CatalogProject[]> {
    const { data, error } = await this.client()
      .from('media_projects')
      .select('*')
      .is('archived_at', null);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.external_id as string,
      name: row.name as string,
      manufacturer: row.manufacturer ?? undefined,
      boatName: row.boat_name ?? undefined,
      boatType: row.boat_type ?? undefined,
      repairCategory: row.repair_category ?? undefined,
      folder: row.folder ?? undefined,
      mediaCount: Number(row.media_count ?? 0),
      imageCount: Number(row.image_count ?? 0),
      videoCount: Number(row.video_count ?? 0),
      beforeCount: Number(row.before_count ?? 0),
      duringCount: Number(row.during_count ?? 0),
      afterCount: Number(row.after_count ?? 0),
      bestWebsiteAssetId: row.best_website_asset_external_id ?? undefined,
      bestSocialAssetId: row.best_social_asset_external_id ?? undefined,
      topHeroAssetId: row.top_hero_asset_external_id ?? undefined,
      duplicateAlertCount: Number(row.duplicate_alert_count ?? 0),
      privacyAlertCount: Number(row.privacy_alert_count ?? 0),
      averageWebsiteScore:
        row.average_website_score != null
          ? Number(row.average_website_score)
          : undefined,
      averageMarketingScore:
        row.average_marketing_score != null
          ? Number(row.average_marketing_score)
          : undefined,
      averageTechnicalScore:
        row.average_technical_score != null
          ? Number(row.average_technical_score)
          : undefined,
      timelineStart: row.timeline_start ?? undefined,
      timelineEnd: row.timeline_end ?? undefined,
      notes: row.notes ?? undefined,
      assetIds: [],
    }));
  }

  async getProjectById(id: string): Promise<CatalogProject | undefined> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id);
  }

  async getDuplicateGroups(): Promise<readonly DuplicateGroup[]> {
    const client = this.client();
    const { data: groups, error } = await client
      .from('media_duplicate_groups')
      .select('*');
    if (error) throw new Error(error.message);
    const { data: members, error: memErr } = await client
      .from('media_duplicate_members')
      .select('*');
    if (memErr) throw new Error(memErr.message);
    return (groups ?? []).map((g) => ({
      id: g.external_id as string,
      kind: g.kind as 'exact' | 'near',
      similarity: Number(g.similarity ?? 0),
      recommendedKeepAssetId: g.recommended_keep_asset_external_id ?? undefined,
      notes: g.notes ?? undefined,
      members: (members ?? [])
        .filter((m) => m.group_id === g.id)
        .map((m) => ({
          assetId: m.asset_external_id as string,
          filename: m.filename ?? undefined,
          role: (m.role as 'original' | 'copy' | 'candidate') ?? 'copy',
        })),
    }));
  }

  async getDuplicateGroupById(id: string): Promise<DuplicateGroup | undefined> {
    const groups = await this.getDuplicateGroups();
    return groups.find((g) => g.id === id);
  }

  async resolvePrivateObject(
    assetId: string,
    kind: VaultObjectKind,
    size?: ThumbnailSize,
  ): Promise<PrivateObjectRef | null> {
    const client = this.client();
    const { data: asset, error } = await client
      .from('media_assets')
      .select(
        'id, external_id, file_type, storage_bucket, storage_object_key, file_size_bytes',
      )
      .eq('external_id', assetId)
      .maybeSingle();
    if (error || !asset) return null;

    let bucket: string;
    let objectKey: string;
    let contentType = asset.file_type as string;
    let bytes = Number(asset.file_size_bytes ?? 0);

    if (kind === 'original') {
      if (!asset.storage_bucket || !asset.storage_object_key) return null;
      bucket = asset.storage_bucket as string;
      objectKey = assertSafeObjectKey(asset.storage_object_key as string);
    } else {
      let query = client
        .from('media_asset_derivatives')
        .select('*')
        .eq('asset_id', asset.id)
        .eq('kind', kind);
      if (kind === 'thumbnail') {
        query = query.eq('size_px', size ?? 400);
      }
      const { data: deriv } = await query.maybeSingle();
      if (!deriv) return null;
      bucket = deriv.storage_bucket as string;
      objectKey = assertSafeObjectKey(deriv.object_key as string);
      contentType = deriv.content_type as string;
      bytes = Number(deriv.bytes ?? 0);
    }

    if (bucket !== bucketForKind(kind) && kind !== 'original') {
      // Soft check — allow configured bucket names from migration.
    }

    const { data: signed, error: signErr } = await client.storage
      .from(bucket)
      .createSignedUrl(objectKey, 60);

    if (signErr || !signed?.signedUrl) {
      await recordAuditEvent({
        action: 'storage_access_failure',
        resourceType: 'storage_object',
        resourceId: assetId,
        success: false,
        metadata: { kind, bucket },
      });
      return null;
    }

    return {
      kind,
      signedUrl: signed.signedUrl,
      contentType,
      bytes,
      size,
      storageBucket: bucket,
      objectKey,
    };
  }

  private async loadDerivativesMap(
    assetUuids: readonly string[],
  ): Promise<Map<string, CatalogAsset['derivatives']>> {
    const map = new Map<string, CatalogAsset['derivatives']>();
    if (assetUuids.length === 0) return map;
    const { data } = await this.client()
      .from('media_asset_derivatives')
      .select('*')
      .in('asset_id', [...assetUuids]);
    for (const row of data ?? []) {
      const current = map.get(row.asset_id as string) ?? {};
      const kind = row.kind as string;
      if (kind === 'thumbnail') {
        const thumbs = { ...(current.thumbnails ?? {}) };
        thumbs[String(row.size_px) as '200' | '400' | '800' | '1600'] =
          row.object_key as string;
        map.set(row.asset_id as string, { ...current, thumbnails: thumbs });
      } else if (
        kind === 'webp' ||
        kind === 'avif' ||
        kind === 'preview' ||
        kind === 'poster'
      ) {
        map.set(row.asset_id as string, {
          ...current,
          [kind]: row.object_key as string,
        });
      }
    }
    return map;
  }
}
