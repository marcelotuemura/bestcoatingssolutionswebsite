import { Suspense } from 'react';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import {
  InventoryFilters,
  InventoryGrid,
} from '@/components/media-pipeline/InventoryBrowser';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { MEDIA_MANIFEST_PATH } from '@/lib/media-pipeline/constants';
import { readMediaManifest } from '@/lib/media-pipeline/inventory/scan';
import { loadReviewState } from '@/lib/media-pipeline/review/factory';
import {
  emptyReviewState,
  filterInventoryAssets,
  mergeManifestWithReview,
} from '@/lib/media-pipeline/review/state';

export default async function MediaInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();
  const raw = await searchParams;
  const one = (v: string | string[] | undefined) =>
    typeof v === 'string' ? v : undefined;

  const repoRoot = process.cwd();
  const manifest = await readMediaManifest(repoRoot, MEDIA_MANIFEST_PATH);

  if (!manifest) {
    return (
      <MediaShell
        title="Archive Inventory"
        subtitle="Phase 2A — local-first media intake and review"
      >
        <div
          className="border-border/60 rounded-lg border border-dashed p-8 text-sm"
          data-testid="inventory-missing-manifest"
        >
          <p className="font-medium">No media manifest found.</p>
          <p className="text-text-secondary mt-2">
            Upload originals into{' '}
            <code>data/pictures/&lt;project-slug&gt;/</code>, then run:
          </p>
          <pre className="bg-surface/40 mt-3 overflow-x-auto rounded-md p-3 text-xs">
            pnpm media:inventory
          </pre>
        </div>
      </MediaShell>
    );
  }

  let review = emptyReviewState();
  let reviewError: string | null = null;
  if (session.ok) {
    try {
      review = await loadReviewState(session.actor, repoRoot);
    } catch (err) {
      reviewError =
        err instanceof Error
          ? err.message
          : 'Failed to load review overlays from persistence';
    }
  }

  const assets = mergeManifestWithReview(manifest, review);
  const filtered = filterInventoryAssets(assets, {
    projectSlug: one(raw.project),
    division: one(raw.division),
    stage: one(raw.stage),
    status: one(raw.status),
    privacyStatus: one(raw.privacy),
    publishStatus: one(raw.publish),
    qualityStatus: one(raw.quality),
    q: one(raw.q),
  });

  return (
    <MediaShell
      title="Archive Inventory"
      subtitle="Phase 2A — review data/pictures without mutating originals"
    >
      {reviewError ? (
        <p
          className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm"
          data-testid="inventory-review-load-error"
        >
          Review persistence unavailable: {reviewError}
        </p>
      ) : null}
      <div
        className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="inventory-stats"
      >
        <Stat label="Assets" value={String(manifest.assetCount)} />
        <Stat label="Projects" value={String(manifest.projectCount)} />
        <Stat
          label="Low-res flags"
          value={String(manifest.lowResolutionCount)}
        />
        <Stat label="GPS EXIF flags" value={String(manifest.gpsExifCount)} />
      </div>

      <Suspense fallback={<p className="text-sm">Loading filters…</p>}>
        <InventoryFilters projects={manifest.projects} />
      </Suspense>

      <p className="text-text-muted mt-4 mb-4 text-xs">
        Showing {filtered.length} of {assets.length} · Manifest{' '}
        {manifest.generatedAt} · Reviews persist in Supabase/Postgres (not JSON
        in production) · Before/after pairs are never inferred from filenames.
      </p>

      <InventoryGrid assets={filtered} />
    </MediaShell>
  );
}

function Stat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="border-border/60 bg-surface/20 rounded-lg border p-3">
      <p className="text-text-muted text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
