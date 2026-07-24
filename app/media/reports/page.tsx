import Link from 'next/link';
import {
  DistributionList,
  StatWidget,
} from '@/components/media-library/StatWidget';
import { CatalogMediaCard } from '@/components/media-library/CatalogMediaCard';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import {
  buildCatalogDashboardStats,
  loadCatalogDataSource,
  queryCatalogAssets,
} from '@/lib/media-library';

export default async function ReportsViewerPage() {
  await requireMediaPageAccess();
  const data = await loadCatalogDataSource();
  const stats = buildCatalogDashboardStats({
    assets: data.catalog.assets,
    projects: data.projects.projects,
    duplicateGroups: data.duplicates.groups,
    isFixture: data.isFixture,
    generatedAt: data.catalog.generatedAt,
    source: data.sourcePath,
  });

  const websiteCandidates = queryCatalogAssets(data.catalog.assets, {
    mediaKind: 'image',
    websiteScoreMin: 80,
    sort: 'website_desc',
    pageSize: 8,
  }).items;

  const marketingCandidates = queryCatalogAssets(data.catalog.assets, {
    mediaKind: 'image',
    marketingScoreMin: 80,
    sort: 'marketing_desc',
    pageSize: 8,
  }).items;

  const timeline = [...data.catalog.assets]
    .filter((a) => a.exifDate)
    .sort((a, b) => (a.exifDate ?? '').localeCompare(b.exifDate ?? ''))
    .slice(0, 20);

  return (
    <MediaShell
      title="Reports Viewer"
      subtitle="Visualize project, duplicate, website, marketing, timeline, repair, and manufacturer reports from the catalog."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget label="Projects" value={stats.totalProjects} />
        <StatWidget
          label="Duplicate groups"
          value={stats.exactDuplicateGroups + stats.nearDuplicateGroups}
        />
        <StatWidget label="Website ≥ 80" value={websiteCandidates.length} />
        <StatWidget
          label="Catalog generated"
          value={stats.generatedAt.slice(0, 10)}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="border-navy-700 bg-navy-900/40 media-light:border-slate-200 media-light:bg-white rounded-2xl border p-5">
          <h2 className="media-light:text-slate-900 text-lg font-semibold text-white">
            Project report
          </h2>
          <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
            {data.projects.projects.map((project) => (
              <li key={project.id} className="flex justify-between gap-3">
                <Link
                  href={`/media/catalog/projects/${project.id}`}
                  className="text-electric-400 truncate hover:underline"
                >
                  {project.name}
                </Link>
                <span className="text-silver-500 shrink-0">
                  {project.mediaCount}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-navy-700 bg-navy-900/40 media-light:border-slate-200 media-light:bg-white rounded-2xl border p-5">
          <h2 className="media-light:text-slate-900 text-lg font-semibold text-white">
            Duplicate report
          </h2>
          <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
            {data.duplicates.groups.map((group) => (
              <li key={group.id} className="flex justify-between gap-3">
                <Link
                  href={`/media/duplicates#${group.id}`}
                  className="text-electric-400 hover:underline"
                >
                  {group.kind} · {group.id}
                </Link>
                <span className="text-silver-500">
                  {Math.round(group.similarity * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <DistributionList
          title="Repair categories"
          buckets={stats.repairCategoryDistribution}
        />
        <DistributionList
          title="Manufacturers"
          buckets={stats.manufacturerDistribution}
        />
        <DistributionList
          title="Projects"
          buckets={stats.projectDistribution}
        />
      </div>

      <section className="mt-10">
        <h2 className="media-light:text-slate-900 mb-4 text-xl font-semibold text-white">
          Website candidates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {websiteCandidates.map((asset) => (
            <CatalogMediaCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="media-light:text-slate-900 mb-4 text-xl font-semibold text-white">
          Marketing candidates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketingCandidates.map((asset) => (
            <CatalogMediaCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="media-light:text-slate-900 mb-4 text-xl font-semibold text-white">
          Media timeline
        </h2>
        <ol className="border-navy-700 media-light:border-slate-200 space-y-3 border-l pl-4">
          {timeline.map((asset) => (
            <li key={asset.id} className="text-sm">
              <time className="text-silver-500">
                {asset.exifDate?.slice(0, 10)}
              </time>{' '}
              <Link
                href={`/media/catalog/${asset.id}`}
                className="text-electric-400 hover:underline"
              >
                {asset.filename}
              </Link>
              <span className="text-silver-500">
                {' '}
                · {asset.projectName} · {asset.stage}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </MediaShell>
  );
}
