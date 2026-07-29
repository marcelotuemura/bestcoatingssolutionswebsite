'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { MediaAssetRecord } from '@/lib/media-pipeline/types';

function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function badgeClass(kind: 'ok' | 'warn' | 'bad' | 'neutral'): string {
  switch (kind) {
    case 'ok':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    case 'warn':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-200';
    case 'bad':
      return 'bg-red-500/15 text-red-700 dark:text-red-300';
    default:
      return 'bg-black/5 text-text-secondary dark:bg-white/10';
  }
}

function privacyKind(
  status: MediaAssetRecord['privacyStatus'],
): 'ok' | 'warn' | 'bad' | 'neutral' {
  if (status === 'clear') return 'ok';
  if (status === 'blocked') return 'bad';
  if (status === 'review-required') return 'warn';
  return 'neutral';
}

export function InventoryFilters({
  projects,
}: {
  readonly projects: readonly {
    readonly slug: string;
    readonly assetCount: number;
  }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`/media/inventory?${next.toString()}`);
  }

  const selectClass =
    'border-border/70 bg-surface/40 rounded-md border px-2 py-1.5 text-sm';

  return (
    <form
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      data-testid="inventory-filters"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Project</span>
        <select
          className={selectClass}
          value={params.get('project') ?? ''}
          onChange={(e) => update('project', e.target.value)}
          data-testid="filter-project"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.slug} ({p.assetCount})
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Division</span>
        <select
          className={selectClass}
          value={params.get('division') ?? ''}
          onChange={(e) => update('division', e.target.value)}
          data-testid="filter-division"
        >
          <option value="">All</option>
          <option value="marine">marine</option>
          <option value="aviation">aviation</option>
          <option value="commercial">commercial</option>
          <option value="unknown">unknown</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Stage</span>
        <select
          className={selectClass}
          value={params.get('stage') ?? ''}
          onChange={(e) => update('stage', e.target.value)}
          data-testid="filter-stage"
        >
          <option value="">All</option>
          {[
            'before',
            'damage',
            'preparation',
            'fairing',
            'fiberglass',
            'masking',
            'ceramic-coating',
            'completed',
            'unknown',
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Status</span>
        <select
          className={selectClass}
          value={params.get('status') ?? ''}
          onChange={(e) => update('status', e.target.value)}
          data-testid="filter-status"
        >
          <option value="">All</option>
          {[
            'imported',
            'needs-review',
            'approved',
            'rejected',
            'published',
            'archived',
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Privacy</span>
        <select
          className={selectClass}
          value={params.get('privacy') ?? ''}
          onChange={(e) => update('privacy', e.target.value)}
          data-testid="filter-privacy"
        >
          <option value="">All</option>
          <option value="unchecked">unchecked</option>
          <option value="clear">clear</option>
          <option value="review-required">review-required</option>
          <option value="blocked">blocked</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Publish</span>
        <select
          className={selectClass}
          value={params.get('publish') ?? ''}
          onChange={(e) => update('publish', e.target.value)}
          data-testid="filter-publish"
        >
          <option value="">All</option>
          <option value="not-published">not-published</option>
          <option value="candidate">candidate</option>
          <option value="published">published</option>
        </select>
      </label>
    </form>
  );
}

export function InventoryGrid({
  assets,
}: {
  readonly assets: readonly MediaAssetRecord[];
}) {
  if (assets.length === 0) {
    return (
      <p
        className="text-text-secondary border-border/60 rounded-lg border border-dashed p-8 text-center text-sm"
        data-testid="inventory-empty"
      >
        No assets match these filters. Run <code>pnpm media:inventory</code> if
        the manifest is empty.
      </p>
    );
  }

  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="inventory-grid"
    >
      {assets.map((asset) => (
        <li key={asset.id}>
          <Link
            href={`/media/inventory/${asset.id}`}
            className="border-border/60 bg-surface/30 hover:bg-surface/50 focus-visible:ring-focus-ring block overflow-hidden rounded-lg border transition focus-visible:ring-2 focus-visible:outline-none"
            data-testid={`inventory-card-${asset.id}`}
          >
            <div className="relative flex aspect-[4/3] items-center justify-center bg-black/5 dark:bg-white/5">
              <div className="text-text-muted p-4 text-center text-xs">
                <div className="font-medium">
                  {asset.width && asset.height
                    ? `${asset.width}×${asset.height}`
                    : 'No dimensions'}
                </div>
                <div className="mt-1">{formatBytes(asset.fileSizeBytes)}</div>
              </div>
              {(asset.flags.lowResolution ||
                asset.flags.exactDuplicate ||
                asset.flags.hasGpsExif) && (
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {asset.flags.lowResolution ? (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${badgeClass('warn')}`}
                    >
                      low-res
                    </span>
                  ) : null}
                  {asset.flags.exactDuplicate ? (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${badgeClass('warn')}`}
                    >
                      duplicate
                    </span>
                  ) : null}
                  {asset.flags.hasGpsExif ? (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${badgeClass('warn')}`}
                    >
                      GPS
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <div className="space-y-2 p-3">
              <p
                className="truncate text-sm font-medium"
                title={asset.originalFilename}
              >
                {asset.originalFilename}
              </p>
              <p
                className="text-text-muted truncate text-xs"
                title={asset.archivePath}
              >
                {asset.archivePath}
              </p>
              <p className="text-text-muted text-xs">
                {asset.projectSlug} · {asset.sourceAlbum}
              </p>
              <div className="flex flex-wrap gap-1">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${badgeClass(privacyKind(asset.privacyStatus))}`}
                >
                  privacy: {asset.privacyStatus}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${badgeClass('neutral')}`}
                >
                  {asset.status}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${badgeClass('neutral')}`}
                >
                  {asset.publishStatus}
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
