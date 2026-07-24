import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  duplicatesReportSchema,
  mediaCatalogSchema,
  projectsReportSchema,
  searchIndexSchema,
  type CatalogAsset,
  type CatalogProject,
  type DuplicateGroup,
  type DuplicatesReport,
  type MediaCatalog,
  type ProjectsReport,
  type SearchIndex,
} from './catalog-schema';
import { generateFixtureCatalog } from './fixture-catalog';

export type CatalogDataSource = {
  readonly catalog: MediaCatalog;
  readonly projects: ProjectsReport;
  readonly duplicates: DuplicatesReport;
  readonly searchIndex: SearchIndex;
  readonly sourcePath: string;
  readonly isFixture: boolean;
};

const DEFAULT_RELATIVE_DIR = 'data/media-catalog';

function resolveCatalogDir(): string {
  const configured = process.env.MEDIA_CATALOG_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), DEFAULT_RELATIVE_DIR);
}

async function readJsonIfExists(filePath: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

let cache: CatalogDataSource | null = null;
let cacheKey: string | null = null;

/**
 * Loads catalog reports from MEDIA_CATALOG_DIR / data/media-catalog.
 * Expected filenames (08_Reports sync):
 *   media_catalog.json
 *   projects_report.json
 *   duplicates_report.json
 *   search_index.json (optional)
 *
 * Falls back to deterministic fixtures when reports are absent.
 * Never modifies files. Read-only.
 */
export async function loadCatalogDataSource(
  options: { readonly forceReload?: boolean } = {},
): Promise<CatalogDataSource> {
  const dir = resolveCatalogDir();
  const key = dir;
  if (!options.forceReload && cache && cacheKey === key) {
    return cache;
  }

  const catalogRaw = await readJsonIfExists(
    path.join(dir, 'media_catalog.json'),
  );
  const projectsRaw = await readJsonIfExists(
    path.join(dir, 'projects_report.json'),
  );
  const duplicatesRaw = await readJsonIfExists(
    path.join(dir, 'duplicates_report.json'),
  );
  const searchRaw = await readJsonIfExists(path.join(dir, 'search_index.json'));

  if (catalogRaw && projectsRaw && duplicatesRaw) {
    const catalog = mediaCatalogSchema.parse(catalogRaw);
    const projects = projectsReportSchema.parse(projectsRaw);
    const duplicates = duplicatesReportSchema.parse(duplicatesRaw);
    const searchIndex = searchRaw
      ? searchIndexSchema.parse(searchRaw)
      : {
          generatedAt: catalog.generatedAt,
          version: '1.0',
          entries: [],
        };

    const source: CatalogDataSource = {
      catalog,
      projects,
      duplicates,
      searchIndex,
      sourcePath: dir,
      isFixture: Boolean(catalog.isFixture),
    };
    cache = source;
    cacheKey = key;
    return source;
  }

  const fixture = generateFixtureCatalog(240);
  const source: CatalogDataSource = {
    catalog: fixture.catalog,
    projects: fixture.projects,
    duplicates: fixture.duplicates,
    searchIndex: fixture.searchIndex,
    sourcePath: 'fixture://media-library',
    isFixture: true,
  };
  cache = source;
  cacheKey = key;
  return source;
}

/** Sync helper for unit tests — bypasses filesystem. */
export function setCatalogDataSourceForTests(
  source: CatalogDataSource | null,
): void {
  cache = source;
  cacheKey = source ? 'test' : null;
}

export async function getCatalogAssets(): Promise<readonly CatalogAsset[]> {
  const data = await loadCatalogDataSource();
  return data.catalog.assets;
}

export async function getCatalogProjects(): Promise<readonly CatalogProject[]> {
  const data = await loadCatalogDataSource();
  return data.projects.projects;
}

export async function getDuplicateGroups(): Promise<readonly DuplicateGroup[]> {
  const data = await loadCatalogDataSource();
  return data.duplicates.groups;
}

export async function getCatalogAssetById(
  id: string,
): Promise<CatalogAsset | undefined> {
  const assets = await getCatalogAssets();
  return assets.find((asset) => asset.id === id);
}

export async function getCatalogProjectById(
  id: string,
): Promise<CatalogProject | undefined> {
  const projects = await getCatalogProjects();
  return projects.find((project) => project.id === id);
}

export async function getDuplicateGroupById(
  id: string,
): Promise<DuplicateGroup | undefined> {
  const groups = await getDuplicateGroups();
  return groups.find((group) => group.id === id);
}

export function clearCatalogCache(): void {
  cache = null;
  cacheKey = null;
}
