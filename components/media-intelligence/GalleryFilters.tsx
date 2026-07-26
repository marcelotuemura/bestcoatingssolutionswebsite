import Link from 'next/link';

type Props = {
  readonly workspaceId?: string;
  readonly q?: string;
  readonly kind?: string;
  readonly privacy?: string;
  readonly reviewStatus?: string;
  readonly onlyFavorites?: boolean;
  readonly sort?: string;
  readonly basePath?: string;
  readonly searchParams?: Record<string, string | undefined>;
};

function chip(
  label: string,
  paramKey: string,
  value: string,
  current: string | undefined,
  basePath: string,
  searchParams: Record<string, string | undefined>,
) {
  const active = current === value;
  const nextParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined) nextParams[k] = v;
  }
  if (active) {
    delete nextParams[paramKey];
  } else {
    nextParams[paramKey] = value;
  }
  const qs = new URLSearchParams(nextParams).toString();
  return (
    <Link
      key={value}
      href={`${basePath}?${qs}`}
      className={`rounded-lg border px-3 py-1.5 text-xs transition ${
        active
          ? 'border-electric-500 text-electric-400'
          : 'border-navy-700 text-silver-400 hover:border-electric-500 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}

export function GalleryFilters({
  kind,
  privacy,
  reviewStatus,
  onlyFavorites,
  sort = 'created_desc',
  basePath = '/media/library',
  searchParams = {},
}: Props) {
  const allParams = { ...searchParams };

  return (
    <div
      className="mt-3 flex flex-wrap gap-x-2 gap-y-2"
      data-testid="gallery-filters"
      aria-label="Gallery filters"
    >
      {/* Kind */}
      <div className="flex flex-wrap gap-1">
        {chip('Images', 'kind', 'image', kind, basePath, allParams)}
        {chip('Videos', 'kind', 'video', kind, basePath, allParams)}
      </div>

      {/* Privacy */}
      <div className="flex flex-wrap gap-1">
        {chip('Clear', 'privacy', 'clear', privacy, basePath, allParams)}
        {chip('Flagged', 'privacy', 'flagged', privacy, basePath, allParams)}
        {chip('Blocked', 'privacy', 'blocked', privacy, basePath, allParams)}
      </div>

      {/* Review status */}
      <div className="flex flex-wrap gap-1">
        {chip(
          'Pending review',
          'reviewStatus',
          'pending',
          reviewStatus,
          basePath,
          allParams,
        )}
        {chip(
          'In review',
          'reviewStatus',
          'in_review',
          reviewStatus,
          basePath,
          allParams,
        )}
        {chip(
          'Approved',
          'reviewStatus',
          'approved',
          reviewStatus,
          basePath,
          allParams,
        )}
      </div>

      {/* Favorites */}
      {chip(
        '★ Favorites',
        'favorites',
        '1',
        onlyFavorites ? '1' : undefined,
        basePath,
        allParams,
      )}

      {/* Sort */}
      <div className="flex flex-wrap gap-1">
        {chip(
          'Newest first',
          'sort',
          'created_desc',
          sort,
          basePath,
          allParams,
        )}
        {chip('Oldest first', 'sort', 'created_asc', sort, basePath, allParams)}
        {chip('A–Z', 'sort', 'title_asc', sort, basePath, allParams)}
        {chip('Largest', 'sort', 'size_desc', sort, basePath, allParams)}
      </div>
    </div>
  );
}
