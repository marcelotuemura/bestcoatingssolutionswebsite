import { Suspense } from 'react';
import Link from 'next/link';
import {
  CatalogFilters,
  CatalogSearchBar,
} from '@/components/media-library/CatalogFilters';
import {
  CatalogGallery,
  CatalogPagination,
} from '@/components/media-library/CatalogGallery';
import { GalleryFilters } from '@/components/media-intelligence/GalleryFilters';
import { GalleryWorkspaceView } from '@/components/media-intelligence/GalleryWorkspaceView';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { listGalleryAssets } from '@/lib/media-intelligence/gallery';
import type {
  GalleryAsset,
  GalleryListParams,
  GallerySort,
} from '@/lib/media-intelligence/gallery/types';
import { searchCatalogWithAiEnrichment } from '@/lib/media-intelligence/vision/search-enrichment';
import {
  loadAiAnalysisIndex,
  loadCatalogDataSource,
  parseCatalogSearchParams,
  uniqueFacetValues,
} from '@/lib/media-library';

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseGalleryParams(
  raw: Record<string, string | string[] | undefined>,
): Partial<GalleryListParams> & {
  view: 'grid' | 'compact' | 'list';
  thumb: 'sm' | 'md' | 'lg';
} {
  const page = Number(one(raw.page) ?? '1');
  const pageSize = Number(one(raw.pageSize) ?? '48');
  const sort = (one(raw.sort) ?? 'created_desc') as GallerySort;
  const viewRaw = one(raw.view) ?? 'grid';
  const view = viewRaw === 'compact' || viewRaw === 'list' ? viewRaw : 'grid';
  const thumbRaw = one(raw.thumb) ?? 'md';
  const thumb = thumbRaw === 'sm' || thumbRaw === 'lg' ? thumbRaw : 'md';

  return {
    workspaceId: one(raw.workspaceId) ?? 'bcs-default',
    q: one(raw.q) || undefined,
    kind:
      one(raw.kind) === 'video' || one(raw.kind) === 'image'
        ? (one(raw.kind) as 'image' | 'video')
        : undefined,
    privacy:
      one(raw.privacy) === 'clear' ||
      one(raw.privacy) === 'flagged' ||
      one(raw.privacy) === 'blocked' ||
      one(raw.privacy) === 'reviewed'
        ? (one(raw.privacy) as GalleryListParams['privacy'])
        : undefined,
    reviewStatus:
      one(raw.reviewStatus) === 'none' ||
      one(raw.reviewStatus) === 'pending' ||
      one(raw.reviewStatus) === 'in_review' ||
      one(raw.reviewStatus) === 'approved' ||
      one(raw.reviewStatus) === 'rejected'
        ? (one(raw.reviewStatus) as GalleryListParams['reviewStatus'])
        : undefined,
    onlyFavorites: one(raw.favorites) === '1' || one(raw.favorites) === 'true',
    archived: one(raw.archived) === '1' || one(raw.archived) === 'true',
    collectionId: one(raw.collectionId) || undefined,
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 200
        ? pageSize
        : 48,
    view,
    thumb,
  };
}

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMediaPageAccess();
  const raw = await searchParams;
  const source = one(raw.source) ?? 'workspace';

  const flatParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    flatParams[key] = Array.isArray(value) ? value[0] : value;
  }

  if (source === 'catalog') {
    const options = parseCatalogSearchParams(raw);
    const data = await loadCatalogDataSource();
    const aiByAssetId = await loadAiAnalysisIndex();
    const result = searchCatalogWithAiEnrichment(data.catalog.assets, {
      ...options,
      pageSize: options.pageSize ?? 48,
      aiByAssetId,
      includeAiText: true,
    });
    const facets = {
      manufacturers: uniqueFacetValues(data.catalog.assets, 'manufacturer'),
      boatTypes: uniqueFacetValues(data.catalog.assets, 'boatType'),
      repairCategories: uniqueFacetValues(
        data.catalog.assets,
        'repairCategory',
      ),
      stages: uniqueFacetValues(data.catalog.assets, 'stage'),
    };
    const viewMode = (one(raw.view) as string) || 'grid';

    return (
      <MediaShell
        title="Media Gallery"
        subtitle="Catalog browse — fixture/report assets for research. Workspace uploads live under Workspace Gallery."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/media/library?source=workspace"
              className="border-navy-700 text-silver-400 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
            >
              Workspace
            </Link>
            <span className="border-electric-500 text-electric-400 bg-navy-900/90 rounded-lg border px-3 py-1.5 text-xs">
              Catalog
            </span>
            <span className="text-silver-500 mx-2 text-xs">View:</span>
            {(['grid', 'compact', 'list'] as const).map((mode) => (
              <a
                key={mode}
                href={`?${new URLSearchParams({ ...flatParams, source: 'catalog', view: mode }).toString()}`}
                data-testid={`view-mode-${mode}`}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  viewMode === mode
                    ? 'border-electric-500 text-electric-400 bg-navy-900/90'
                    : 'border-navy-700 text-silver-400 hover:border-electric-500 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </a>
            ))}
          </div>
          <Link
            href="/media/upload"
            data-testid="gallery-upload-link"
            className="border-electric-500 text-electric-400 hover:bg-electric-500/10 rounded-lg border px-3 py-1.5 text-xs transition"
          >
            + Upload
          </Link>
        </div>

        <Suspense fallback={null}>
          <CatalogSearchBar />
          <CatalogFilters facets={facets} />
        </Suspense>

        <p
          className="text-silver-500 media-light:text-slate-500 mt-4 text-sm"
          data-testid="catalog-search-meta"
        >
          {result.total} asset{result.total === 1 ? '' : 's'}
          {options.q ? ` matching "${options.q}"` : ''} · query{' '}
          {result.durationMs.toFixed(1)}ms
        </p>

        {viewMode === 'list' ? (
          <div
            className="border-navy-700 divide-navy-700 mt-4 divide-y overflow-hidden rounded-2xl border"
            data-testid="gallery-list-view"
          >
            {result.items.map((asset) => (
              <a
                key={asset.id}
                href={`/media/assets/${asset.id}`}
                className="hover:bg-navy-900/60 flex items-center gap-4 px-4 py-3 transition"
              >
                <span className="text-silver-300 w-64 truncate text-sm font-medium">
                  {asset.originalFilename}
                </span>
                <span className="text-silver-500 text-xs">
                  {asset.mediaKind}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <CatalogGallery assets={result.items} />
        )}
        <CatalogPagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          basePath="/media/library"
          searchParams={{ ...flatParams, source: 'catalog' }}
        />
      </MediaShell>
    );
  }

  // ── Workspace gallery (Phase 7 default) ───────────────────────────────────
  const galleryParams = parseGalleryParams(raw);
  const session = await resolveMediaTrustedActor();

  let assets: GalleryAsset[] = [];
  let total = 0;
  let page = galleryParams.page ?? 1;
  let pageCount = 1;
  let durationMs = 0;
  let loadError: string | null = null;

  if (session.ok) {
    try {
      const result = await listGalleryAssets(session.actor, galleryParams);
      if (result.ok) {
        assets = [...result.data.assets];
        total = result.data.total;
        page = result.data.page;
        pageCount = result.data.pageCount;
        durationMs = result.data.durationMs;
      } else {
        loadError = result.error;
      }
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : 'Gallery database is not configured.';
    }
  } else {
    loadError = 'Sign in required to browse workspace gallery.';
  }

  const viewMode = galleryParams.view;
  const thumbSize = galleryParams.thumb;

  return (
    <MediaShell
      title="Media Gallery"
      subtitle="Visual DAMS Gallery — upload, browse, filter, favorite, and prepare publication drafts."
      readOnlyBanner={false}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-electric-500 text-electric-400 bg-navy-900/90 rounded-lg border px-3 py-1.5 text-xs">
            Workspace
          </span>
          <Link
            href="/media/library?source=catalog"
            className="border-navy-700 text-silver-400 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
          >
            Catalog
          </Link>
          <span className="text-silver-500 mx-2 text-xs">View:</span>
          {(['grid', 'compact', 'list'] as const).map((mode) => (
            <a
              key={mode}
              href={`?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(flatParams).filter(
                    (entry): entry is [string, string] => Boolean(entry[1]),
                  ),
                ),
                source: 'workspace',
                view: mode,
              }).toString()}`}
              data-testid={`view-mode-${mode}`}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                viewMode === mode
                  ? 'border-electric-500 text-electric-400 bg-navy-900/90'
                  : 'border-navy-700 text-silver-400 hover:border-electric-500 hover:text-white'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </a>
          ))}
          <span className="text-silver-500 mx-1 text-xs">Size:</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <a
              key={size}
              href={`?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(flatParams).filter(
                    (entry): entry is [string, string] => Boolean(entry[1]),
                  ),
                ),
                source: 'workspace',
                thumb: size,
              }).toString()}`}
              data-testid={`thumb-size-${size}`}
              className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
                thumbSize === size
                  ? 'border-electric-500 text-electric-400'
                  : 'border-navy-700 text-silver-400 hover:border-electric-500'
              }`}
            >
              {size.toUpperCase()}
            </a>
          ))}
        </div>
        <Link
          href="/media/upload"
          data-testid="gallery-upload-link"
          className="border-electric-500 text-electric-400 hover:bg-electric-500/10 rounded-lg border px-3 py-1.5 text-xs transition"
        >
          + Upload
        </Link>
      </div>

      <form
        action="/media/library"
        method="get"
        className="mb-3 flex flex-wrap gap-2"
        role="search"
      >
        <input type="hidden" name="source" value="workspace" />
        <input type="hidden" name="view" value={viewMode} />
        <input type="hidden" name="thumb" value={thumbSize} />
        <label className="sr-only" htmlFor="gallery-q">
          Search workspace gallery
        </label>
        <input
          id="gallery-q"
          name="q"
          defaultValue={galleryParams.q ?? ''}
          placeholder="Search filename, title, tags, vessel…"
          className="border-navy-700 bg-navy-950 focus:border-electric-500 min-w-[220px] flex-1 rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
          data-testid="gallery-search"
        />
        <button
          type="submit"
          className="border-navy-700 text-silver-200 hover:border-electric-500 rounded-lg border px-4 py-2 text-sm transition"
        >
          Search
        </button>
      </form>

      <GalleryFilters
        q={galleryParams.q}
        kind={galleryParams.kind}
        privacy={galleryParams.privacy}
        reviewStatus={galleryParams.reviewStatus}
        onlyFavorites={galleryParams.onlyFavorites}
        sort={galleryParams.sort}
        basePath="/media/library"
        searchParams={{ ...flatParams, source: 'workspace' }}
      />

      <p
        className="text-silver-500 mt-4 text-sm"
        data-testid="catalog-search-meta"
      >
        {loadError
          ? 'Workspace gallery unavailable'
          : `${total} asset${total === 1 ? '' : 's'}${galleryParams.q ? ` matching "${galleryParams.q}"` : ''} · query ${durationMs.toFixed(1)}ms`}
      </p>

      <div className="mt-4">
        <GalleryWorkspaceView
          assets={assets}
          viewMode={viewMode}
          thumbSize={thumbSize}
          workspaceId={galleryParams.workspaceId}
          errorMessage={loadError ?? undefined}
          emptyMessage="No workspace assets yet. Upload a real image to see it appear here with a private thumbnail."
        />
      </div>

      {!loadError && pageCount > 1 ? (
        <CatalogPagination
          page={page}
          pageCount={pageCount}
          total={total}
          basePath="/media/library"
          searchParams={{ ...flatParams, source: 'workspace' }}
        />
      ) : null}
    </MediaShell>
  );
}
