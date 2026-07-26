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
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { searchCatalogWithAiEnrichment } from '@/lib/media-intelligence/vision/search-enrichment';
import {
  loadAiAnalysisIndex,
  loadCatalogDataSource,
  parseCatalogSearchParams,
  uniqueFacetValues,
} from '@/lib/media-library';

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMediaPageAccess();
  const raw = await searchParams;
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
    repairCategories: uniqueFacetValues(data.catalog.assets, 'repairCategory'),
    stages: uniqueFacetValues(data.catalog.assets, 'stage'),
  };

  const flatParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    flatParams[key] = Array.isArray(value) ? value[0] : value;
  }

  const viewMode = (raw.view as string) || 'grid';

  return (
    <MediaShell
      title="Media Gallery"
      subtitle="Visual DAMS Gallery — browse, filter, and search your assets."
    >
      {/* View mode selector */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-silver-400 text-xs">View:</span>
          {(['grid', 'compact', 'list'] as const).map((mode) => (
            <a
              key={mode}
              href={`?${new URLSearchParams({ ...flatParams, view: mode }).toString()}`}
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
        {result.matchedViaAi > 0
          ? ` · ${result.matchedViaAi} via AI overlay`
          : ''}
      </p>

      {viewMode === 'list' ? (
        <div
          className="border-navy-700 divide-navy-700 mt-4 divide-y overflow-hidden rounded-2xl border"
          data-testid="gallery-list-view"
        >
          {result.items.length === 0 ? (
            <p className="text-silver-400 py-8 text-center text-sm">
              No assets found.
            </p>
          ) : (
            result.items.map((asset) => (
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
                <span className="text-silver-500 ml-auto text-xs">
                  {asset.manufacturer ?? ''}
                </span>
              </a>
            ))
          )}
        </div>
      ) : (
        <CatalogGallery assets={result.items} />
      )}
      <CatalogPagination
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
        basePath="/media/library"
        searchParams={flatParams}
      />
    </MediaShell>
  );
}
