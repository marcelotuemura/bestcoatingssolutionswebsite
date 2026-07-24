import {
  readAiAnalysisStore,
  indexAnalysesByAssetId,
  getAnalysisByAssetId,
} from '@/lib/media-intelligence/vision/store';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import { attachAiAnalysis } from '@/lib/media-intelligence/vision/merge';

/**
 * Load AI analysis overlay (separate from deterministic catalog).
 * Missing store → empty map (fixtures still work without analysis).
 */
export async function loadAiAnalysisIndex(): Promise<
  Map<string, AssetVisionAnalysis>
> {
  try {
    const store = await readAiAnalysisStore();
    return indexAnalysesByAssetId(store);
  } catch {
    return new Map();
  }
}

export async function getAiAnalysisForAsset(
  assetId: string,
): Promise<AssetVisionAnalysis | undefined> {
  try {
    const store = await readAiAnalysisStore();
    return getAnalysisByAssetId(store, assetId);
  } catch {
    return undefined;
  }
}

export async function withAiAnalysis(
  asset: CatalogAsset,
): Promise<CatalogAsset & { aiAnalysis?: AssetVisionAnalysis }> {
  const analysis = await getAiAnalysisForAsset(asset.id);
  return attachAiAnalysis(asset, analysis);
}
