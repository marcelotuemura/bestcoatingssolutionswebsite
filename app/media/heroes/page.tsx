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
import {
  loadCatalogDataSource,
  parseCatalogSearchParams,
  queryCatalogAssets,
  uniqueFacetValues,
} from '@/lib/media-library';

export default async function HeroImageCenterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMediaPageAccess();
  const raw = await searchParams;
  const options = parseCatalogSearchParams(raw);
  const data = await loadCatalogDataSource();

  const result = queryCatalogAssets(data.catalog.assets, {
    ...options,
    mediaKind: options.mediaKind ?? 'image',
    sort: options.sort ?? 'hero_rank',
    pageSize: options.pageSize ?? 48,
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
      title="Hero Image Center"
      subtitle="Sorted by website score, marketing score, landscape orientation, image quality, and clear privacy. Filtering supported."
    >
      <Suspense fallback={null}>
        <CatalogSearchBar actionPath="/media/heroes" />
        <CatalogFilters facets={facets} actionPath="/media/heroes" />
      </Suspense>
      <p
        className="text-silver-500 media-light:text-slate-500 mt-4 text-sm"
        data-testid="hero-search-meta"
      >
        {result.total} hero candidate{result.total === 1 ? '' : 's'} · ranked ·
        query {result.durationMs.toFixed(1)}ms
      </p>
      <CatalogGallery
        assets={result.items}
        emptyMessage="No hero candidates matched. Try relaxing privacy or landscape filters."
      />
      <CatalogPagination
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
        basePath="/media/heroes"
        searchParams={flatParams}
      />
    </MediaShell>
  );
}
