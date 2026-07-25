import type {
  CatalogAsset,
  CatalogProject,
  DuplicateGroup,
} from './catalog-schema';

export type DistributionBucket = {
  readonly label: string;
  readonly count: number;
};

export type CatalogDashboardStats = {
  readonly totalImages: number;
  readonly totalVideos: number;
  readonly totalProjects: number;
  readonly exactDuplicateGroups: number;
  readonly nearDuplicateGroups: number;
  readonly heroImageCandidates: number;
  readonly averageMarketingScore: number;
  readonly averageWebsiteScore: number;
  readonly averageTechnicalScore: number;
  readonly recentlyIndexed: readonly CatalogAsset[];
  readonly projectDistribution: readonly DistributionBucket[];
  readonly repairCategoryDistribution: readonly DistributionBucket[];
  readonly manufacturerDistribution: readonly DistributionBucket[];
  readonly privacyWarnings: number;
  readonly withExif: number;
  readonly missingExif: number;
  readonly isFixture: boolean;
  readonly generatedAt: string;
  readonly source: string;
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return (
    Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) /
    10
  );
}

function distribution(
  assets: readonly CatalogAsset[],
  pick: (asset: CatalogAsset) => string | undefined,
  limit = 12,
): DistributionBucket[] {
  const counts = new Map<string, number>();
  for (const asset of assets) {
    const label = pick(asset)?.trim() || 'Unknown';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function buildCatalogDashboardStats(input: {
  readonly assets: readonly CatalogAsset[];
  readonly projects: readonly CatalogProject[];
  readonly duplicateGroups: readonly DuplicateGroup[];
  readonly isFixture?: boolean;
  readonly generatedAt?: string;
  readonly source?: string;
}): CatalogDashboardStats {
  const { assets, projects, duplicateGroups } = input;
  const images = assets.filter((a) => a.mediaKind === 'image');
  const videos = assets.filter((a) => a.mediaKind === 'video');
  const exact = duplicateGroups.filter((g) => g.kind === 'exact');
  const near = duplicateGroups.filter((g) => g.kind === 'near');

  const recentlyIndexed = [...assets]
    .sort((a, b) => (b.indexedAt ?? '').localeCompare(a.indexedAt ?? ''))
    .slice(0, 12);

  return {
    totalImages: images.length,
    totalVideos: videos.length,
    totalProjects: projects.length,
    exactDuplicateGroups: exact.length,
    nearDuplicateGroups: near.length,
    heroImageCandidates: assets.filter((a) => a.isHeroCandidate).length,
    averageMarketingScore: avg(assets.map((a) => a.scores.marketing)),
    averageWebsiteScore: avg(assets.map((a) => a.scores.website)),
    averageTechnicalScore: avg(assets.map((a) => a.scores.technical)),
    recentlyIndexed,
    projectDistribution: distribution(assets, (a) => a.projectName),
    repairCategoryDistribution: distribution(assets, (a) => a.repairCategory),
    manufacturerDistribution: distribution(assets, (a) => a.manufacturer),
    privacyWarnings: assets.filter((a) => a.privacyStatus !== 'clear').length,
    withExif: assets.filter((a) => a.hasExif).length,
    missingExif: assets.filter((a) => !a.hasExif).length,
    isFixture: Boolean(input.isFixture),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    source: input.source ?? 'unknown',
  };
}

export function buildProjectView(
  project: CatalogProject,
  assets: readonly CatalogAsset[],
) {
  const projectAssets = assets.filter(
    (a) => a.projectId === project.id || project.assetIds.includes(a.id),
  );
  const byStage = (stage: string) =>
    projectAssets.filter((a) => a.stage === stage);
  const bestBy = (scoreKey: 'website' | 'marketing' | 'technical' | 'social') =>
    [...projectAssets]
      .filter((a) => a.mediaKind === 'image')
      .sort((a, b) => {
        const aScore =
          scoreKey === 'social'
            ? (a.scores.social ?? a.scores.marketing)
            : a.scores[scoreKey];
        const bScore =
          scoreKey === 'social'
            ? (b.scores.social ?? b.scores.marketing)
            : b.scores[scoreKey];
        return bScore - aScore;
      })[0];

  return {
    project,
    assets: projectAssets,
    before: byStage('before'),
    during: byStage('during'),
    after: byStage('after'),
    videos: projectAssets.filter((a) => a.mediaKind === 'video'),
    bestWebsite: bestBy('website'),
    bestSocial: bestBy('social'),
    topHero:
      projectAssets.find((a) => a.id === project.topHeroAssetId) ??
      projectAssets.find((a) => a.isHeroCandidate) ??
      bestBy('website'),
    duplicateAlerts: projectAssets.filter(
      (a) => a.isExactDuplicate || a.isNearDuplicate,
    ),
    privacyAlerts: projectAssets.filter((a) => a.privacyStatus !== 'clear'),
  };
}
