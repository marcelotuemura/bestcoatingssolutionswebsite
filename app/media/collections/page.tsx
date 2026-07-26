import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { CollectionList } from '@/components/media-intelligence/CollectionList';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { listGalleryCollections } from '@/lib/media-intelligence/gallery';
import type { GalleryCollection } from '@/lib/media-intelligence/gallery/types';

export default async function MediaCollectionsPage() {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();

  let collections: GalleryCollection[] = [];
  let loadError: string | null = null;

  if (session.ok) {
    try {
      const result = await listGalleryCollections(session.actor);
      if (result.ok) {
        collections = [...result.data];
      } else {
        loadError = result.error;
      }
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : 'Failed to load collections. Ensure the database is configured.';
    }
  }

  return (
    <MediaShell
      title="Collections"
      subtitle="Curate and organize your gallery assets into named collections."
    >
      {loadError ? (
        <div
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          role="status"
          data-testid="collections-load-error"
        >
          {loadError}
        </div>
      ) : (
        <CollectionList collections={collections} />
      )}
    </MediaShell>
  );
}
