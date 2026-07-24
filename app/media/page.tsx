import Link from 'next/link';
import { AssetCard } from '@/components/media-intelligence/AssetCard';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { StatCard } from '@/components/media-intelligence/MediaBadges';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaDashboardPage() {
  const stats = getMediaIntelligenceRepository().getDashboardStats();

  return (
    <MediaShell
      title="Command Center"
      subtitle="AI-powered Digital Asset Management for every BCS repair — growing into the company media knowledge base."
    >
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="media-dashboard-stats"
      >
        <StatCard label="Images imported" value={stats.imagesImported} />
        <StatCard label="Projects" value={stats.projects} />
        <StatCard label="Pending review" value={stats.pendingReview} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Duplicates flagged" value={stats.duplicates} />
        <StatCard label="Website ready" value={stats.websiteReady} />
        <StatCard label="Social ready" value={stats.socialReady} />
        <StatCard label="SEO ready" value={stats.seoReady} />
        <StatCard
          label="Storage (originals meta)"
          value={formatBytes(stats.storageBytes)}
          hint="Original binaries stay in private vault"
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Recently imported
            </h2>
            <Link
              href="/media/library"
              className="text-electric-400 text-sm hover:underline"
            >
              Open library
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentlyImported.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Approvals queue
            </h2>
            <Link
              href="/media/approvals"
              className="text-electric-400 text-sm hover:underline"
            >
              Review all
            </Link>
          </div>
          <div className="space-y-3">
            {getMediaIntelligenceRepository()
              .listAssets()
              .filter((asset) => asset.status === 'pending_approval')
              .slice(0, 6)
              .map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
          </div>
        </section>
      </div>
    </MediaShell>
  );
}
