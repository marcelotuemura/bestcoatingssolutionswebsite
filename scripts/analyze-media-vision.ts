#!/usr/bin/env node
/**
 * Phase 4 — batch AI vision analysis over catalog assets.
 * Writes ai_analysis.json overlay only. Never touches originals.
 *
 *   pnpm media:analyze
 *   VISION_PROVIDER=mock FORCE_REANALYZE=1 pnpm media:analyze
 */
import { getMediaRepository } from '../lib/media-vault/factory';
import { analyzeCatalogAssets } from '../lib/media-intelligence/vision/pipeline';
import { createVisionProvider } from '../lib/media-intelligence/vision/factory';

async function main() {
  const repo = getMediaRepository();
  const assets = await repo.getAssets();
  const provider = createVisionProvider();
  const forceReanalyze = process.env.FORCE_REANALYZE === '1';

  console.warn(
    `Vision analysis: provider=${provider.id} assets=${assets.length} force=${forceReanalyze}`,
  );

  const started = Date.now();
  const result = await analyzeCatalogAssets({
    assets,
    provider,
    forceReanalyze,
    onProgress: (done, total) => {
      if (done === total || done % 25 === 0) {
        process.stderr.write(`\r  analyzed ${done}/${total}`);
      }
    },
  });
  process.stderr.write('\n');

  console.warn(
    JSON.stringify(
      {
        processed: result.processed,
        analyzed: result.analyzed,
        reanalyzed: result.reanalyzed,
        skipped: result.skipped,
        failed: result.failed,
        durationMs: result.durationMs,
        wallMs: Date.now() - started,
        provider: result.provider,
        storePath: result.storePath,
        errors: result.errors.slice(0, 10),
      },
      null,
      2,
    ),
  );

  if (result.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
