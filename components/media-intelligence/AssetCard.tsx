import Link from 'next/link';
import {
  ScoreBadge,
  StatusBadge,
} from '@/components/media-intelligence/MediaBadges';
import type { MediaAsset } from '@/lib/media-intelligence/schemas';

export function AssetCard({ asset }: { readonly asset: MediaAsset }) {
  return (
    <article className="border-navy-700 bg-navy-900/50 flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/media/assets/${asset.id}`}
            className="text-silver-100 hover:text-electric-400 font-medium underline-offset-4 hover:underline"
          >
            {asset.originalFilename}
          </Link>
          <p className="text-silver-500 mt-1 text-xs">
            {asset.manufacturer ?? 'Unknown builder'} · {asset.imageType}
            {asset.isDemoSeed ? ' · DEMO SEED' : ''}
          </p>
        </div>
        <StatusBadge status={asset.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        {asset.scores ? (
          <>
            <ScoreBadge label="Overall" score={asset.scores.overall} />
            <ScoreBadge label="Web" score={asset.scores.website} />
            <ScoreBadge label="Social" score={asset.scores.social} />
            <ScoreBadge label="SEO" score={asset.scores.seo} />
          </>
        ) : null}
      </div>
      <div className="text-silver-500 flex flex-wrap gap-1 text-xs">
        {asset.tags.slice(0, 6).map((tag) => (
          <span
            key={tag}
            className="border-navy-700 rounded-md border px-1.5 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
