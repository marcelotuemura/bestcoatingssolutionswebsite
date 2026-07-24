import Link from 'next/link';
import { CatalogMediaCard } from '@/components/media-library/CatalogMediaCard';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';

export function CatalogGallery({
  assets,
  emptyMessage = 'No media matched these filters.',
}: {
  readonly assets: readonly CatalogAsset[];
  readonly emptyMessage?: string;
}) {
  if (assets.length === 0) {
    return (
      <p
        className="text-silver-500 media-light:text-slate-500 mt-8 text-sm"
        data-testid="catalog-gallery-empty"
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="catalog-gallery"
      role="list"
    >
      {assets.map((asset, index) => (
        <div key={asset.id} role="listitem">
          <CatalogMediaCard asset={asset} priority={index < 8} />
        </div>
      ))}
    </div>
  );
}

export function CatalogPagination({
  page,
  pageCount,
  total,
  basePath,
  searchParams,
}: {
  readonly page: number;
  readonly pageCount: number;
  readonly total: number;
  readonly basePath: string;
  readonly searchParams: Record<string, string | undefined>;
}) {
  function hrefFor(nextPage: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== 'page') params.set(key, value);
    }
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-between gap-3"
      aria-label="Gallery pagination"
      data-testid="catalog-pagination"
    >
      <p className="text-silver-500 media-light:text-slate-500 text-sm">
        Page {page} of {pageCount} · {total} result{total === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`border-navy-700 media-light:border-slate-300 rounded-lg border px-3 py-1.5 text-sm ${
            page <= 1
              ? 'pointer-events-none opacity-40'
              : 'hover:border-electric-500 text-silver-300 media-light:text-slate-700'
          }`}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(Math.min(pageCount, page + 1))}
          aria-disabled={page >= pageCount}
          className={`border-navy-700 media-light:border-slate-300 rounded-lg border px-3 py-1.5 text-sm ${
            page >= pageCount
              ? 'pointer-events-none opacity-40'
              : 'hover:border-electric-500 text-silver-300 media-light:text-slate-700'
          }`}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
