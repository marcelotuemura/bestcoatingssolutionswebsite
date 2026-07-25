import type {
  CatalogAsset,
  CatalogMediaKind,
  CatalogStage,
} from './catalog-schema';

/**
 * Instant catalog search / filter / sort / pagination.
 * Target: search under 100ms for thousands of assets (in-memory).
 */

export type CatalogSort =
  | 'indexed_desc'
  | 'indexed_asc'
  | 'exif_desc'
  | 'exif_asc'
  | 'website_desc'
  | 'marketing_desc'
  | 'technical_desc'
  | 'filename_asc'
  | 'hero_rank';

export type CatalogFilters = {
  readonly q?: string;
  readonly manufacturer?: string;
  readonly boatType?: string;
  readonly repairCategory?: string;
  readonly stage?: CatalogStage | CatalogStage[];
  readonly mediaKind?: CatalogMediaKind | 'all';
  readonly hasExif?: boolean | 'any';
  readonly missingExif?: boolean;
  readonly websiteScoreMin?: number;
  readonly marketingScoreMin?: number;
  readonly technicalScoreMin?: number;
  readonly privacyWarnings?: boolean;
  readonly heroCandidate?: boolean;
  readonly duplicate?: boolean;
  readonly nearDuplicate?: boolean;
  readonly projectId?: string;
  readonly folder?: string;
  readonly camera?: string;
  readonly boatName?: string;
  readonly landscapeOnly?: boolean;
  readonly noPrivacyIssues?: boolean;
  readonly dateFrom?: string;
  readonly dateTo?: string;
};

export type CatalogQueryOptions = CatalogFilters & {
  readonly sort?: CatalogSort;
  readonly page?: number;
  readonly pageSize?: number;
};

