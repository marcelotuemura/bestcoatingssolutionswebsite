'use client';

import { useState, useTransition } from 'react';
import { setGalleryFavoriteAction } from '@/app/media/gallery-actions';

type Props = {
  readonly assetExternalId: string;
  readonly workspaceId?: string;
  readonly initialFavorite: boolean;
};

export function FavoriteToggle({
  assetExternalId,
  workspaceId = 'bcs-default',
  initialFavorite,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    setError(null);
    const next = !isFavorite;
    setIsFavorite(next); // optimistic
    startTransition(async () => {
      const result = await setGalleryFavoriteAction({
        assetExternalId,
        favorite: next,
        workspaceId,
      });
      if (!result.ok) {
        setIsFavorite(!next); // revert
        setError(result.error ?? 'Failed to update favorite');
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isFavorite}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition disabled:opacity-50 ${
          isFavorite
            ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            : 'border-navy-700 text-silver-400 hover:border-amber-500/60 hover:text-amber-300'
        }`}
        data-testid="favorite-toggle"
      >
        <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
        {isFavorite ? 'Favorited' : 'Favorite'}
      </button>
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
