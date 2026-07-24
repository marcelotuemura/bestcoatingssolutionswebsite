import { PostgreSQLRepository } from '@/lib/media-vault/repositories/postgres-repository';
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

/**
 * Supabase Storage + Postgres catalog backend.
 * Metadata via PostgreSQLRepository; private objects via signed URLs.
 * UI depends only on MediaRepository.
 */
export class SupabaseStorageRepository implements MediaRepository {
  readonly name = 'supabase-storage-repository';
  readonly backend = 'supabase' as const;

  private readonly postgres: PostgreSQLRepository;

  constructor(postgres = new PostgreSQLRepository()) {
    this.postgres = postgres;
  }

  getCatalog(): Promise<CatalogDataSource> {
    return this.postgres.getCatalog();
  }

  getAssets(): Promise<readonly CatalogAsset[]> {
    return this.postgres.getAssets();
  }

  getAssetById(id: string): Promise<CatalogAsset | undefined> {
    return this.postgres.getAssetById(id);
  }

  getProjects(): Promise<readonly CatalogProject[]> {
    return this.postgres.getProjects();
  }

  getProjectById(id: string): Promise<CatalogProject | undefined> {
    return this.postgres.getProjectById(id);
  }

  getDuplicateGroups(): Promise<readonly DuplicateGroup[]> {
    return this.postgres.getDuplicateGroups();
  }

  getDuplicateGroupById(id: string): Promise<DuplicateGroup | undefined> {
    return this.postgres.getDuplicateGroupById(id);
  }

  resolvePrivateObject(
    assetId: string,
    kind: VaultObjectKind,
    size?: ThumbnailSize,
  ): Promise<PrivateObjectRef | null> {
    return this.postgres.resolvePrivateObject(assetId, kind, size);
  }
}
