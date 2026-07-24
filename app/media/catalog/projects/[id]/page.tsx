import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogMediaCard } from '@/components/media-library/CatalogMediaCard';
import { StatWidget } from '@/components/media-library/StatWidget';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import {
  buildProjectView,
  getCatalogAssets,
  getCatalogProjectById,
} from '@/lib/media-library';

function StageSection({
  title,
  assets,
}: {
  readonly title: string;
  readonly assets: readonly import('@/lib/media-library').CatalogAsset[];
}) {
  return (
    <section className="mt-8">
      <h2 className="media-light:text-slate-900 mb-3 text-lg font-semibold text-white">
        {title}{' '}
        <span className="text-silver-500 text-sm font-normal">
          ({assets.length})
        </span>
      </h2>
      {assets.length === 0 ? (
        <p className="text-silver-500 text-sm">None</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {assets.map((asset) => (
            <CatalogMediaCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function CatalogProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMediaPageAccess();
  const { id } = await params;
  const project = await getCatalogProjectById(id);
  if (!project) notFound();
  const assets = await getCatalogAssets();
  const view = buildProjectView(project, assets);

  return (
    <MediaShell
      title={project.name}
      subtitle="Project summary — timeline, before / during / after, best images, alerts. Read-only."
    >
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="project-summary"
      >
        <StatWidget label="Media count" value={project.mediaCount} />
        <StatWidget label="Videos" value={project.videoCount} />
        <StatWidget label="Before" value={project.beforeCount} />
        <StatWidget label="During" value={project.duringCount} />
        <StatWidget label="After" value={project.afterCount} />
        <StatWidget
          label="Duplicate alerts"
          value={project.duplicateAlertCount}
        />
        <StatWidget label="Privacy alerts" value={project.privacyAlertCount} />
        <StatWidget
          label="Avg website"
          value={project.averageWebsiteScore ?? '—'}
        />
      </div>

      <section className="border-navy-700 bg-navy-900/40 media-light:border-slate-200 media-light:bg-white mt-8 rounded-2xl border p-5">
        <h2 className="media-light:text-slate-900 text-lg font-semibold text-white">
          Project summary
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-silver-500 text-xs uppercase">Manufacturer</dt>
            <dd>{project.manufacturer ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-silver-500 text-xs uppercase">Boat</dt>
            <dd>{project.boatName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-silver-500 text-xs uppercase">Repair</dt>
            <dd>{project.repairCategory?.replace(/_/g, ' ') ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-silver-500 text-xs uppercase">Folder</dt>
            <dd className="break-all">{project.folder ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-silver-500 text-xs uppercase">Timeline</dt>
            <dd>
              {project.timelineStart?.slice(0, 10) ?? '—'} →{' '}
              {project.timelineEnd?.slice(0, 10) ?? '—'}
            </dd>
          </div>
        </dl>
        {project.notes ? (
          <p className="text-silver-300 media-light:text-slate-700 mt-4 text-sm">
            <strong>Notes:</strong> {project.notes}
          </p>
        ) : null}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div>
          <h2 className="media-light:text-slate-900 mb-3 font-semibold text-white">
            Top hero image
          </h2>
          {view.topHero ? (
            <CatalogMediaCard asset={view.topHero} />
          ) : (
            <p className="text-silver-500 text-sm">None</p>
          )}
        </div>
        <div>
          <h2 className="media-light:text-slate-900 mb-3 font-semibold text-white">
            Best website image
          </h2>
          {view.bestWebsite ? (
            <CatalogMediaCard asset={view.bestWebsite} />
          ) : (
            <p className="text-silver-500 text-sm">None</p>
          )}
        </div>
        <div>
          <h2 className="media-light:text-slate-900 mb-3 font-semibold text-white">
            Best social image
          </h2>
          {view.bestSocial ? (
            <CatalogMediaCard asset={view.bestSocial} />
          ) : (
            <p className="text-silver-500 text-sm">None</p>
          )}
        </div>
      </div>

      <StageSection title="Before" assets={view.before} />
      <StageSection title="During" assets={view.during} />
      <StageSection title="After" assets={view.after} />
      <StageSection title="Videos" assets={view.videos} />

      <section className="mt-8">
        <h2 className="media-light:text-slate-900 mb-3 text-lg font-semibold text-white">
          Duplicate alerts
        </h2>
        {view.duplicateAlerts.length === 0 ? (
          <p className="text-silver-500 text-sm">No duplicate alerts.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {view.duplicateAlerts.map((asset) => (
              <li key={asset.id}>
                <Link
                  href={`/media/catalog/${asset.id}`}
                  className="text-electric-400 hover:underline"
                >
                  {asset.filename}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="media-light:text-slate-900 mb-3 text-lg font-semibold text-white">
          Privacy alerts
        </h2>
        {view.privacyAlerts.length === 0 ? (
          <p className="text-silver-500 text-sm">No privacy alerts.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {view.privacyAlerts.map((asset) => (
              <li key={asset.id}>
                <Link
                  href={`/media/catalog/${asset.id}`}
                  className="text-electric-400 hover:underline"
                >
                  {asset.filename}
                </Link>{' '}
                <span className="text-silver-500">({asset.privacyStatus})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </MediaShell>
  );
}
