import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import {
  catalogAssetToVisionInput,
  type VisionProvider,
} from '@/lib/media-intelligence/vision/provider';
import { getVisionProvider } from '@/lib/media-intelligence/vision/factory';
import {
  mergeAiAnalysisStore,
  readAiAnalysisStore,
  indexAnalysesByAssetId,
} from '@/lib/media-intelligence/vision/store';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';

export type VisionBatchResult = {
  readonly processed: number;
  readonly analyzed: number;
  readonly reanalyzed: number;
  readonly skipped: number;
  readonly failed: number;
  readonly errors: readonly string[];
  readonly durationMs: number;
  readonly provider: string;
  readonly storePath?: string;
  readonly analyses: readonly AssetVisionAnalysis[];
};

export type AnalyzeCatalogOptions = {
  readonly assets: readonly CatalogAsset[];
  readonly provider?: VisionProvider;
  /** Re-run analysis even when a record already exists. */
  readonly forceReanalyze?: boolean;
  readonly root?: string;
  readonly concurrency?: number;
  readonly onProgress?: (done: number, total: number) => void;
};

/**
 * Asynchronous batch vision analysis over catalog assets.
 * Writes AI overlay store only — never originals, never workflow, never publish.
 */
export async function analyzeCatalogAssets(
  options: AnalyzeCatalogOptions,
): Promise<VisionBatchResult> {
  const started = Date.now();
  const provider = options.provider ?? getVisionProvider();
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, 16));
  const existing = await readAiAnalysisStore(options.root).catch(() => null);
  const existingById = existing
    ? indexAnalysesByAssetId(existing)
    : new Map<string, AssetVisionAnalysis>();

  const errors: string[] = [];
  const analyses: AssetVisionAnalysis[] = [];
  let analyzed = 0;
  let reanalyzed = 0;
  let skipped = 0;
  let failed = 0;
  let done = 0;

  const queue = [...options.assets];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const asset = queue.shift();
      if (!asset) return;
      try {
        const prior = existingById.get(asset.id);
        if (prior && !options.forceReanalyze) {
          skipped += 1;
          analyses.push(prior);
        } else {
          const result = await provider.analyze(
            catalogAssetToVisionInput(asset),
          );
          analyses.push(result);
          if (prior) reanalyzed += 1;
          else analyzed += 1;
        }
      } catch (error) {
        failed += 1;
        errors.push(
          `${asset.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      } finally {
        done += 1;
        options.onProgress?.(done, options.assets.length);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  // Persist only newly produced analyses (and reanalyzed).
  const toPersist = analyses.filter((a) => {
    if (options.forceReanalyze) return true;
    const prior = existingById.get(a.assetId);
    return !prior || prior.analyzedAt !== a.analyzedAt;
  });

  let storePath: string | undefined;
  if (toPersist.length > 0) {
    const saved = await mergeAiAnalysisStore({
      incoming: toPersist,
      root: options.root,
      provider: provider.id,
    });
    storePath = saved.storePath;
  }

  return {
    processed: options.assets.length,
    analyzed,
    reanalyzed,
    skipped,
    failed,
    errors,
    durationMs: Date.now() - started,
    provider: provider.id,
    storePath,
    analyses,
  };
}

/**
 * Analyze a single asset and persist the AI overlay.
 */
export async function analyzeSingleAsset(input: {
  readonly asset: CatalogAsset;
  readonly provider?: VisionProvider;
  readonly root?: string;
}): Promise<AssetVisionAnalysis> {
  const provider = input.provider ?? getVisionProvider();
  const result = await provider.analyze(catalogAssetToVisionInput(input.asset));
  await mergeAiAnalysisStore({
    incoming: [result],
    root: input.root,
    provider: provider.id,
  });
  return result;
}
