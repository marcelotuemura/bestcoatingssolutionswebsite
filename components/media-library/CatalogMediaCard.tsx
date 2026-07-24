import Link from 'next/link';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import { ScoreChip } from '@/components/media-library/StatWidget';

function stageTone(stage: string): string {
  switch (stage) {
    case 'before':
      return 'from-rose-900/80 to-navy-900';
    case 'during':
      return 'from-amber-900/70 to-navy-900';
    case 'after':
      return 'from-emerald-900/70 to-navy-900';
    default:
      return 'from-navy-800 to-navy-950';
  }
}

export function CatalogMediaCard({
  asset,
  priority = false,
}: {
  readonly asset: CatalogAsset;
  readonly priority?: boolean;
}) {
  const thumb =
    asset.derivatives?.thumbnails?.[400] ||
    asset.derivatives?.poster ||
    asset.thumbnailPath ||
    null;
  const thumbSrc = thumb
    ? `/media/vault/${encodeURIComponent(asset.id)}/thumbnail/400`
    : null;

  return (
    <article
      className="border-navy-700 bg-navy-900/50 media-light:border-slate-200 media-light:bg-white group content-visibility-auto relative flex flex-col overflow-hidden rounded-2xl border"
      data-testid="catalog-media-card"
      data-asset-id={asset.id}
    >
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${stageTone(asset.stage)}`}
        aria-hidden={thumbSrc ? undefined : true}
      >
        {thumbSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- private authenticated vault stream; not a public CDN asset
          <img
            src={thumbSrc}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            data-testid="catalog-media-thumb"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-silver-300/80 media-light:text-white/90 text-xs tracking-[0.2em] uppercase">
              {asset.mediaKind === 'video' ? 'Video' : 'Image'} · {asset.stage}
            </span>
          </div>
        )}
        {asset.isHeroCandidate ? (
          <span className="bg-electric-500/90 absolute top-2 left-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-medium text-white">
            Hero
          </span>
        ) : null}
        {asset.privacyStatus !== 'clear' ? (
          <span className="text-navy-950 absolute top-2 right-2 z-10 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-medium">
            Privacy
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-2 gap-1 p-2 opacity-0 transition group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/media/catalog/${asset.id}`}
            className="bg-navy-950/90 hover:bg-electric-500 focus-visible:ring-electric-500 flex-1 rounded-lg px-2 py-1.5 text-center text-xs text-white focus-visible:ring-2 focus-visible:outline-none"
            prefetch={priority}
          >
            Preview
          </Link>
          <Link
            href={`/media/catalog/${asset.id}`}
            className="bg-navy-950/90 hover:bg-electric-500 focus-visible:ring-electric-500 flex-1 rounded-lg px-2 py-1.5 text-center text-xs text-white focus-visible:ring-2 focus-visible:outline-none"
          >
            Details
          </Link>
          {asset.projectId ? (
            <Link
              href={`/media/catalog/projects/${asset.projectId}`}
              className="bg-navy-950/90 hover:bg-electric-500 focus-visible:ring-electric-500 flex-1 rounded-lg px-2 py-1.5 text-center text-xs text-white focus-visible:ring-2 focus-visible:outline-none"
            >
              Project
            </Link>
          ) : null}
          {asset.duplicateGroupId || asset.nearDuplicateGroupId ? (
            <Link
              href={`/media/duplicates#${asset.duplicateGroupId ?? asset.nearDuplicateGroupId}`}
              className="bg-navy-950/90 hover:bg-electric-500 focus-visible:ring-electric-500 flex-1 rounded-lg px-2 py-1.5 text-center text-xs text-white focus-visible:ring-2 focus-visible:outline-none"
            >
              Dupes
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <Link
            href={`/media/catalog/${asset.id}`}
            className="text-silver-100 media-light:text-slate-900 hover:text-electric-400 line-clamp-1 text-sm font-medium underline-offset-2 hover:underline"
          >
            {asset.filename}
          </Link>
          <p className="text-silver-500 media-light:text-slate-500 mt-1 line-clamp-1 text-xs">
            {asset.projectName ?? 'Unassigned'} ·{' '}
            {asset.manufacturer ?? 'Unknown'}
          </p>
        </div>
        <p className="text-silver-500 media-light:text-slate-500 text-xs">
          {(asset.repairCategory ?? 'repair').replace(/_/g, ' ')} ·{' '}
          {asset.stage} ·{' '}
          {asset.fileType.split('/')[1]?.toUpperCase() ?? asset.mediaKind}
          {asset.resolution ? ` · ${asset.resolution}` : ''}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <ScoreChip label="Web" score={asset.scores.website} />
          <ScoreChip label="Mkt" score={asset.scores.marketing} />
          <ScoreChip label="Tech" score={asset.scores.technical} />
        </div>
        <div className="text-silver-500 media-light:text-slate-500 flex flex-wrap gap-2 text-[11px]">
          <span>Privacy: {asset.privacyStatus}</span>
          <span>
            EXIF:{' '}
            {asset.hasExif
              ? (asset.exifDate?.slice(0, 10) ?? 'yes')
              : 'missing'}
          </span>
        </div>
      </div>
    </article>
  );
}
