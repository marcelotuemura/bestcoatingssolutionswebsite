'use client';

import { useMemo, useState } from 'react';
import type { MediaAsset } from '@/lib/media-intelligence/schemas';

export function BeforeAfterCompare({
  before,
  after,
}: {
  readonly before?: MediaAsset;
  readonly after?: MediaAsset;
}) {
  const [mode, setMode] = useState<'slider' | 'side' | 'overlay'>('side');
  const [position, setPosition] = useState(50);

  const label = useMemo(() => {
    if (!before && !after) return 'No before/after pair detected yet.';
    if (before && after) return 'Interactive comparison (metadata preview).';
    return 'Partial pair — add matching before/after assets.';
  }, [before, after]);

  return (
    <div className="border-navy-700 bg-navy-900/40 space-y-4 rounded-2xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Before / After</h2>
        <div className="flex flex-wrap gap-2">
          {(['side', 'slider', 'overlay'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-lg border px-3 py-1 text-xs ${
                mode === item
                  ? 'border-electric-500 text-electric-400'
                  : 'border-navy-700 text-silver-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <p className="text-silver-500 text-sm">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border-navy-700 bg-navy-950 flex aspect-video items-center justify-center rounded-xl border border-dashed p-4 text-center">
          <div>
            <p className="text-silver-500 text-xs uppercase">Before</p>
            <p className="text-silver-300 mt-2 text-sm">
              {before?.originalFilename ?? '—'}
            </p>
          </div>
        </div>
        <div className="border-navy-700 bg-navy-950 flex aspect-video items-center justify-center rounded-xl border border-dashed p-4 text-center">
          <div>
            <p className="text-silver-500 text-xs uppercase">After</p>
            <p className="text-silver-300 mt-2 text-sm">
              {after?.originalFilename ?? '—'}
            </p>
          </div>
        </div>
      </div>
      {mode === 'slider' ? (
        <label className="text-silver-400 block text-sm">
          Slider position
          <input
            type="range"
            min={0}
            max={100}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>
      ) : null}
      {mode === 'overlay' ? (
        <p className="text-silver-500 text-xs">
          Overlay mode reserved for derivative image pairs after optimization
          pipeline attaches visual previews.
        </p>
      ) : null}
    </div>
  );
}
