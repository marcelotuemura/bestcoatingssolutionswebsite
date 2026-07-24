'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import { ScoreChip } from '@/components/media-library/StatWidget';

/**
 * Read-only preview modal with keyboard support and zoom.
 * Never loads original binaries — uses staged placeholder plane.
 */
export function CatalogPreviewModal({
  asset,
  open,
  onClose,
}: {
  readonly asset: CatalogAsset | null;
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === '+' || event.key === '=') {
        setZoom((z) => Math.min(3, z + 0.25));
      }
      if (event.key === '-') {
        setZoom((z) => Math.max(1, z - 0.25));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="catalog-preview-modal"
      onClick={onClose}
    >
      <div
        className="border-navy-700 bg-navy-950 media-light:border-slate-200 media-light:bg-white max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-navy-700 media-light:border-slate-200 flex items-start justify-between gap-3 border-b p-4">
          <div>
            <h2
              id={titleId}
              className="media-light:text-slate-900 text-lg font-semibold text-white"
            >
              {asset.filename}
            </h2>
            <p className="text-silver-500 media-light:text-slate-500 mt-1 text-sm">
              Read-only preview · originals never modified
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="border-navy-700 hover:border-electric-500 focus-visible:ring-electric-500 rounded-lg border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
            data-testid="catalog-preview-close"
          >
            Close
          </button>
        </div>
        <div className="overflow-auto p-4">
          <div
            className="bg-navy-900 media-light:bg-slate-100 mx-auto flex aspect-video max-w-3xl items-center justify-center rounded-xl transition-transform"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center top',
            }}
            aria-label={`${asset.mediaKind} preview placeholder`}
          >
            <p className="text-silver-500 text-sm">
              {asset.resolution ?? 'Resolution unknown'} · {asset.stage} ·{' '}
              {asset.mediaKind}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="border-navy-700 rounded-lg border px-3 py-1 text-xs"
              onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              aria-label="Zoom out"
            >
              Zoom −
            </button>
            <span className="text-silver-500 text-xs tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="border-navy-700 rounded-lg border px-3 py-1 text-xs"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              aria-label="Zoom in"
            >
              Zoom +
            </button>
            <ScoreChip label="Web" score={asset.scores.website} />
            <ScoreChip label="Mkt" score={asset.scores.marketing} />
            <ScoreChip label="Tech" score={asset.scores.technical} />
          </div>
        </div>
      </div>
    </div>
  );
}
