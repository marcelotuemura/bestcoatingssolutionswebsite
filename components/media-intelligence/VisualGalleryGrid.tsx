'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import type { GalleryAsset } from '@/lib/media-intelligence/gallery/types';

type ViewMode = 'grid' | 'compact' | 'list';
type ThumbSize = 'sm' | 'md' | 'lg';

type Props = {
  readonly assets: readonly GalleryAsset[];
  readonly viewMode?: ViewMode;
  readonly thumbSize?: ThumbSize;
  readonly selectedIds?: ReadonlySet<string>;
  readonly onSelect?: (externalId: string, selected: boolean) => void;
  readonly onFavorite?: (externalId: string, favorite: boolean) => void;
  readonly emptyMessage?: string;
  readonly loading?: boolean;
  readonly errorMessage?: string;
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
      className={`pointer-events-none absolute top-2 right-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-medium ${color}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function PrivacyBadge({ status }: { status: string }) {
  if (status === 'clear') return null;
  return (
    <span className="pointer-events-none absolute top-2 left-2 z-10 rounded bg-red-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
      {status}
    </span>
  );
}

function AssetBadges({ asset }: { asset: GalleryAsset }) {
  return (
    <>
      <PrivacyBadge status={asset.privacyStatus} />
      <ReviewBadge status={asset.reviewStatus} />
      {asset.isFavorite ? (
        <span
          className="pointer-events-none absolute right-2 bottom-2 z-10 text-sm text-amber-400"
          aria-label="Favorite"
        >
          ★
        </span>
      ) : null}
    </>
  );
}

function ThumbImage({
  asset,
  priority,
}: {
  asset: GalleryAsset;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const thumbSrc = `/media/vault/${encodeURIComponent(asset.externalId)}/thumbnail/400`;
  const posterSrc = `/media/vault/${encodeURIComponent(asset.externalId)}/poster`;

  if (failed) {
    return (
      <div className="bg-navy-900 absolute inset-0 flex items-center justify-center">
        <span className="text-silver-500 text-xs tracking-[0.18em] uppercase">
          {asset.mediaKind}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- private authenticated vault stream
    <img
      src={asset.mediaKind === 'video' ? posterSrc : thumbSrc}
      alt=""
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      data-testid="gallery-thumb"
      onError={() => setFailed(true)}
    />
  );
}

function GridCard({
  asset,
  compact,
  selected,
  onSelect,
  priority,
  tabIndex,
}: {
  asset: GalleryAsset;
  compact: boolean;
  selected?: boolean;
  onSelect?: (id: string, v: boolean) => void;
  priority?: boolean;
  tabIndex?: number;
}) {
  const size = compact ? 'aspect-square' : 'aspect-[4/3]';
  return (
    <article
      className={`border-navy-700 bg-navy-900/40 group focus-within:ring-electric-500 overflow-hidden rounded-xl border transition focus-within:ring-2 ${selected ? 'ring-electric-500 ring-2' : 'hover:border-electric-500/60'}`}
      data-testid={`gallery-asset-${asset.externalId}`}
      tabIndex={tabIndex}
    >
      <div className={`bg-navy-900 relative ${size}`}>
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(asset.externalId, !selected)}
            className={`focus-visible:ring-electric-500 absolute top-2 left-2 z-20 flex h-6 w-6 items-center justify-center rounded border transition focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none ${selected ? 'border-electric-500 bg-electric-500/30 opacity-100' : 'border-navy-600 bg-navy-950/80 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100'}`}
            aria-label={selected ? 'Deselect asset' : 'Select asset'}
            aria-pressed={selected}
          >
            {selected ? (
              <span className="text-electric-300 text-xs" aria-hidden>
                ✓
              </span>
            ) : null}
          </button>
        ) : null}
        <AssetBadges asset={asset} />
        <Link
          href={`/media/assets/${asset.externalId}`}
          className="focus-visible:ring-electric-500 absolute inset-0 z-0 focus-visible:ring-2 focus-visible:outline-none"
          aria-label={`Open ${asset.displayTitle ?? asset.originalFilename}`}
          data-testid="gallery-asset-open"
        >
          <ThumbImage asset={asset} priority={priority} />
        </Link>
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
    </article>
  );
}

function SkeletonGrid({ compact }: { compact: boolean }) {
  const count = compact ? 12 : 8;
  const gridClass = compact
    ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return (
    <div className={gridClass} data-testid="gallery-skeleton" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-navy-800 bg-navy-900/30 animate-pulse rounded-xl border"
        >
          <div
            className={`bg-navy-800 ${compact ? 'aspect-square' : 'aspect-[4/3]'}`}
          />
          <div className="space-y-2 p-3">
            <div className="bg-navy-800 h-3 w-3/4 rounded" />
            <div className="bg-navy-800 h-2 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VisualGalleryGrid({
  assets,
  viewMode = 'grid',
  thumbSize = 'md',
  selectedIds,
  onSelect,
  emptyMessage = 'No assets found. Upload media to populate the gallery.',
  loading = false,
  errorMessage,
}: Props) {
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)
      ) {
        return;
      }
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('[data-testid^="gallery-asset-"]'),
      );
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = items.findIndex((el) => el === active || el.contains(active));
      if (idx < 0) return;
      const cols =
        viewMode === 'list'
          ? 1
          : viewMode === 'compact'
            ? 6
            : thumbSize === 'lg'
              ? 3
              : thumbSize === 'sm'
                ? 5
                : 4;
      let next = idx;
      if (event.key === 'ArrowRight')
        next = Math.min(items.length - 1, idx + 1);
      if (event.key === 'ArrowLeft') next = Math.max(0, idx - 1);
      if (event.key === 'ArrowDown')
        next = Math.min(items.length - 1, idx + cols);
      if (event.key === 'ArrowUp') next = Math.max(0, idx - cols);
      if (next !== idx) {
        event.preventDefault();
        items[next]?.focus();
      }
    };
    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, [viewMode, thumbSize]);

  if (loading) {
    return <SkeletonGrid compact={viewMode === 'compact'} />;
  }

  if (errorMessage) {
    return (
      <p
        className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-8 text-center text-sm text-red-200"
        data-testid="gallery-error"
        role="alert"
      >
        {errorMessage}
      </p>
    );
  }

  if (assets.length === 0) {
    return (
      <div
        className="border-navy-700 bg-navy-900/30 rounded-2xl border px-4 py-16 text-center"
        data-testid="gallery-empty"
      >
        <p className="text-silver-300 text-sm">{emptyMessage}</p>
        <Link
          href="/media/upload"
          className="border-electric-500 text-electric-400 hover:bg-electric-500/10 mt-4 inline-block rounded-lg border px-4 py-2 text-sm transition"
        >
          Upload media
        </Link>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div
        ref={listRef}
        id={listId}
        className="border-navy-700 divide-navy-700 divide-y overflow-hidden rounded-2xl border"
        data-testid="gallery-list"
        role="list"
      >
        {assets.map((asset) => (
          <div
            key={asset.externalId}
            className="hover:bg-navy-900/60 focus-within:bg-navy-900/70 flex items-center gap-3 px-4 py-3 transition"
            role="listitem"
            data-testid={`gallery-asset-${asset.externalId}`}
            tabIndex={0}
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
                className={`focus-visible:ring-electric-500 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition focus-visible:ring-2 ${selectedIds?.has(asset.externalId) ? 'border-electric-500 bg-electric-500/20' : 'border-navy-600'}`}
                aria-label={
                  selectedIds?.has(asset.externalId) ? 'Deselect' : 'Select'
                }
                aria-pressed={selectedIds?.has(asset.externalId)}
              />
            ) : null}
            <div className="bg-navy-900 relative h-12 w-16 shrink-0 overflow-hidden rounded-md">
              <ThumbImage asset={asset} />
            </div>
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
                <span className="text-sm text-amber-400" aria-label="Favorite">
                  ★
                </span>
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
    : thumbSize === 'sm'
      ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : thumbSize === 'lg'
        ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div
      ref={listRef}
      id={listId}
      className={gridClass}
      data-testid="gallery-grid"
      role="list"
    >
      {assets.map((asset, index) => (
        <div key={asset.externalId} role="listitem">
          <GridCard
            asset={asset}
            compact={compact}
            selected={selectedIds?.has(asset.externalId)}
            onSelect={onSelect}
            priority={index < 8}
            tabIndex={0}
          />
        </div>
      ))}
    </div>
  );
}
