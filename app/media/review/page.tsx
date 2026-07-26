import Link from 'next/link';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { listGalleryAssets } from '@/lib/media-intelligence/gallery';
import { actorCanGalleryReview } from '@/lib/media-intelligence/gallery/permissions';
import type {
  GalleryAsset,
  GalleryReviewStatus,
} from '@/lib/media-intelligence/gallery/types';

export default async function MediaReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMediaPageAccess();
  const raw = await searchParams;
  const reviewStatus = (raw.status as string) || 'pending';
  const session = await resolveMediaTrustedActor();

  let assets: readonly GalleryAsset[] = [];
  let total = 0;
  let loadError: string | null = null;

  const validStatuses: GalleryReviewStatus[] = [
    'none',
    'pending',
    'in_review',
    'approved',
    'rejected',
  ];
  const resolvedStatus = validStatuses.includes(
    reviewStatus as GalleryReviewStatus,
  )
    ? (reviewStatus as GalleryReviewStatus)
    : 'pending';

  if (session.ok) {
    try {
      const result = await listGalleryAssets(session.actor, {
        reviewStatus: resolvedStatus,
        pageSize: 48,
      });
      if (result.ok) {
        assets = result.data.assets;
        total = result.data.total;
      } else {
        loadError = result.error;
      }
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : 'Failed to load review queue. Ensure the database is configured.';
    }
  }

  const canReview = session.ok && actorCanGalleryReview(session.actor);

  const statusTabs = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <MediaShell
      title="Review Queue"
      subtitle="Review gallery assets for quality, privacy, and publication readiness."
    >
      <div
        className="mb-4 flex flex-wrap gap-2"
        data-testid="review-status-tabs"
      >
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`?status=${tab.value}`}
            className={`rounded-lg border px-3 py-1.5 text-xs transition ${
              reviewStatus === tab.value
                ? 'border-electric-500 text-electric-400'
                : 'border-navy-700 text-silver-400 hover:border-electric-500 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {loadError ? (
        <div
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          role="status"
          data-testid="review-load-error"
        >
          {loadError}
        </div>
      ) : (
        <>
          <p
            className="text-silver-500 mb-4 text-sm"
            data-testid="review-count"
          >
            {total} asset{total === 1 ? '' : 's'} in &quot;{reviewStatus}&quot;
            status
          </p>

          {assets.length === 0 ? (
            <p
              className="text-silver-400 py-12 text-center text-sm"
              data-testid="review-empty"
            >
              No assets with status &quot;{reviewStatus}&quot;.
            </p>
          ) : (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              data-testid="review-assets-grid"
            >
              {assets.map((asset) => (
                <Link
                  key={asset.externalId}
                  href={`/media/assets/${asset.externalId}`}
                  className="border-navy-700 bg-navy-900/40 hover:border-electric-500 group overflow-hidden rounded-xl border transition"
                  data-testid={`review-asset-${asset.externalId}`}
                >
                  <div className="bg-navy-900 flex aspect-video items-center justify-center">
                    <span className="text-silver-600 text-xs uppercase">
                      {asset.mediaKind}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-white">
                        {asset.displayTitle ?? asset.originalFilename}
                      </p>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${
                          asset.reviewStatus === 'approved'
                            ? 'bg-green-500/20 text-green-300'
                            : asset.reviewStatus === 'rejected'
                              ? 'bg-red-500/20 text-red-300'
                              : asset.reviewStatus === 'in_review'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {asset.reviewStatus}
                      </span>
                    </div>
                    {canReview ? (
                      <p className="text-electric-400 mt-1 text-xs">
                        Click to review →
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </MediaShell>
  );
}
