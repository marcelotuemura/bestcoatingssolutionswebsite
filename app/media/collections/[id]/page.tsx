import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  getGalleryCollection,
  listGalleryAssets,
} from '@/lib/media-intelligence/gallery';

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMediaPageAccess();
  const { id } = await params;
  const session = await resolveMediaTrustedActor();
  if (!session.ok) notFound();

  const colResult = await getGalleryCollection(session.actor, id);
  if (!colResult.ok) notFound();
  const collection = colResult.data;

  const assetsResult = await listGalleryAssets(session.actor, {
    collectionId: id,
    pageSize: 48,
  });
  const assets = assetsResult.ok ? assetsResult.data.assets : [];

  return (
    <MediaShell
      title={collection.name}
      subtitle={
        collection.description || `${collection.assetCount ?? 0} assets`
      }
    >
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/media/collections"
          className="text-silver-400 text-sm hover:text-white"
        >
          ← Collections
        </Link>
        <span className="text-silver-600 text-xs">
          {collection.assetCount ?? assets.length} asset
          {(collection.assetCount ?? assets.length) === 1 ? '' : 's'}
        </span>
      </div>

      {assets.length === 0 ? (
        <p
          className="text-silver-400 py-12 text-center text-sm"
          data-testid="collection-empty"
        >
          No assets in this collection yet. Add assets from the gallery.
        </p>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          data-testid="collection-assets"
        >
          {assets.map((asset) => (
            <Link
              key={asset.externalId}
              href={`/media/assets/${asset.externalId}`}
              className="border-navy-700 bg-navy-900/40 hover:border-electric-500 group overflow-hidden rounded-xl border transition"
            >
              <div className="bg-navy-900 flex aspect-video items-center justify-center">
                <span className="text-silver-600 text-xs">
                  {asset.mediaKind}
                </span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm text-white">
                  {asset.displayTitle ?? asset.originalFilename}
                </p>
                <p className="text-silver-500 mt-1 text-xs">
                  {asset.fileType.split('/')[1]?.toUpperCase()} ·{' '}
                  {Math.round(asset.fileSizeBytes / 1024)} KB
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MediaShell>
  );
}
