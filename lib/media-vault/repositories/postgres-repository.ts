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
 * Future PostgreSQL metadata repository.
 * Interface-only stub — not implemented in Phase 3.
 * Intended to pair with Supabase Storage for binaries.
 */
export class PostgreSQLRepository implements MediaRepository {
  readonly name = 'postgresql-repository';
  readonly backend = 'postgres' as const;

  private notReady(): never {
    throw new Error(
      'PostgreSQLRepository is not implemented yet. Use json or local-filesystem backends. See docs/MEDIA_VAULT_PHASE3.md migration plan.',
    );
  }

  async getCatalog(): Promise<CatalogDataSource> {
    this.notReady();
  }

  async getAssets(): Promise<readonly CatalogAsset[]> {
    this.notReady();
  }

  async getAssetById(_id: string): Promise<CatalogAsset | undefined> {
    this.notReady();
  }

  async getProjects(): Promise<readonly CatalogProject[]> {
    this.notReady();
  }

  async getProjectById(_id: string): Promise<CatalogProject | undefined> {
    this.notReady();
  }

  async getDuplicateGroups(): Promise<readonly DuplicateGroup[]> {
    this.notReady();
  }

  async getDuplicateGroupById(
    _id: string,
  ): Promise<DuplicateGroup | undefined> {
    this.notReady();
  }

  async resolvePrivateObject(
    _assetId: string,
    _kind: VaultObjectKind,
    _size?: ThumbnailSize,
  ): Promise<PrivateObjectRef | null> {
    this.notReady();
  }
}
