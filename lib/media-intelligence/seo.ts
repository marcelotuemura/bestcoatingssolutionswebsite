import type { MediaAsset, SeoPackage } from '@/lib/media-intelligence/schemas';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function generateSeoPackage(asset: MediaAsset): SeoPackage {
  const manufacturer =
    asset.manufacturer ?? asset.boat?.manufacturer ?? 'marine';
  const repair = asset.repairTypes[0]?.replace(/_/g, '-') ?? 'repair';
  const stage = asset.imageType;
  const optimizedFilename =
    slugify(`bcs-${manufacturer}-${repair}-${stage}-${asset.id.slice(-6)}`) +
    '.webp';

  const title = `${manufacturer} ${repair.replace(/-/g, ' ')} ${stage}`.trim();
  const altText = `${title} — Best Coatings Solutions marine documentation`;
  const description = `Professional marine ${repair.replace(/-/g, ' ')} photography (${stage}) for Best Coatings Solutions.`;

  return {
    assetId: asset.id,
    optimizedFilename,
    title,
    altText,
    caption: title,
    description,
    metaDescription: description.slice(0, 155),
    keywords: [
      manufacturer,
      repair,
      stage,
      ...asset.tags.slice(0, 8),
      'Best Coatings Solutions',
    ],
    openGraphHints: {
      title: `${title} | BCS`,
      description,
    },
  };
}
