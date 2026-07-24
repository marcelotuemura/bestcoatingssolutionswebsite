import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import type { MediaAsset } from '@/lib/media-intelligence/schemas';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';

/**
 * AI overlay view — deterministic catalog fields remain unchanged.
 * UI and search may join this overlay; never write AI fields back as
 * authoritative catalog metadata without explicit owner action (future).
 */
export type CatalogAssetWithAi = CatalogAsset & {
  readonly aiAnalysis?: AssetVisionAnalysis;
};

/**
 * Attach AI analysis without mutating deterministic catalog fields.
 */
export function attachAiAnalysis(
  asset: CatalogAsset,
  analysis: AssetVisionAnalysis | undefined,
): CatalogAssetWithAi {
  if (!analysis) return { ...asset };
  return { ...asset, aiAnalysis: analysis };
}

export function attachAiAnalysisBatch(
  assets: readonly CatalogAsset[],
  byId: ReadonlyMap<string, AssetVisionAnalysis>,
): CatalogAssetWithAi[] {
  return assets.map((asset) => attachAiAnalysis(asset, byId.get(asset.id)));
}

/**
 * Optional projection helpers for display — does NOT mutate catalog store.
 * Returns a shallow display summary; originals and workflow untouched.
 */
export function summarizeAiForDisplay(analysis: AssetVisionAnalysis): {
  readonly provider: string;
  readonly analyzedAt: string;
  readonly confidence: number;
  readonly manufacturer?: string;
  readonly model?: string;
  readonly hullColor?: string;
  readonly services: readonly string[];
  readonly stage: string;
  readonly stageConfidence: number;
  readonly qualityOverall: number;
  readonly heroSuitability: number;
  readonly marketingSuitability: number;
  readonly privacyRequiresReview: boolean;
  readonly privacyRisks: readonly string[];
  readonly keywords: readonly string[];
  readonly qualityExplanation: readonly string[];
} {
  return {
    provider: analysis.provider,
    analyzedAt: analysis.analyzedAt,
    confidence: analysis.confidence,
    manufacturer: analysis.boat.manufacturer?.value,
    model: analysis.boat.model?.value,
    hullColor: analysis.boat.hullColor?.value,
    services: analysis.services
      .filter((s) => s.category !== 'unknown')
      .map((s) => s.category.replace(/_/g, ' ')),
    stage: analysis.stage.stage,
    stageConfidence: analysis.stage.confidence,
    qualityOverall: analysis.quality.overall,
    heroSuitability: analysis.quality.heroSuitability,
    marketingSuitability: analysis.quality.marketingSuitability,
    privacyRequiresReview: analysis.privacy.requiresOwnerReview,
    privacyRisks: analysis.privacy.findings.map((f) => f.risk),
    keywords: analysis.keywords,
    qualityExplanation: analysis.quality.explanation,
  };
}

/**
 * Bridge AI analysis onto DAMS MediaAsset for studio views.
 * Does NOT change workflow status (analysis-only Phase 4 rule).
 */
export function mergeAiIntoMediaAssetFields(
  asset: MediaAsset,
  analysis: AssetVisionAnalysis,
): MediaAsset {
  return {
    ...asset,
    manufacturer: analysis.boat.manufacturer?.value ?? asset.manufacturer,
    model: analysis.boat.model?.value ?? asset.model,
    boat: {
      manufacturer:
        analysis.boat.manufacturer?.value ?? asset.boat?.manufacturer,
      model: analysis.boat.model?.value ?? asset.boat?.model,
      hullColor: analysis.boat.hullColor?.value ?? asset.boat?.hullColor,
      propulsion: analysis.boat.outboardBrand?.value ?? asset.boat?.propulsion,
      engineCount:
        analysis.boat.outboardCount?.value ?? asset.boat?.engineCount,
      category: asset.boat?.category ?? 'unknown',
      confidence:
        analysis.boat.manufacturer?.confidence ?? asset.boat?.confidence ?? 0,
    },
    imageType:
      analysis.stage.stage !== 'unknown'
        ? analysis.stage.stage
        : asset.imageType,
    keywords: [...new Set([...asset.keywords, ...analysis.keywords])],
    tags: [...new Set([...asset.tags, ...analysis.tags])],
    privacyRisks: [
      ...new Set([
        ...asset.privacyRisks,
        ...analysis.privacy.findings.map((f) => f.risk),
      ]),
    ],
    // Explicit: do not change status / publish fields.
    status: asset.status,
  };
}
