import { notFound } from 'next/navigation';
import { ApprovalActions } from '@/components/media-intelligence/ApprovalActions';
import {
  ScoreBadge,
  StatusBadge,
} from '@/components/media-intelligence/MediaBadges';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import { generateSeoPackage } from '@/lib/media-intelligence/seo';

export default async function MediaAssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = getMediaIntelligenceRepository().getAsset(id);
  if (!asset) notFound();
  const seo = generateSeoPackage(asset);

  return (
    <MediaShell
      title={asset.originalFilename}
      subtitle={`Original vault key: ${asset.originalStorageKey}`}
    >
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
