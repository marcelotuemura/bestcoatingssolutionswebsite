import Link from 'next/link';
import type { GalleryCollection } from '@/lib/media-intelligence/gallery/types';

type Props = {
  readonly collections: readonly GalleryCollection[];
};

export function CollectionList({ collections }: Props) {
  if (collections.length === 0) {
    return (
      <div className="space-y-4">
        <p
          className="text-silver-400 py-12 text-center text-sm"
          data-testid="collections-empty"
        >
          No collections yet. Create a collection from the gallery to organize
          your assets.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="collections-grid"
    >
      {collections.map((col) => (
        <Link
          key={col.id}
          href={`/media/collections/${col.id}`}
          className="border-navy-700 bg-navy-900/40 hover:border-electric-500 group flex flex-col rounded-2xl border p-5 transition"
          data-testid={`collection-card-${col.id}`}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="group-hover:text-electric-400 font-semibold text-white transition">
              {col.name}
            </h3>
            <span className="text-silver-500 shrink-0 text-xs">
              {col.assetCount ?? 0} asset
              {(col.assetCount ?? 0) === 1 ? '' : 's'}
            </span>
          </div>
          {col.description ? (
            <p className="text-silver-400 mt-2 line-clamp-2 text-sm">
              {col.description}
            </p>
          ) : null}
          <p className="text-silver-600 mt-auto pt-3 text-xs">
            Created {new Date(col.createdAt).toLocaleDateString()}
          </p>
        </Link>
      ))}
    </div>
  );
}
