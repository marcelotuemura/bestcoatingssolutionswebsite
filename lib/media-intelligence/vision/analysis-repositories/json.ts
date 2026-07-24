import {
  mergeAiAnalysisStore,
  readAiAnalysisStore,
  getAnalysisByAssetId,
} from '@/lib/media-intelligence/vision/store';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';
import type { AnalysisRepository } from '@/lib/media-intelligence/vision/analysis-repository';

/**
 * Local JSON analysis overlay — development and rollback path.
 */
export class JsonAnalysisRepository implements AnalysisRepository {
  readonly name = 'json-analysis-repository';

  constructor(private readonly root?: string) {}

  async getCurrent(assetId: string): Promise<AssetVisionAnalysis | undefined> {
    const store = await readAiAnalysisStore(this.root);
    return getAnalysisByAssetId(store, assetId);
  }

  async listHistory(assetId: string): Promise<readonly AssetVisionAnalysis[]> {
    const current = await this.getCurrent(assetId);
    return current ? [current] : [];
  }

  async listCurrent(): Promise<readonly AssetVisionAnalysis[]> {
    const store = await readAiAnalysisStore(this.root);
    return store.analyses;
  }

  async saveCurrent(analysis: AssetVisionAnalysis): Promise<void> {
    await mergeAiAnalysisStore({
      incoming: [analysis],
      root: this.root,
      provider: analysis.provider,
    });
  }

  async saveBatch(analyses: readonly AssetVisionAnalysis[]): Promise<void> {
    if (analyses.length === 0) return;
    await mergeAiAnalysisStore({
      incoming: analyses,
      root: this.root,
      provider: analyses[0]?.provider,
    });
  }
}
