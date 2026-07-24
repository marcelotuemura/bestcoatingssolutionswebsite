import type {
  CatalogAsset,
  CatalogDataSource,
  CatalogProject,
  DuplicateGroup,
} from '@/lib/media-library';
import {
  clearCatalogDiskCache,
  loadCatalogJsonFromDisk,
} from '@/lib/media-library/catalog-loader';
import type {
  MediaRepository,
  PrivateObjectRef,
  ThumbnailSize,
  VaultObjectKind,
} from '@/lib/media-vault/types';

/**
 * Catalog-backed repository used by Phase 2 UI.
 * Reads JSON reports only — no binary mutation.
 */
export class JsonMediaRepository implements MediaRepository {
  readonly name = 'json-media-repository';
  readonly backend = 'json' as const;

  async getCatalog(): Promise<CatalogDataSource> {
    return loadCatalogJsonFromDisk();
  }

  async getAssets(): Promise<readonly CatalogAsset[]> {
    const data = await this.getCatalog();
    return data.catalog.assets;
  }

  async getAssetById(id: string): Promise<CatalogAsset | undefined> {
    const assets = await this.getAssets();
    return assets.find((asset) => asset.id === id);
  }

  async getProjects(): Promise<readonly CatalogProject[]> {
    const data = await this.getCatalog();
    return data.projects.projects;
  }

  async getProjectById(id: string): Promise<CatalogProject | undefined> {
    const projects = await this.getProjects();
    return projects.find((project) => project.id === id);
  }

  async getDuplicateGroups(): Promise<readonly DuplicateGroup[]> {
    const data = await this.getCatalog();
    return data.duplicates.groups;
  }

  async getDuplicateGroupById(id: string): Promise<DuplicateGroup | undefined> {
    const groups = await this.getDuplicateGroups();
    return groups.find((group) => group.id === id);
  }

  async resolvePrivateObject(
    _assetId: string,
    _kind: VaultObjectKind,
    _size?: ThumbnailSize,
  ): Promise<PrivateObjectRef | null> {
    // JSON catalog has no local vault binaries by default.
    return null;
  }

  invalidate(): void {
    clearCatalogDiskCache();
  }
}
