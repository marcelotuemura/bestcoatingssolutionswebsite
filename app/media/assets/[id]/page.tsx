import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ApprovalActions } from '@/components/media-intelligence/ApprovalActions';
import {
  ScoreBadge,
  StatusBadge,
} from '@/components/media-intelligence/MediaBadges';
import { AssetPreviewPane } from '@/components/media-intelligence/AssetPreviewPane';
import { FavoriteToggle } from '@/components/media-intelligence/FavoriteToggle';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { ScoreChip } from '@/components/media-library/StatWidget';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import { generateSeoPackage } from '@/lib/media-intelligence/seo';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  getGalleryAsset,
  canPreparePublicationForAsset,
} from '@/lib/media-intelligence/gallery';
import { getCatalogAssetById } from '@/lib/media-library';

export default async function MediaAssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMediaPageAccess();
  const { id } = await params;

  const workflowAsset = getMediaIntelligenceRepository().getAsset(id);
  const catalogAsset = await getCatalogAssetById(id);

  const session = await resolveMediaTrustedActor();
  let galleryAsset = null;
  if (session.ok) {
    try {
      const result = await getGalleryAsset(session.actor, id);
      if (result.ok) galleryAsset = result.data;
    } catch {
      // Gallery DB may not be configured
    }
  }

  if (!workflowAsset && !catalogAsset && !galleryAsset) notFound();

  if (galleryAsset) {
    const canPublish = canPreparePublicationForAsset(galleryAsset);

    return (
      <MediaShell
        title={galleryAsset.displayTitle ?? galleryAsset.originalFilename}
        subtitle={`${galleryAsset.mediaKind.toUpperCase()} · ${Math.round(galleryAsset.fileSizeBytes / 1024)} KB · ${galleryAsset.fileType}`}
        readOnlyBanner={false}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link
            href="/media/library"
            className="text-silver-400 text-sm hover:text-white"
          >
            ← Gallery
          </Link>
          {session.ok ? (
            <FavoriteToggle
              assetExternalId={galleryAsset.externalId}
              workspaceId={galleryAsset.workspaceId}
              initialFavorite={galleryAsset.isFavorite ?? false}
            />
          ) : null}
          {canPublish ? (
            <Link
              href={`/media/publications?assetId=${galleryAsset.externalId}`}
              className="border-electric-500 text-electric-400 hover:bg-electric-500/10 rounded-lg border px-3 py-1.5 text-xs transition"
              data-testid="prepare-publication-btn"
            >
              Prepare Publication
            </Link>
          ) : (
            <span
              className="rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs text-amber-300"
              title="Privacy-blocked or archived assets cannot be published."
              data-testid="publication-blocked-badge"
            >
              {galleryAsset.privacyStatus !== 'clear'
                ? 'Privacy blocked'
                : 'Archived'}
            </span>
          )}
        </div>

        <AssetPreviewPane asset={galleryAsset} />
      </MediaShell>
    );
  }

  if (catalogAsset) {
    return (
      <MediaShell
        title={catalogAsset.filename}
        subtitle={`${catalogAsset.mediaKind.toUpperCase()} · ${catalogAsset.fileType} · private vault preview`}
        readOnlyBanner={false}
      >
        <div className="mb-4">
          <Link
            href="/media/library"
            className="text-silver-400 text-sm hover:text-white"
          >
            ← Gallery
          </Link>
        </div>
        <div
          className="border-navy-700 bg-navy-900/40 mb-6 overflow-hidden rounded-2xl border"
          data-testid="asset-preview-pane"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/media/vault/${encodeURIComponent(catalogAsset.id)}/preview`}
            alt={catalogAsset.filename}
            className="mx-auto max-h-[70vh] w-auto object-contain"
            data-testid="asset-preview"
          />
        </div>
        <section className="border-navy-700 bg-navy-900/40 space-y-4 rounded-2xl border p-5">
          <div className="flex flex-wrap gap-2">
            <ScoreChip label="Web" score={catalogAsset.scores.website} />
            <ScoreChip label="Mkt" score={catalogAsset.scores.marketing} />
            <ScoreChip label="Tech" score={catalogAsset.scores.technical} />
          </div>
          <dl className="text-silver-300 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-silver-500">Manufacturer</dt>
              <dd>{catalogAsset.manufacturer ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Boat</dt>
              <dd>{catalogAsset.boatName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Stage</dt>
              <dd>{catalogAsset.stage}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Privacy</dt>
              <dd>{catalogAsset.privacyStatus}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Checksum</dt>
              <dd className="font-mono text-xs">
                {(catalogAsset.checksum ?? catalogAsset.sha256 ?? '—').slice(
                  0,
                  16,
                )}
                …
              </dd>
            </div>
            <div>
              <dt className="text-silver-500">Dimensions</dt>
              <dd>
                {catalogAsset.width && catalogAsset.height
                  ? `${catalogAsset.width}×${catalogAsset.height}`
                  : '—'}
              </dd>
            </div>
          </dl>
          <Link
            href={`/media/publications?assetId=${catalogAsset.id}`}
            className="border-electric-500 text-electric-400 hover:bg-electric-500/10 inline-block rounded-lg border px-3 py-1.5 text-xs transition"
            data-testid="prepare-publication-btn"
          >
            Prepare Publication
          </Link>
        </section>
      </MediaShell>
    );
  }

  // Workflow asset fallback (Phase 1 intelligence seed)
  const asset = workflowAsset!;
  const seo = generateSeoPackage(asset);

  return (
    <MediaShell
      title={asset.originalFilename}
      subtitle={`Original vault key: ${asset.originalStorageKey}`}
      readOnlyBanner={false}
    >
      <div className="mb-4">
        <Link
          href="/media/library"
          className="text-silver-400 text-sm hover:text-white"
        >
          ← Gallery
        </Link>
      </div>
      <div
        className="border-navy-700 bg-navy-900/40 mb-6 overflow-hidden rounded-2xl border"
        data-testid="asset-preview-pane"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/media/vault/${encodeURIComponent(asset.id)}/preview`}
          alt={asset.originalFilename}
          className="mx-auto max-h-[70vh] w-auto object-contain"
          data-testid="asset-preview"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border-navy-700 bg-navy-900/40 space-y-4 rounded-2xl border p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={asset.status} />
            {asset.isDemoSeed ? (
              <span className="rounded-lg border border-amber-500/40 px-2 py-1 text-xs text-amber-100">
                DEMO SEED — not real BCS work
              </span>
            ) : null}
          </div>
          {asset.scores ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(asset.scores).map(([key, value]) => (
                <ScoreBadge key={key} label={key} score={value} />
              ))}
            </div>
          ) : null}
          <dl className="text-silver-300 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-silver-500">Boat</dt>
              <dd>
                {asset.manufacturer ?? '—'} {asset.model ?? ''} (
                {asset.boat?.category ?? 'unknown'})
              </dd>
            </div>
            <div>
              <dt className="text-silver-500">Image type</dt>
              <dd>{asset.imageType}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Damage</dt>
              <dd>{asset.damageTypes.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Repair</dt>
              <dd>{asset.repairTypes.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Privacy risks</dt>
              <dd>{asset.privacyRisks.join(', ') || 'None detected'}</dd>
            </div>
            <div>
              <dt className="text-silver-500">QC flags</dt>
              <dd>{asset.qcRejectReasons.join(', ') || 'None'}</dd>
            </div>
          </dl>
          <ApprovalActions assetId={asset.id} status={asset.status} />
        </section>

        <section className="border-navy-700 bg-navy-900/40 space-y-4 rounded-2xl border p-5">
          <h2 className="text-lg font-semibold text-white">SEO package</h2>
          <dl className="text-silver-300 space-y-3 text-sm">
            <div>
              <dt className="text-silver-500">Optimized filename</dt>
              <dd>{seo.optimizedFilename}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Alt text</dt>
              <dd>{seo.altText}</dd>
            </div>
            <div>
              <dt className="text-silver-500">Meta description</dt>
              <dd>{seo.metaDescription}</dd>
            </div>
          </dl>
          <h2 className="pt-4 text-lg font-semibold text-white">Audit log</h2>
          <ul className="text-silver-400 space-y-2 text-xs">
            {asset.audit.map((event) => (
              <li key={event.id}>
                {event.at} · {event.actor} · {event.action}
                {event.fromStatus ? ` · ${event.fromStatus}` : ''}
                {event.toStatus ? ` → ${event.toStatus}` : ''}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MediaShell>
  );
}
