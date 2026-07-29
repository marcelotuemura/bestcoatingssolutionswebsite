import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { AssetReviewForm } from '@/components/media-pipeline/AssetReviewForm';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import {
  MEDIA_MANIFEST_PATH,
  MEDIA_REVIEW_STATE_PATH,
} from '@/lib/media-pipeline/constants';
import { readMediaManifest } from '@/lib/media-pipeline/inventory/scan';
import {
  mergeManifestWithReview,
  readReviewState,
} from '@/lib/media-pipeline/review/state';

export default async function MediaInventoryAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMediaPageAccess();
  const { id } = await params;
  const repoRoot = process.cwd();
  const manifest = await readMediaManifest(repoRoot, MEDIA_MANIFEST_PATH);
  if (!manifest) notFound();
  const review = await readReviewState(repoRoot, MEDIA_REVIEW_STATE_PATH);
  const assets = mergeManifestWithReview(manifest, review);
  const asset = assets.find((a) => a.id === id);
  if (!asset) notFound();

  return (
    <MediaShell
      title={asset.originalFilename}
      subtitle={`${asset.projectSlug} · ${asset.archivePath}`}
    >
      <p className="mb-4">
        <Link
          href="/media/inventory"
          className="text-sm underline underline-offset-2"
        >
          ← Back to inventory
        </Link>
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <section
          className="border-border/60 bg-surface/20 space-y-3 rounded-lg border p-4"
          data-testid="asset-preview-meta"
        >
          <h2 className="text-sm font-semibold">Archive metadata</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="text-text-muted">ID</dt>
            <dd className="font-mono text-xs break-all">{asset.id}</dd>
            <dt className="text-text-muted">Dimensions</dt>
            <dd>
              {asset.width && asset.height
                ? `${asset.width}×${asset.height}`
                : '—'}
            </dd>
            <dt className="text-text-muted">Size</dt>
            <dd>
              {asset.fileSizeBytes != null
                ? `${(asset.fileSizeBytes / 1024).toFixed(0)} KB`
                : '—'}
            </dd>
            <dt className="text-text-muted">Checksum</dt>
            <dd className="font-mono text-xs break-all">{asset.checksum}</dd>
            <dt className="text-text-muted">MIME</dt>
            <dd>{asset.mimeType ?? '—'}</dd>
            <dt className="text-text-muted">Captured</dt>
            <dd>{asset.capturedAt ?? '—'}</dd>
            <dt className="text-text-muted">Orientation</dt>
            <dd>{asset.orientation}</dd>
            <dt className="text-text-muted">Source album</dt>
            <dd>{asset.sourceAlbum}</dd>
            <dt className="text-text-muted">Published path</dt>
            <dd>{asset.publishedPath ?? '— (publish deferred)'}</dd>
          </dl>
          <ul className="text-text-secondary mt-4 list-disc space-y-1 pl-5 text-xs">
            {asset.flags.lowResolution ? <li>Low-resolution flag</li> : null}
            {asset.flags.exactDuplicate ? (
              <li>
                Exact duplicate of{' '}
                {asset.flags.duplicateOfIds.join(', ') || 'other asset(s)'}
              </li>
            ) : null}
            {asset.flags.hasGpsExif ? (
              <li>GPS EXIF detected — strip before any future publish</li>
            ) : null}
            {asset.flags.unsupportedFormat ? (
              <li>Unsupported or unreadable format</li>
            ) : null}
          </ul>
          <p className="text-text-muted text-xs">
            Originals are immutable. Previews are not generated in Phase 2A
            (deferred derivatives). Binary still lives only under{' '}
            <code>data/pictures/</code>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Review</h2>
          <AssetReviewForm asset={asset} />
        </section>
      </div>
    </MediaShell>
  );
}
