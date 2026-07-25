import { Suspense } from 'react';
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

  return (
    <MediaShell
      title="Media Gallery"
      subtitle="Searchable card gallery — instant filtering across filename, boat, manufacturer, project, folder, repair, stage, camera, date, scores, and AI keywords."
    >
      <Suspense fallback={null}>
        <CatalogSearchBar />
        <CatalogFilters facets={facets} />
      </Suspense>
      <p
        className="text-silver-500 media-light:text-slate-500 mt-4 text-sm"
        data-testid="catalog-search-meta"
      >
        {result.total} asset{result.total === 1 ? '' : 's'}
        {options.q ? ` matching “${options.q}”` : ''} · query{' '}
        {result.durationMs.toFixed(1)}ms
        {result.matchedViaAi > 0
          ? ` · ${result.matchedViaAi} via AI overlay`
          : ''}
      </p>
      <CatalogGallery assets={result.items} />
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
