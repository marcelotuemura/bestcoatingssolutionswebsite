import type {
  MediaAsset,
  MediaProject,
} from '@/lib/media-intelligence/schemas';

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Group assets into before → during → after projects.
 * Confidence rises when filenames/dates cluster and image types are present.
 */
export function detectProjectsFromAssets(
  assets: readonly MediaAsset[],
): readonly MediaProject[] {
  const clusters = new Map<string, MediaAsset[]>();

  for (const asset of assets) {
    const key =
      asset.projectId ??
      [
        asset.manufacturer ?? asset.boat?.manufacturer ?? 'unknown',
        asset.model ?? asset.boat?.model ?? 'unknown',
        (asset.capturedAt ?? asset.importedAt).slice(0, 10),
      ].join('|');
    const bucket = clusters.get(key) ?? [];
    bucket.push(asset);
    clusters.set(key, bucket);
  }

  const now = new Date().toISOString();
  const projects: MediaProject[] = [];

  for (const [key, group] of clusters) {
    if (group.length === 0) continue;
    const beforeAssetIds = group
      .filter((a) => a.imageType === 'before')
      .map((a) => a.id);
    const duringAssetIds = group
      .filter((a) => a.imageType === 'during')
      .map((a) => a.id);
    const afterAssetIds = group
      .filter((a) => a.imageType === 'after')
      .map((a) => a.id);

    let confidence = 0.25;
    if (beforeAssetIds.length && afterAssetIds.length) confidence += 0.4;
    if (duringAssetIds.length) confidence += 0.15;
    if (group.some((a) => a.boat?.manufacturer)) confidence += 0.1;

    const sample = group[0]!;
    const manufacturer =
      sample.manufacturer ?? sample.boat?.manufacturer ?? 'Marine';
    const repair = sample.repairTypes[0] ?? 'repair';

    projects.push({
      id: createId('proj'),
      projectNumber: `BCS-${group.length}-${key.slice(0, 8).replace(/\|/g, '')}`,
      title: `${manufacturer} ${repair.replace('_', ' ')} project`,
      boat: sample.boat,
      repairTypes: [...new Set(group.flatMap((a) => a.repairTypes))],
      damageTypes: [...new Set(group.flatMap((a) => a.damageTypes))],
      assetIds: group.map((a) => a.id),
      beforeAssetIds,
      duringAssetIds,
      afterAssetIds,
      timelineStart: group.map((a) => a.capturedAt ?? a.importedAt).sort()[0],
      timelineEnd: group
        .map((a) => a.capturedAt ?? a.importedAt)
        .sort()
        .at(-1),
      confidence: Math.min(1, confidence),
      status: 'analyzed',
      location: sample.location,
      technician: sample.technician,
      isDemoSeed: group.every((a) => a.isDemoSeed),
      createdAt: now,
      updatedAt: now,
    });
  }

  return projects;
}
