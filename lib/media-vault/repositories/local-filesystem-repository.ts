import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  CatalogAsset,
  CatalogDataSource,
  CatalogProject,
  DuplicateGroup,
} from '@/lib/media-library';
import {
  duplicatesReportSchema,
  mediaCatalogSchema,
  projectsReportSchema,
  searchIndexSchema,
} from '@/lib/media-library/catalog-schema';
import { generateFixtureCatalog } from '@/lib/media-library/fixture-catalog';
import { fileExists } from '@/lib/media-vault/checksum';
import {
  assertInsideVault,
  getVaultLayout,
  resolveVaultRoot,
  type VaultLayout,
} from '@/lib/media-vault/layout';
import type {
  MediaRepository,
  PrivateObjectRef,
  ThumbnailSize,
  VaultAssetRecord,
  VaultObjectKind,
} from '@/lib/media-vault/types';

async function readJsonFile(
  filePath: string,
): Promise<
  | { readonly status: 'ok'; readonly value: unknown }
  | { readonly status: 'missing' }
  | { readonly status: 'invalid'; readonly error: string }
> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    try {
      return { status: 'ok', value: JSON.parse(raw) as unknown };
    } catch {
      return {
        status: 'invalid',
        error: `Invalid JSON in vault catalog: ${filePath}`,
      };
    }
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    if (code === 'ENOENT') return { status: 'missing' };
    return {
      status: 'invalid',
      error: `Unable to read vault catalog: ${filePath}`,
    };
  }
}

function contentTypeFor(kind: VaultObjectKind, filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (kind === 'webp' || ext === '.webp') return 'image/webp';
  if (kind === 'avif' || ext === '.avif') return 'image/avif';
  if (ext === '.png') return 'image/png';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.mov') return 'video/quicktime';
  return 'image/jpeg';
}

/**
 * Local filesystem vault repository.
 * Reads originals + private derivatives under MEDIA_VAULT_ROOT.
 * Never overwrites or deletes originals.
 */
export class LocalFilesystemRepository implements MediaRepository {
  readonly name = 'local-filesystem-repository';
  readonly backend = 'local-filesystem' as const;
  private readonly layout: VaultLayout;
  private cache: CatalogDataSource | null = null;

  constructor(vaultRoot = resolveVaultRoot()) {
    this.layout = getVaultLayout(vaultRoot);
  }

