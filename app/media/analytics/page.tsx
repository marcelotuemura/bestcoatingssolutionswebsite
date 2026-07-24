import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { StatCard } from '@/components/media-intelligence/MediaBadges';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';

export default function MediaAnalyticsPage() {
  const stats = getMediaIntelligenceRepository().getDashboardStats();
  const assets = getMediaIntelligenceRepository().listAssets();
  const unused = assets.filter(
    (asset) =>
      !asset.status.startsWith('published_') && asset.status !== 'approved',
  ).length;
  const top = [...assets]
    .sort((a, b) => (b.scores?.marketing ?? 0) - (a.scores?.marketing ?? 0))
    .slice(0, 5);

  return (
    <MediaShell
      title="Analytics"
      subtitle="Library health today. Future: Google Analytics + Search Console integrations for published derivative performance."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published channels (meta)"
          value={assets.filter((a) => a.status.startsWith('published_')).length}
        />
        <StatCard label="Unused / not approved" value={unused} />
        <StatCard label="Website-ready" value={stats.websiteReady} />
        <StatCard label="SEO-ready" value={stats.seoReady} />
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">
          Best marketing scores (library)
        </h2>
        <ul className="text-silver-300 mt-4 space-y-2 text-sm">
          {top.map((asset) => (
            <li key={asset.id}>
              {asset.originalFilename} — marketing{' '}
              {asset.scores?.marketing ?? 0}
            </li>
          ))}
        </ul>
      </section>
    </MediaShell>
  );
}
