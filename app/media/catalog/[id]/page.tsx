import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AiAnalysisPanel } from '@/components/media-library/AiAnalysisPanel';
import { CatalogMediaCard } from '@/components/media-library/CatalogMediaCard';
import { ScoreChip, StatWidget } from '@/components/media-library/StatWidget';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import {
  getAiAnalysisForAsset,
  getCatalogAssetById,
  getCatalogAssets,
  getDuplicateGroupById,
  loadCatalogDataSource,
} from '@/lib/media-library';

export default async function CatalogAssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMediaPageAccess();
  const { id } = await params;
  const asset = await getCatalogAssetById(id);
  if (!asset) notFound();

  const all = await getCatalogAssets();
  const related = all
    .filter(
      (a) =>
        a.id !== asset.id &&
        (a.projectId === asset.projectId ||
          (asset.manufacturer && a.manufacturer === asset.manufacturer)),
    )
    .slice(0, 8);

  const duplicateGroup = asset.duplicateGroupId
    ? await getDuplicateGroupById(asset.duplicateGroupId)
    : undefined;
  const nearGroup = asset.nearDuplicateGroupId
    ? await getDuplicateGroupById(asset.nearDuplicateGroupId)
    : undefined;

  const data = await loadCatalogDataSource();
  const aiAnalysis = await getAiAnalysisForAsset(asset.id);

  return (
    <MediaShell
      title={asset.filename}
      subtitle="Image details — large preview, metadata, EXIF, scores, recommendations. Read-only."
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div
            className="border-navy-700 bg-navy-900 media-light:border-slate-200 media-light:bg-slate-100 relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border"
            data-testid="asset-preview"
            role="img"
            aria-label={`${asset.mediaKind} preview for ${asset.filename}`}
          >
            {asset.derivatives?.preview ||
            asset.derivatives?.poster ||
            asset.previewPath ? (
              // eslint-disable-next-line @next/next/no-img-element -- private vault stream
              <img
                src={`/media/vault/${encodeURIComponent(asset.id)}/preview`}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="text-silver-300 media-light:text-slate-700 text-sm tracking-[0.2em] uppercase">
                  {asset.mediaKind} · {asset.stage}
                </p>
                <p className="text-silver-500 mt-2 text-xs">
                  {asset.resolution ?? 'Resolution unknown'} · private vault
                  preview when derivatives exist
                </p>
                <p className="text-silver-500 mt-4 max-w-sm text-xs">
                  Original binaries are never publicly exposed. Authenticated
                  vault access only
                  {data.isFixture ? ' (fixture catalog)' : ''}.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <ScoreChip label="Website" score={asset.scores.website} />
            <ScoreChip label="Marketing" score={asset.scores.marketing} />
            <ScoreChip label="Technical" score={asset.scores.technical} />
            {typeof asset.scores.seo === 'number' ? (
              <ScoreChip label="SEO" score={asset.scores.seo} />
            ) : null}
          </div>

          <section className="mt-8 space-y-3">
            <h2 className="media-light:text-slate-900 text-lg font-semibold text-white">
              Recommendations
            </h2>
            <p className="text-silver-300 media-light:text-slate-700 text-sm">
              <strong>Website:</strong>{' '}
              {asset.recommendations?.website ?? 'No recommendation.'}
            </p>
            <p className="text-silver-300 media-light:text-slate-700 text-sm">
              <strong>Marketing:</strong>{' '}
              {asset.recommendations?.marketing ?? 'No recommendation.'}
            </p>
            <p className="text-silver-300 media-light:text-slate-700 text-sm">
              <strong>SEO:</strong>{' '}
              {asset.recommendations?.seo ?? 'No recommendation.'}
            </p>
          </section>
        </section>

        <aside className="space-y-4">
          <dl className="border-navy-700 bg-navy-900/50 media-light:border-slate-200 media-light:bg-white space-y-3 rounded-2xl border p-4 text-sm">
            {(
              [
                ['Original filename', asset.originalFilename],
                ['Project', asset.projectName ?? '—'],
                ['Manufacturer', asset.manufacturer ?? '—'],
                ['Boat', asset.boatName ?? '—'],
                ['Boat type', asset.boatType?.replace(/_/g, ' ') ?? '—'],
                ['Repair', asset.repairCategory?.replace(/_/g, ' ') ?? '—'],
                ['Stage', asset.stage],
                ['Folder', asset.folder || '—'],
                ['Camera', asset.camera ?? '—'],
                ['EXIF date', asset.exifDate ?? 'Missing EXIF'],
                ['Privacy', asset.privacyStatus],
                ['Checksum', asset.checksum ?? '—'],
                ['File type', asset.fileType],
                ['Orientation', asset.orientation],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-silver-500 media-light:text-slate-500 text-xs uppercase">
                  {label}
                </dt>
                <dd className="text-silver-100 media-light:text-slate-900 mt-0.5 break-all">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {asset.projectId ? (
            <Link
              href={`/media/catalog/projects/${asset.projectId}`}
              className="text-electric-400 text-sm hover:underline"
            >
              Open project →
            </Link>
          ) : null}

          {duplicateGroup ? (
            <div className="border-navy-700 rounded-2xl border p-4 text-sm">
              <h3 className="media-light:text-slate-900 font-medium text-white">
                Duplicate group
              </h3>
              <p className="text-silver-500 mt-1">
                {duplicateGroup.id} · similarity{' '}
                {Math.round(duplicateGroup.similarity * 100)}%
              </p>
              <Link
                href={`/media/duplicates#${duplicateGroup.id}`}
                className="text-electric-400 mt-2 inline-block hover:underline"
              >
                Review in Duplicate Manager
              </Link>
            </div>
          ) : null}

          {nearGroup ? (
            <div className="border-navy-700 rounded-2xl border p-4 text-sm">
              <h3 className="media-light:text-slate-900 font-medium text-white">
                Near duplicate group
              </h3>
              <p className="text-silver-500 mt-1">
                {nearGroup.id} · similarity{' '}
                {Math.round(nearGroup.similarity * 100)}%
              </p>
              <Link
                href={`/media/duplicates#${nearGroup.id}`}
                className="text-electric-400 mt-2 inline-block hover:underline"
              >
                Review in Duplicate Manager
              </Link>
            </div>
          ) : null}

          {aiAnalysis ? (
            <AiAnalysisPanel analysis={aiAnalysis} />
          ) : (
            <p
              className="text-silver-500 text-xs"
              data-testid="ai-analysis-pending"
            >
              No AI vision overlay yet. Run <code>pnpm media:analyze</code> to
              enrich this asset without modifying the original.
            </p>
          )}
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="media-light:text-slate-900 mb-4 text-xl font-semibold text-white">
          Related images
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <CatalogMediaCard key={item.id} asset={item} />
          ))}
        </div>
        {related.length === 0 ? (
          <p className="text-silver-500 text-sm">No related assets.</p>
        ) : null}
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatWidget label="Website score" value={asset.scores.website} />
        <StatWidget label="Marketing score" value={asset.scores.marketing} />
        <StatWidget label="Technical score" value={asset.scores.technical} />
      </div>
    </MediaShell>
  );
}
