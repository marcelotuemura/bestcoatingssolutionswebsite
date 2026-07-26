'use client';

import Link from 'next/link';
import type { GalleryAsset } from '@/lib/media-intelligence/gallery/types';

type ViewMode = 'grid' | 'compact' | 'list';

type Props = {
  readonly assets: readonly GalleryAsset[];
  readonly viewMode?: ViewMode;
  readonly selectedIds?: ReadonlySet<string>;
  readonly onSelect?: (externalId: string, selected: boolean) => void;
  readonly onFavorite?: (externalId: string, favorite: boolean) => void;
  readonly emptyMessage?: string;
};

function ReviewBadge({ status }: { status: string }) {
  const color =
    status === 'approved'
      ? 'bg-green-500/20 text-green-300'
      : status === 'rejected'
        ? 'bg-red-500/20 text-red-300'
        : status === 'in_review'
          ? 'bg-blue-500/20 text-blue-300'
          : status === 'pending'
            ? 'bg-amber-500/20 text-amber-300'
            : '';
  if (!color) return null;
  return (
    <span
      className={`absolute top-2 right-2 rounded px-1.5 py-0.5 text-xs ${color}`}
    >
      {status}
    </span>
  );
}

function PrivacyBadge({ status }: { status: string }) {
  if (status === 'clear') return null;
  return (
    <span className="absolute top-2 left-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">
      {status}
    </span>
  );
}

function GridCard({
  asset,
  compact,
  selected,
  onSelect,
}: {
  asset: GalleryAsset;
  compact: boolean;
  selected?: boolean;
  onSelect?: (id: string, v: boolean) => void;
}) {
  const size = compact ? 'aspect-square' : 'aspect-video';
  return (
    <div
      className={`border-navy-700 bg-navy-900/40 hover:border-electric-500 group overflow-hidden rounded-xl border transition ${selected ? 'ring-electric-500 ring-2' : ''}`}
      data-testid={`gallery-asset-${asset.externalId}`}
    >
      <div className={`bg-navy-900 relative ${size}`}>
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(asset.externalId, !selected)}
            className={`absolute top-2 left-2 z-10 flex h-5 w-5 items-center justify-center rounded border transition ${selected ? 'border-electric-500 bg-electric-500/20' : 'border-navy-600 bg-navy-900/80 opacity-0 group-hover:opacity-100'}`}
            aria-label={selected ? 'Deselect' : 'Select'}
          >
            {selected ? (
              <span className="text-electric-400 text-xs">✓</span>
            ) : null}
          </button>
        ) : null}
        <PrivacyBadge status={asset.privacyStatus} />
        <ReviewBadge status={asset.reviewStatus} />
        <Link
          href={`/media/assets/${asset.externalId}`}
          className="absolute inset-0 flex items-center justify-center"
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className="text-silver-600 text-xs uppercase">
            {asset.mediaKind}
          </span>
        </Link>
        {asset.isFavorite ? (
          <span className="absolute right-2 bottom-2 text-sm text-amber-400">
            ★
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <Link
          href={`/media/assets/${asset.externalId}`}
          className="hover:text-electric-400 block truncate text-sm font-medium text-white transition"
        >
          {asset.displayTitle ?? asset.originalFilename}
        </Link>
        {!compact ? (
          <p className="text-silver-500 mt-1 text-xs">
            {asset.fileType.split('/')[1]?.toUpperCase()} ·{' '}
            {Math.round(asset.fileSizeBytes / 1024)} KB
            {asset.width && asset.height
              ? ` · ${asset.width}×${asset.height}`
              : ''}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function VisualGalleryGrid({
  assets,
  viewMode = 'grid',
  selectedIds,
  onSelect,
  emptyMessage = 'No assets found.',
}: Props) {
  if (assets.length === 0) {
    return (
      <p
        className="text-silver-400 py-12 text-center text-sm"
        data-testid="gallery-empty"
      >
        {emptyMessage}
      </p>
    );
  }

  if (viewMode === 'list') {
    return (
      <div
        className="border-navy-700 divide-navy-700 divide-y overflow-hidden rounded-2xl border"
        data-testid="gallery-list"
        role="list"
      >
        {assets.map((asset) => (
          <div
            key={asset.externalId}
            className="hover:bg-navy-900/60 flex items-center gap-3 px-4 py-3 transition"
            role="listitem"
            data-testid={`gallery-asset-${asset.externalId}`}
          >
            {onSelect ? (
              <button
                type="button"
                onClick={() =>
                  onSelect(
                    asset.externalId,
                    !(selectedIds?.has(asset.externalId) ?? false),
                  )
                }
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${selectedIds?.has(asset.externalId) ? 'border-electric-500 bg-electric-500/20' : 'border-navy-600'}`}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <Link
                href={`/media/assets/${asset.externalId}`}
                className="hover:text-electric-400 block truncate text-sm font-medium text-white"
              >
                {asset.displayTitle ?? asset.originalFilename}
              </Link>
              <p className="text-silver-500 mt-0.5 text-xs">
                {asset.fileType} · {Math.round(asset.fileSizeBytes / 1024)} KB
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {asset.isFavorite ? (
                <span className="text-sm text-amber-400">★</span>
              ) : null}
              {asset.reviewStatus !== 'none' ? (
                <span className="text-silver-500 text-xs">
                  {asset.reviewStatus}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const compact = viewMode === 'compact';
  const gridClass = compact
    ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={gridClass} data-testid="gallery-grid" role="list">
      {assets.map((asset) => (
        <div key={asset.externalId} role="listitem">
          <GridCard
            asset={asset}
            compact={compact}
            selected={selectedIds?.has(asset.externalId)}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
