'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  archiveGalleryAssetsAction,
  submitForReviewAction,
} from '@/app/media/gallery-actions';

type Props = {
  readonly selectedIds: ReadonlySet<string>;
  readonly workspaceId?: string;
  readonly onClearSelection?: () => void;
};

export function BulkActionBar({
  selectedIds,
  workspaceId = 'bcs-default',
  onClearSelection,
}: Props) {
  const router = useRouter();
  const [pending, startAction] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (selectedIds.size === 0) return null;

  const ids = [...selectedIds];

  const handleArchive = () => {
    setMessage(null);
    setError(null);
    startAction(async () => {
      const result = await archiveGalleryAssetsAction({
        assetExternalIds: ids,
        workspaceId,
      });
      if (!result.ok) {
        setError(result.error ?? 'Archive failed');
        return;
      }
      setMessage(
        `Archived ${result.affected} asset${result.affected === 1 ? '' : 's'}`,
      );
      onClearSelection?.();
      router.refresh();
    });
  };

  const handleSubmitReview = () => {
    setMessage(null);
    setError(null);
    startAction(async () => {
      const result = await submitForReviewAction({
        assetExternalIds: ids,
        workspaceId,
      });
      if (!result.ok) {
        setError(result.error ?? 'Submit failed');
        return;
      }
      setMessage(
        `Submitted ${result.affected} asset${result.affected === 1 ? '' : 's'} for review`,
      );
      onClearSelection?.();
      router.refresh();
    });
  };

  return (
    <div
      className="border-electric-500/40 bg-navy-900/90 sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl"
      data-testid="bulk-action-bar"
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="text-silver-300 text-sm font-medium">
        {selectedIds.size} selected
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSubmitReview}
          disabled={pending}
          className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs text-blue-300 transition hover:bg-blue-600/30 disabled:opacity-50"
          data-testid="bulk-submit-review"
        >
          Submit for review
        </button>
        <button
          type="button"
          onClick={handleArchive}
          disabled={pending}
          className="rounded-lg bg-amber-600/20 px-3 py-1.5 text-xs text-amber-300 transition hover:bg-amber-600/30 disabled:opacity-50"
          data-testid="bulk-archive"
        >
          Archive
        </button>
        <button
          type="button"
          onClick={() => onClearSelection?.()}
          className="border-navy-700 text-silver-500 rounded-lg border px-3 py-1.5 text-xs transition hover:text-white"
          data-testid="bulk-clear"
        >
          Clear selection
        </button>
      </div>
      {message ? (
        <p className="text-xs text-green-400" data-testid="bulk-message">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" data-testid="bulk-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
