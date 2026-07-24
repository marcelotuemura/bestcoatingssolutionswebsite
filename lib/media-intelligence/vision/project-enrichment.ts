import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import type { CatalogProject } from '@/lib/media-library/catalog-schema';
import type { ImageType } from '@/lib/media-intelligence/schemas';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';
import type { ProjectEnrichmentSuggestion } from '@/lib/media-intelligence/vision/schema';

const SEQUENCE_STAGES: readonly ImageType[] = ['before', 'during', 'after'];

function stageOf(asset: CatalogAsset, ai?: AssetVisionAnalysis): ImageType {
  if (ai?.stage.stage && ai.stage.stage !== 'unknown') return ai.stage.stage;
  return asset.stage;
}

function similarityScore(
  a: CatalogAsset,
  b: CatalogAsset,
  aiA?: AssetVisionAnalysis,
  aiB?: AssetVisionAnalysis,
): number {
  let score = 0;
  if (a.projectId && a.projectId === b.projectId) score += 0.45;
  if (
    a.manufacturer &&
    b.manufacturer &&
    a.manufacturer.toLowerCase() === b.manufacturer.toLowerCase()
  ) {
    score += 0.2;
  }
  const mfrA = aiA?.boat.manufacturer?.value?.toLowerCase();
  const mfrB = aiB?.boat.manufacturer?.value?.toLowerCase();
  if (mfrA && mfrB && mfrA === mfrB) score += 0.15;
  const svcA = new Set(aiA?.services.map((s) => s.category) ?? []);
  for (const s of aiB?.services ?? []) {
    if (svcA.has(s.category) && s.category !== 'unknown') score += 0.08;
  }
  if (a.repairCategory && a.repairCategory === b.repairCategory) score += 0.1;
  return Math.min(1, score);
}

/**
 * Project enrichment suggestions from AI + deterministic cues.
 * Suggestions only — never alters project grouping automatically.
 */
export function suggestProjectEnrichment(input: {
  readonly project: CatalogProject;
  readonly assets: readonly CatalogAsset[];
  readonly aiByAssetId?: ReadonlyMap<string, AssetVisionAnalysis>;
  readonly pool?: readonly CatalogAsset[];
}): ProjectEnrichmentSuggestion {
  const projectAssets = input.assets.filter(
    (a) =>
      a.projectId === input.project.id || input.project.assetIds.includes(a.id),
  );

  const present = new Set<ImageType>();
  for (const asset of projectAssets) {
    present.add(stageOf(asset, input.aiByAssetId?.get(asset.id)));
  }
  const missingStages = SEQUENCE_STAGES.filter((s) => !present.has(s));

  const ranked = [...projectAssets].sort((a, b) => {
    const aiA = input.aiByAssetId?.get(a.id);
    const aiB = input.aiByAssetId?.get(b.id);
    const heroA =
      aiA?.quality.heroSuitability ??
      a.scores.website * 0.6 + a.scores.marketing * 0.4;
    const heroB =
      aiB?.quality.heroSuitability ??
      b.scores.website * 0.6 + b.scores.marketing * 0.4;
    return heroB - heroA;
  });

  const suggestedCoverAssetId =
    ranked.find((a) => {
      const stage = stageOf(a, input.aiByAssetId?.get(a.id));
      return stage === 'after' || a.isHeroCandidate;
    })?.id ?? ranked[0]?.id;

  const stageOrder: Record<string, number> = {
    before: 0,
    during: 1,
    after: 2,
    detail: 3,
    context: 4,
    material: 5,
    unknown: 6,
  };
  const suggestedTimelineOrder = [...projectAssets]
    .sort((a, b) => {
      const sa = stageOrder[stageOf(a, input.aiByAssetId?.get(a.id))] ?? 9;
      const sb = stageOrder[stageOf(b, input.aiByAssetId?.get(b.id))] ?? 9;
      if (sa !== sb) return sa - sb;
      return (a.exifDate ?? a.indexedAt ?? '').localeCompare(
        b.exifDate ?? b.indexedAt ?? '',
      );
    })
    .map((a) => a.id);

  const relatedAssetIds: string[] = [];
  const similarityNotes: string[] = [];
  const pool = (input.pool ?? []).filter(
    (a) => !projectAssets.some((p) => p.id === a.id),
  );
  const scored = pool
    .map((candidate) => {
      let best = 0;
      for (const member of projectAssets) {
        best = Math.max(
          best,
          similarityScore(
            member,
            candidate,
            input.aiByAssetId?.get(member.id),
            input.aiByAssetId?.get(candidate.id),
          ),
        );
      }
      return { candidate, best };
    })
    .filter((row) => row.best >= 0.35)
    .sort((a, b) => b.best - a.best)
    .slice(0, 8);

  for (const row of scored) {
    relatedAssetIds.push(row.candidate.id);
    similarityNotes.push(
      `${row.candidate.filename} similarity ${Math.round(row.best * 100)}%`,
    );
  }

  if (missingStages.length > 0) {
    similarityNotes.push(
      `Missing sequence stages: ${missingStages.join(', ')}`,
    );
  }

  return {
    projectId: input.project.id,
    missingStages,
    relatedAssetIds,
    suggestedCoverAssetId,
    suggestedTimelineOrder,
    similarityNotes,
    autoApply: false,
  };
}
