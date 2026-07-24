import type {
  CatalogAsset,
  CatalogDataSource,
  CatalogProject,
  DuplicateGroup,
} from '@/lib/media-library';

/**
 * Media Vault — Phase 3 storage types.
 * Originals are immutable. Derivatives are regenerable copies only.
 */

export const THUMBNAIL_SIZES = [200, 400, 800, 1600] as const;
export type ThumbnailSize = (typeof THUMBNAIL_SIZES)[number];

export type DerivativeKind =
  'thumbnail' | 'webp' | 'avif' | 'preview' | 'poster';

export type VaultObjectKind = 'original' | DerivativeKind;

export type VideoProbeMeta = {
  readonly durationSeconds: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly codec: string | null;
  readonly container: string | null;
  readonly frameRate: number | null;
};

export type VaultDerivatives = {
  readonly thumbnails?: Partial<Record<ThumbnailSize, string>>;
  readonly webp?: string;
  readonly avif?: string;
  readonly preview?: string;
  readonly poster?: string;
};

export type VaultAssetRecord = CatalogAsset & {
  readonly originalRelativePath?: string;
  readonly derivatives?: VaultDerivatives;
  readonly videoMeta?: VideoProbeMeta;
  readonly sha256?: string;
  readonly ingestedAt?: string;
};

export type PrivateObjectRef = {
  readonly kind: VaultObjectKind;
  /**
   * Local filesystem path (json/local-filesystem backends only).
   * Never expose to the client.
   */
  readonly absolutePath?: string;
  /**
   * Ephemeral signed URL for private Supabase Storage.
   * Never persist in the database. Never log query parameters.
   */
  readonly signedUrl?: string;
  readonly contentType: string;
  readonly bytes: number;
  readonly size?: ThumbnailSize;
  readonly storageBucket?: string;
  readonly objectKey?: string;
};

/**
 * UI and services depend only on this interface.
 * Backends are interchangeable (JSON / local FS / future Supabase / Postgres).
 */
export interface MediaRepository {
  readonly name: string;
  readonly backend: 'json' | 'local-filesystem' | 'supabase' | 'postgres';

  getCatalog(): Promise<CatalogDataSource>;
  getAssets(): Promise<readonly CatalogAsset[]>;
  getAssetById(id: string): Promise<CatalogAsset | undefined>;
  getProjects(): Promise<readonly CatalogProject[]>;
  getProjectById(id: string): Promise<CatalogProject | undefined>;
  getDuplicateGroups(): Promise<readonly DuplicateGroup[]>;
  getDuplicateGroupById(id: string): Promise<DuplicateGroup | undefined>;

  /**
   * Resolve a private vault object for an authenticated consumer.
   * Never returns a public CDN URL. Callers must stream via /media/vault.
   */
  resolvePrivateObject(
    assetId: string,
    kind: VaultObjectKind,
    size?: ThumbnailSize,
  ): Promise<PrivateObjectRef | null>;

  /** Optional cache invalidate after ingestion. */
  invalidate?(): Promise<void> | void;
}

export type MediaRepositoryBackend =
  'json' | 'local' | 'local-filesystem' | 'supabase' | 'postgres';
