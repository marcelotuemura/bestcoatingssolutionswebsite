#!/usr/bin/env node
/**
 * Scan data/pictures → data/media-manifest.json
 * Usage: pnpm media:inventory
 * Never modifies originals.
 */

import path from 'node:path';
import { MEDIA_MANIFEST_PATH } from '../lib/media-pipeline/constants';
import {
  scanMediaArchive,
  writeMediaManifest,
} from '../lib/media-pipeline/inventory/scan';

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const generatedAt = new Date().toISOString();
  // eslint-disable-next-line no-console -- CLI progress
  console.log(
    `[media:inventory] Scanning ${path.join(repoRoot, 'data/pictures')}…`,
  );
  const manifest = await scanMediaArchive({
    repoRoot,
    importedAt: generatedAt,
    generatedAt,
  });
  const out = await writeMediaManifest(repoRoot, manifest, MEDIA_MANIFEST_PATH);
  // eslint-disable-next-line no-console -- CLI progress
  console.log(`[media:inventory] Wrote ${out}`);
  // eslint-disable-next-line no-console -- CLI progress
  console.log(
    `[media:inventory] assets=${manifest.assetCount} projects=${manifest.projectCount} duplicates=${manifest.duplicateGroupCount} lowRes=${manifest.lowResolutionCount} gps=${manifest.gpsExifCount} unsupported=${manifest.unsupportedCount}`,
  );
}

main().catch((err) => {
  console.error('[media:inventory] failed', err);
  process.exitCode = 1;
});
