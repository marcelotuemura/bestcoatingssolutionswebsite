import Link from 'next/link';
import { CatalogMediaCard } from '@/components/media-library/CatalogMediaCard';
import {
  DistributionList,
  StatWidget,
} from '@/components/media-library/StatWidget';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import {
  buildCatalogDashboardStats,
  loadCatalogDataSource,
} from '@/lib/media-library';

export default async function MediaDashboardPage() {
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

  return (
    <MediaShell
      title="Media Intelligence Platform"
      subtitle="Visual DAMS Gallery — upload, organize, review, and prepare media assets for publication."
    >
      {/* Phase 7 Gallery CTAs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/media/library"
          className="border-navy-700 bg-navy-900/70 hover:border-electric-500 group hover:bg-navy-900/90 flex flex-col gap-2 rounded-2xl border p-6 transition"
          data-testid="gallery-cta"
        >
          <span className="text-electric-400 text-xs font-medium tracking-widest uppercase">
            Phase 7 — Visual Gallery
          </span>
          <h2 className="text-xl font-semibold text-white">Open Gallery</h2>
          <p className="text-silver-400 text-sm">
            Browse, filter, and search your DAMS assets with grid, compact, and
            list view modes.
          </p>
          <span className="text-electric-400 mt-auto text-sm group-hover:underline">
            Open gallery →
          </span>
        </Link>
        <Link
          href="/media/upload"
          className="border-navy-700 bg-navy-900/70 hover:border-electric-500 group hover:bg-navy-900/90 flex flex-col gap-2 rounded-2xl border p-6 transition"
          data-testid="upload-cta"
        >
          <span className="text-electric-400 text-xs font-medium tracking-widest uppercase">
            Upload
          </span>
          <h2 className="text-xl font-semibold text-white">Upload Assets</h2>
          <p className="text-silver-400 text-sm">
            Drag and drop images or videos. SHA-256 verified, thumbnails
            generated automatically.
          </p>
          <span className="text-electric-400 mt-auto text-sm group-hover:underline">
            Upload →
          </span>
        </Link>
      </div>
      {stats.isFixture ? (
        <p
          className="media-light:border-amber-300 media-light:bg-amber-50 media-light:text-amber-900 mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          role="status"
          data-testid="catalog-fixture-banner"
        >
          Showing fixture catalog. Sync real{' '}
          <code className="font-mono text-xs">08_Reports</code> into{' '}
          <code className="font-mono text-xs">data/media-catalog</code> or set{' '}
          <code className="font-mono text-xs">MEDIA_CATALOG_DIR</code>.
        </p>
      ) : null}

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="media-dashboard-stats"
      >
        <StatWidget label="Total Images" value={stats.totalImages} />
        <StatWidget label="Total Videos" value={stats.totalVideos} />
        <StatWidget label="Total Projects" value={stats.totalProjects} />
        <StatWidget
          label="Exact Duplicate Groups"
          value={stats.exactDuplicateGroups}
        />
        <StatWidget
          label="Near Duplicate Groups"
          value={stats.nearDuplicateGroups}
        />
        <StatWidget
          label="Hero Image Candidates"
          value={stats.heroImageCandidates}
        />
        <StatWidget
          label="Avg Marketing Score"
          value={stats.averageMarketingScore}
        />
        <StatWidget
          label="Avg Website Score"
          value={stats.averageWebsiteScore}
        />
        <StatWidget
          label="Avg Technical Score"
          value={stats.averageTechnicalScore}
        />
        <StatWidget label="Privacy Warnings" value={stats.privacyWarnings} />
        <StatWidget label="Has EXIF" value={stats.withExif} />
        <StatWidget label="Missing EXIF" value={stats.missingExif} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <DistributionList
          title="Project Distribution"
          buckets={stats.projectDistribution}
        />
        <DistributionList
          title="Repair Category Distribution"
          buckets={stats.repairCategoryDistribution}
        />
        <DistributionList
          title="Boat Manufacturer Distribution"
          buckets={stats.manufacturerDistribution}
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="media-light:text-slate-900 text-xl font-semibold text-white">
            Recently Indexed Assets
          </h2>
          <Link
            href="/media/library"
            className="text-electric-400 text-sm hover:underline"
          >
            Open gallery
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.recentlyIndexed.map((asset) => (
            <CatalogMediaCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>
    </MediaShell>
  );
}
