'use client';

import { useMemo, useState } from 'react';
import type { GalleryAsset } from '@/lib/media-intelligence/gallery/types';
import { VisualGalleryGrid } from '@/components/media-intelligence/VisualGalleryGrid';
import { BulkActionBar } from '@/components/media-intelligence/BulkActionBar';

type Props = {
  readonly assets: readonly GalleryAsset[];
  readonly viewMode: 'grid' | 'compact' | 'list';
  readonly thumbSize?: 'sm' | 'md' | 'lg';
  readonly workspaceId?: string;
  readonly emptyMessage?: string;
  readonly errorMessage?: string;
};

export function GalleryWorkspaceView({
  assets,
  viewMode,
  thumbSize = 'md',
  workspaceId = 'bcs-default',
  emptyMessage,
  errorMessage,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedIds = useMemo(() => selected, [selected]);

  return (
    <div className="space-y-4">
      <VisualGalleryGrid
        assets={assets}
        viewMode={viewMode}
        thumbSize={thumbSize}
        selectedIds={selectedIds}
        onSelect={(id, value) => {
          setSelected((prev) => {
            const next = new Set(prev);
            if (value) next.add(id);
            else next.delete(id);
            return next;
          });
        }}
        emptyMessage={emptyMessage}
        errorMessage={errorMessage}
      />
      <BulkActionBar
        selectedIds={selectedIds}
        workspaceId={workspaceId}
        onClearSelection={() => setSelected(new Set())}
      />
    </div>
  );
}
