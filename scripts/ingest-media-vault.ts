#!/usr/bin/env node
/**
 * Ingest media into the local Media Vault (atomic write-once originals).
 *
 * Usage:
 *   node --experimental-strip-types scripts/ingest-media-vault.ts ./path/to/inbox
 *
 * Options via env:
 *   MEDIA_VAULT_ROOT
 *   INGEST_LIMIT
 *   INGEST_REPAIR_DERIVATIVES=true
 *   INGEST_FORCE_REGENERATE_DERIVATIVES=true
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
  const repairDerivatives =
    process.env.INGEST_REPAIR_DERIVATIVES === 'true' ||
    process.env.INGEST_REPAIR_DERIVATIVES === '1';
  const forceRegenerateDerivatives =
    process.env.INGEST_FORCE_REGENERATE_DERIVATIVES === 'true' ||
    process.env.INGEST_FORCE_REGENERATE_DERIVATIVES === '1';

  const result = await ingestDirectory({
    sourceDir,
    limit,
    repairDerivatives,
    forceRegenerateDerivatives,
  });

  console.warn(
    JSON.stringify(
      {
        sourceDir,
        processed: result.processed,
        ingested: result.ingested,
        alreadyPresent: result.alreadyPresent,
        derivativesRepaired: result.derivativesRepaired,
        rejected: result.rejected,
        integrityConflicts: result.integrityConflicts,
        failed: result.failed,
        durationMs: Math.round(result.durationMs),
        errors: result.errors.slice(0, 20),
      },
      null,
      2,
    ),
  );

  if (result.integrityConflicts > 0 || result.failed > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
