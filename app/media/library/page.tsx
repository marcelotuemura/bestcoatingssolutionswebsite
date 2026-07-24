import { Suspense } from 'react';
import { AssetCard } from '@/components/media-intelligence/AssetCard';
import { MediaSearchBar } from '@/components/media-intelligence/MediaSearchBar';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import {
  parseNaturalLanguageQuery,
  searchMediaAssets,
} from '@/lib/media-intelligence/search';

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const repo = getMediaIntelligenceRepository();
  const query = q ? parseNaturalLanguageQuery(q) : {};
  const assets = searchMediaAssets(repo.listAssets(), query);

  return (
    <MediaShell
      title="Media Library"
      subtitle="Searchable DAMS — keyword, boat, repair, damage, manufacturer, date, project, technician, status, tags, score."
    >
      <Suspense fallback={null}>
        <MediaSearchBar />
      </Suspense>
      <p className="text-silver-500 mt-3 text-sm">
        {assets.length} asset{assets.length === 1 ? '' : 's'}
        {q ? ` matching “${q}”` : ''}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </MediaShell>
  );
}
