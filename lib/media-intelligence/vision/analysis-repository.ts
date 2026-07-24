import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';

/**
 * Analysis persistence interface — local JSON or PostgreSQL.
 * Deterministic catalog remains separate; AI suggestions are never auto-applied.
 */
export interface AnalysisRepository {
  readonly name: string;
  getCurrent(assetId: string): Promise<AssetVisionAnalysis | undefined>;
  listHistory(assetId: string): Promise<readonly AssetVisionAnalysis[]>;
  listCurrent(): Promise<readonly AssetVisionAnalysis[]>;
  saveCurrent(analysis: AssetVisionAnalysis): Promise<void>;
  saveBatch(analyses: readonly AssetVisionAnalysis[]): Promise<void>;
}

export type AnalysisRepositoryBackend = 'json' | 'postgres';
