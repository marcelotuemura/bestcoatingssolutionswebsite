import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { listGalleryActivity } from '@/lib/media-intelligence/gallery';
import type { GalleryEvent } from '@/lib/media-intelligence/gallery/types';

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function MediaActivityPage() {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();

  let events: GalleryEvent[] = [];
  let loadError: string | null = null;

  if (session.ok) {
    try {
      const result = await listGalleryActivity(
        session.actor,
        'bcs-default',
        100,
      );
      if (result.ok) {
        events = [...result.data];
      } else {
        loadError = result.error;
      }
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : 'Failed to load activity. Ensure the database is configured.';
    }
  }

  return (
    <MediaShell
      title="Activity"
      subtitle="Recent gallery actions — uploads, edits, favorites, collections, and reviews."
    >
      {loadError ? (
        <div
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          role="status"
          data-testid="activity-load-error"
        >
          {loadError}
        </div>
      ) : events.length === 0 ? (
        <p
          className="text-silver-400 py-12 text-center text-sm"
          data-testid="activity-empty"
        >
          No activity recorded yet.
        </p>
      ) : (
        <div
          className="border-navy-700 divide-navy-700 divide-y overflow-hidden rounded-2xl border"
          data-testid="activity-list"
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="hover:bg-navy-900/60 flex items-start gap-4 px-4 py-3 transition"
              data-testid={`activity-event-${event.id}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white">
                  {formatAction(event.action)}
                </p>
                {event.assetExternalId ? (
                  <p className="text-silver-500 mt-0.5 truncate text-xs">
                    Asset:{' '}
                    <a
                      href={`/media/assets/${event.assetExternalId}`}
                      className="text-electric-400 hover:underline"
                    >
                      {event.assetExternalId}
                    </a>
                  </p>
                ) : null}
                {event.collectionId ? (
                  <p className="text-silver-500 mt-0.5 text-xs">
                    Collection: {event.collectionId}
                  </p>
                ) : null}
                {Object.keys(event.metadata).length > 0 ? (
                  <p className="text-silver-600 mt-0.5 truncate text-xs">
                    {JSON.stringify(event.metadata).slice(0, 100)}
                  </p>
                ) : null}
              </div>
              <time
                className="text-silver-600 mt-0.5 shrink-0 text-xs"
                dateTime={event.createdAt}
              >
                {new Date(event.createdAt).toLocaleString()}
              </time>
            </div>
          ))}
        </div>
      )}
    </MediaShell>
  );
}
