export interface DuplicateCandidate {
  readonly id: string;
  readonly filename: string;
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
  readonly perceptualHash?: string;
  readonly overallScore?: number;
}

export interface DuplicateGroup {
  readonly groupId: string;
  readonly kind: 'exact' | 'near' | 'burst' | 'same_angle' | 'blurred_copy';
  readonly assetIds: readonly string[];
  /** Recommended keeper — best score / sharpest; never auto-deleted. */
  readonly recommendedKeeperId: string;
  readonly requiresOwnerConfirmation: true;
}

function exactKey(asset: DuplicateCandidate): string {
  return `${asset.filename.toLowerCase()}|${asset.bytes}|${asset.width ?? 0}x${asset.height ?? 0}`;
}

/**
 * Groups exact / near duplicates. Never deletes — returns recommendations only.
 */
export function detectDuplicateGroups(
  assets: readonly DuplicateCandidate[],
): readonly DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const byExact = new Map<string, DuplicateCandidate[]>();

  for (const asset of assets) {
    const key = exactKey(asset);
    const bucket = byExact.get(key) ?? [];
    bucket.push(asset);
    byExact.set(key, bucket);
  }

  let index = 0;
  for (const bucket of byExact.values()) {
    if (bucket.length < 2) continue;
    const keeper = [...bucket].sort(
      (a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0),
    )[0]!;
    groups.push({
      groupId: `dup-exact-${index++}`,
      kind: 'exact',
      assetIds: bucket.map((item) => item.id),
      recommendedKeeperId: keeper.id,
      requiresOwnerConfirmation: true,
    });
  }

  const withHash = assets.filter((asset) => asset.perceptualHash);
  const byHash = new Map<string, DuplicateCandidate[]>();
  for (const asset of withHash) {
    const key = asset.perceptualHash!;
    const bucket = byHash.get(key) ?? [];
    bucket.push(asset);
    byHash.set(key, bucket);
  }
  for (const bucket of byHash.values()) {
    if (bucket.length < 2) continue;
    const alreadyExact = groups.some((group) =>
      bucket.every((item) => group.assetIds.includes(item.id)),
    );
    if (alreadyExact) continue;
    const keeper = [...bucket].sort(
      (a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0),
    )[0]!;
    groups.push({
      groupId: `dup-near-${index++}`,
      kind: 'near',
      assetIds: bucket.map((item) => item.id),
      recommendedKeeperId: keeper.id,
      requiresOwnerConfirmation: true,
    });
  }

  return groups;
}
