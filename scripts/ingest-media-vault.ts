#!/usr/bin/env node
/**
 * Ingest media into the local Media Vault.
 *
 * Usage:
 *   MEDIA_VAULT_ROOT=./data/media-vault node --experimental-strip-types scripts/ingest-media-vault.ts ./path/to/inbox
 */
import path from 'node:path';
import { ingestDirectory } from '../lib/media-vault/ingestion/pipeline';

async function main() {
  const sourceDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(process.cwd(), 'data', 'media-vault', 'inbox');
  const limit = process.env.INGEST_LIMIT
    ? Number(process.env.INGEST_LIMIT)
    : undefined;

  const result = await ingestDirectory({ sourceDir, limit });
  console.warn(
    JSON.stringify(
      {
        sourceDir,
        processed: result.processed,
        ingested: result.ingested,
        skipped: result.skipped,
        rejected: result.rejected,
        durationMs: Math.round(result.durationMs),
        errors: result.errors.slice(0, 20),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