export type CatalogQueryResult = {
  readonly items: readonly CatalogAsset[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly pageCount: number;
  readonly durationMs: number;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(q: string): string[] {
  return normalize(q)
    .split(/[\s,/|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function assetSearchBlob(asset: CatalogAsset): string {
  return [
    asset.filename,
    asset.originalFilename,
    asset.folder,
    asset.projectName,
    asset.projectId,
    asset.manufacturer,
    asset.boatName,
    asset.boatType,
    asset.repairCategory,
    asset.stage,
    asset.camera,
    asset.exifDate,
    asset.resolution,
    asset.fileType,
    asset.privacyStatus,
    ...(asset.keywords ?? []),
    String(asset.scores.website),
    String(asset.scores.marketing),
    String(asset.scores.technical),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesFilters(asset: CatalogAsset, filters: CatalogFilters): boolean {
  if (filters.manufacturer) {
    if (
      normalize(asset.manufacturer ?? '') !== normalize(filters.manufacturer)
    ) {
      return false;
    }
  }
  if (filters.boatType) {
    if (normalize(asset.boatType ?? '') !== normalize(filters.boatType)) {
      return false;
    }
  }
  if (filters.repairCategory) {
    if (
      normalize(asset.repairCategory ?? '') !==
      normalize(filters.repairCategory)
    ) {
      return false;
    }
  }
  if (filters.stage) {
    const stages = Array.isArray(filters.stage)
      ? filters.stage
      : [filters.stage];
    if (!stages.includes(asset.stage)) return false;
  }
  if (filters.mediaKind && filters.mediaKind !== 'all') {
    if (asset.mediaKind !== filters.mediaKind) return false;
  }
  if (filters.hasExif === true && !asset.hasExif) return false;
  if (filters.hasExif === false && asset.hasExif) return false;
  if (filters.missingExif && asset.hasExif) return false;
  if (
    typeof filters.websiteScoreMin === 'number' &&
    asset.scores.website < filters.websiteScoreMin
  ) {
    return false;
  }
  if (
    typeof filters.marketingScoreMin === 'number' &&
    asset.scores.marketing < filters.marketingScoreMin
  ) {
    return false;
  }
  if (
    typeof filters.technicalScoreMin === 'number' &&
    asset.scores.technical < filters.technicalScoreMin
  ) {
    return false;
  }
  if (filters.privacyWarnings) {
    if (asset.privacyStatus === 'clear') return false;
  }
  if (filters.heroCandidate && !asset.isHeroCandidate) return false;
  if (filters.duplicate && !asset.isExactDuplicate) return false;
  if (filters.nearDuplicate && !asset.isNearDuplicate) return false;
  if (filters.projectId && asset.projectId !== filters.projectId) return false;
  if (filters.folder) {
    if (!normalize(asset.folder).includes(normalize(filters.folder))) {
      return false;
    }
  }
  if (filters.camera) {
    if (!normalize(asset.camera ?? '').includes(normalize(filters.camera))) {
      return false;
    }
  }
  if (filters.boatName) {
    if (
      !normalize(asset.boatName ?? '').includes(normalize(filters.boatName))
    ) {
      return false;
    }
  }
  if (filters.landscapeOnly && asset.orientation !== 'landscape') return false;
  if (filters.noPrivacyIssues && asset.privacyStatus !== 'clear') return false;
  if (filters.dateFrom && asset.exifDate) {
    if (asset.exifDate < filters.dateFrom) return false;
  }
  if (filters.dateTo && asset.exifDate) {
    if (asset.exifDate > filters.dateTo) return false;
  }

  const q = filters.q?.trim();
  if (q) {
    const tokens = tokenize(q);
    const blob = assetSearchBlob(asset);
    if (!tokens.every((token) => blob.includes(token))) return false;
  }

  return true;
}

function compareAssets(
  a: CatalogAsset,
  b: CatalogAsset,
  sort: CatalogSort,
): number {
  switch (sort) {
    case 'indexed_asc':
      return (a.indexedAt ?? '').localeCompare(b.indexedAt ?? '');
    case 'exif_desc':
      return (b.exifDate ?? '').localeCompare(a.exifDate ?? '');
    case 'exif_asc':
      return (a.exifDate ?? '').localeCompare(b.exifDate ?? '');
    case 'website_desc':
      return b.scores.website - a.scores.website;
    case 'marketing_desc':
      return b.scores.marketing - a.scores.marketing;
    case 'technical_desc':
      return b.scores.technical - a.scores.technical;
    case 'filename_asc':
      return a.filename.localeCompare(b.filename);
    case 'hero_rank': {
      const score = (asset: CatalogAsset) =>
        asset.scores.website * 0.35 +
        asset.scores.marketing * 0.3 +
        (asset.scores.quality ?? asset.scores.technical) * 0.2 +
        (asset.orientation === 'landscape' ? 8 : 0) +
        (asset.privacyStatus === 'clear' ? 7 : 0) +
        (asset.isHeroCandidate ? 5 : 0);
      return score(b) - score(a);
    }
    case 'indexed_desc':
    default:
      return (b.indexedAt ?? '').localeCompare(a.indexedAt ?? '');
  }
}

export function queryCatalogAssets(
  assets: readonly CatalogAsset[],
  options: CatalogQueryOptions = {},
): CatalogQueryResult {
  const started = performance.now();
  const sort = options.sort ?? 'indexed_desc';
  const pageSize = Math.min(Math.max(options.pageSize ?? 48, 1), 200);
  const page = Math.max(options.page ?? 1, 1);

  const filtered = assets.filter((asset) => matchesFilters(asset, options));
  filtered.sort((a, b) => compareAssets(a, b, sort));

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const durationMs = performance.now() - started;

  return {
    items,
    total,
    page: safePage,
    pageSize,
    pageCount,
    durationMs,
  };
}

export function uniqueFacetValues(
  assets: readonly CatalogAsset[],
  field:
    | 'manufacturer'
    | 'boatType'
    | 'repairCategory'
    | 'stage'
    | 'camera'
    | 'folder'
    | 'projectName',
): string[] {
  const set = new Set<string>();
  for (const asset of assets) {
    const value = asset[field];
    if (typeof value === 'string' && value.trim()) set.add(value);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function parseCatalogSearchParams(
  params: Record<string, string | string[] | undefined>,
): CatalogQueryOptions {
  const one = (key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };
  const bool = (key: string): boolean | undefined => {
    const value = one(key);
    if (value === '1' || value === 'true') return true;
    if (value === '0' || value === 'false') return false;
    return undefined;
  };
  const num = (key: string): number | undefined => {
    const value = one(key);
    if (!value) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  };

  const mediaKindRaw = one('mediaKind');
  const mediaKind =
    mediaKindRaw === 'image' ||
    mediaKindRaw === 'video' ||
    mediaKindRaw === 'all'
      ? mediaKindRaw
      : undefined;

  const stageRaw = one('stage');
  const stage = stageRaw ? (stageRaw as CatalogStage) : undefined;

  return {
    q: one('q'),
    manufacturer: one('manufacturer'),
    boatType: one('boatType'),
    repairCategory: one('repairCategory'),
    stage,
    mediaKind,
    hasExif: bool('hasExif'),
    missingExif: bool('missingExif'),
    websiteScoreMin: num('websiteScoreMin'),
    marketingScoreMin: num('marketingScoreMin'),
    technicalScoreMin: num('technicalScoreMin'),
    privacyWarnings: bool('privacyWarnings'),
    heroCandidate: bool('heroCandidate'),
    duplicate: bool('duplicate'),
    nearDuplicate: bool('nearDuplicate'),
    projectId: one('projectId'),
    folder: one('folder'),
    camera: one('camera'),
    boatName: one('boatName'),
    landscapeOnly: bool('landscapeOnly'),
    noPrivacyIssues: bool('noPrivacyIssues'),
    dateFrom: one('dateFrom'),
    dateTo: one('dateTo'),
    sort: (one('sort') as CatalogSort | undefined) ?? undefined,
    page: num('page'),
    pageSize: num('pageSize'),
  };
}