  private async loadCatalog(): Promise<CatalogDataSource> {
    if (this.cache) return this.cache;

    const vaultManifest = path.join(
      this.layout.manifests,
      'media_catalog.json',
    );
    const candidates = [
      vaultManifest,
      path.join(this.layout.reports, 'media_catalog.json'),
      path.join(process.cwd(), 'data', 'media-catalog', 'media_catalog.json'),
    ];

    let catalogRaw: unknown | null = null;
    let catalogDir: string | null = null;
    for (const candidate of candidates) {
      const result = await readJsonFile(candidate);
      if (result.status === 'invalid') {
        // Fail closed for an existing but corrupt vault manifest — never
        // silently replace with fixtures.
        if (candidate === vaultManifest) {
          throw new Error(result.error);
        }
        continue;
      }
      if (result.status === 'ok') {
        catalogRaw = result.value;
        catalogDir = path.dirname(candidate);
        break;
      }
    }

    if (!catalogRaw || !catalogDir) {
      const fixture = generateFixtureCatalog(240);
      this.cache = {
        catalog: fixture.catalog,
        projects: fixture.projects,
        duplicates: fixture.duplicates,
        searchIndex: fixture.searchIndex,
        sourcePath: 'fixture://media-vault',
        isFixture: true,
      };
      return this.cache;
    }

    async function readOptionalJson(
      primary: string,
      fallback: string,
    ): Promise<unknown | null> {
      const first = await readJsonFile(primary);
      if (first.status === 'ok') return first.value;
      const second = await readJsonFile(fallback);
      return second.status === 'ok' ? second.value : null;
    }

    const projectsRaw = await readOptionalJson(
      path.join(catalogDir, 'projects_report.json'),
      path.join(this.layout.manifests, 'projects_report.json'),
    );
    const duplicatesRaw = await readOptionalJson(
      path.join(catalogDir, 'duplicates_report.json'),
      path.join(this.layout.manifests, 'duplicates_report.json'),
    );
    const searchRaw = await readOptionalJson(
      path.join(catalogDir, 'search_index.json'),
      path.join(this.layout.manifests, 'search_index.json'),
    );

    let catalog;
    try {
      catalog = mediaCatalogSchema.parse(catalogRaw);
    } catch (error) {
      if (catalogDir === this.layout.manifests) {
        throw new Error(
          `Vault manifest failed schema validation: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      throw error;
    }
    const projects = projectsRaw
      ? projectsReportSchema.parse(projectsRaw)
      : { generatedAt: catalog.generatedAt, version: '1.0', projects: [] };
    const duplicates = duplicatesRaw
      ? duplicatesReportSchema.parse(duplicatesRaw)
      : { generatedAt: catalog.generatedAt, version: '1.0', groups: [] };
    const searchIndex = searchRaw
      ? searchIndexSchema.parse(searchRaw)
      : { generatedAt: catalog.generatedAt, version: '1.0', entries: [] };

    this.cache = {
      catalog,
      projects,
      duplicates,
      searchIndex,
      sourcePath: catalogDir,
      isFixture: Boolean(catalog.isFixture),
    };
    return this.cache;
  }

  async getCatalog(): Promise<CatalogDataSource> {
    return this.loadCatalog();
  }

  async getAssets(): Promise<readonly CatalogAsset[]> {
    return (await this.loadCatalog()).catalog.assets;
  }

  async getAssetById(id: string): Promise<CatalogAsset | undefined> {
    return (await this.getAssets()).find((asset) => asset.id === id);
  }

  async getProjects(): Promise<readonly CatalogProject[]> {
    return (await this.loadCatalog()).projects.projects;
  }

  async getProjectById(id: string): Promise<CatalogProject | undefined> {
    return (await this.getProjects()).find((project) => project.id === id);
  }

  async getDuplicateGroups(): Promise<readonly DuplicateGroup[]> {
    return (await this.loadCatalog()).duplicates.groups;
  }

  async getDuplicateGroupById(id: string): Promise<DuplicateGroup | undefined> {
    return (await this.getDuplicateGroups()).find((group) => group.id === id);
  }

  async resolvePrivateObject(
    assetId: string,
    kind: VaultObjectKind,
    size?: ThumbnailSize,
  ): Promise<PrivateObjectRef | null> {
    const asset = (await this.getAssetById(assetId)) as
      VaultAssetRecord | undefined;
    if (!asset) return null;

    let relative: string | undefined;
    if (kind === 'original') {
      relative =
        asset.originalRelativePath ??
        (asset.folder && asset.filename
          ? path.join(asset.folder, asset.filename)
          : undefined);
      // Prefer vault originals/<id>.<ext> convention from ingestion.
      if (!relative) {
        const guess = path.join('originals', asset.filename);
        if (await fileExists(path.join(this.layout.root, guess))) {
          relative = guess;
        }
      }
    } else if (kind === 'thumbnail') {
      const thumbSize = size ?? 400;
      relative = asset.derivatives?.thumbnails?.[thumbSize];
    } else if (kind === 'webp') {
      relative = asset.derivatives?.webp;
    } else if (kind === 'avif') {
      relative = asset.derivatives?.avif;
    } else if (kind === 'preview') {
      relative = asset.derivatives?.preview;
    } else if (kind === 'poster') {
      relative = asset.derivatives?.poster;
    }

    // Also accept catalog thumbnailPath / previewPath if they are vault-relative.
    if (!relative && kind === 'thumbnail') {
      relative = asset.thumbnailPath ?? undefined;
    }
    if (!relative && kind === 'preview') {
      relative = asset.previewPath ?? undefined;
    }

    if (!relative) return null;

    // Map legacy "01_Originals/..." style paths into vault originals when present.
    let absolute = path.isAbsolute(relative)
      ? relative
      : path.join(this.layout.root, relative);

    // If originalRelativePath points outside vault (Mac path), try vault copy.
    if (kind === 'original' && !(await fileExists(absolute))) {
      const vaultCopy = path.join(this.layout.originals, asset.filename);
      if (await fileExists(vaultCopy)) absolute = vaultCopy;
      else return null;
    }

    try {
      absolute = assertInsideVault(this.layout.root, absolute);
    } catch {
      return null;
    }

    if (!(await fileExists(absolute))) return null;
    const stat = await fs.stat(absolute);
    return {
      kind,
      absolutePath: absolute,
      contentType: contentTypeFor(kind, absolute),
      bytes: stat.size,
      size: kind === 'thumbnail' ? size : undefined,
    };
  }

  invalidate(): void {
    this.cache = null;
  }
}
