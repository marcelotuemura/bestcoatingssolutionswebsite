#!/usr/bin/env node
/**
 * Writes fixture 08_Reports-compatible JSON into data/media-catalog/
 * for local development and CI when real reports are not synced.
 *
 * Usage: node --import tsx scripts/generate-media-catalog-fixtures.mjs
 * Or via: pnpm exec tsx scripts/generate-media-catalog-fixtures.ts
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateFixtureCatalog } from '../lib/media-library/fixture-catalog';

async function main() {
  const count = Number(process.env.FIXTURE_ASSET_COUNT ?? 240);
  const outDir = path.join(process.cwd(), 'data', 'media-catalog');
  const bundle = generateFixtureCatalog(count);

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, 'media_catalog.json'),
    JSON.stringify(bundle.catalog, null, 2),
  );
  await fs.writeFile(
    path.join(outDir, 'projects_report.json'),
    JSON.stringify(bundle.projects, null, 2),
  );
  await fs.writeFile(
    path.join(outDir, 'duplicates_report.json'),
    JSON.stringify(bundle.duplicates, null, 2),
  );
  await fs.writeFile(
    path.join(outDir, 'search_index.json'),
    JSON.stringify(bundle.searchIndex, null, 2),
  );
  await fs.writeFile(
    path.join(outDir, 'MEDIA_INDEX_SUMMARY.md'),
    [
      '# Media Index Summary (Fixture)',
      '',
      `Generated: ${bundle.catalog.generatedAt}`,
      `Assets: ${bundle.catalog.assets.length}`,
      `Projects: ${bundle.projects.projects.length}`,
      `Duplicate groups: ${bundle.duplicates.groups.length}`,
      '',
      'This is a **fixture** catalog for the Interactive Media Library.',
      'Replace these files with real `08_Reports` output to use production index data.',
      '',
      'Hard rules: read-only · never modify originals · never auto-delete · never publish.',
      '',
    ].join('\n'),
  );

  console.warn(
    `Wrote fixture catalog (${bundle.catalog.assets.length} assets) to ${outDir}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
