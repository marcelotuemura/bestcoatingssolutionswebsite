#!/usr/bin/env node
/**
 * Migrate local catalog / vault / AI overlay → Supabase Postgres + private storage.
 *
 * Dry-run by default:
 *   pnpm media:migrate:supabase
 *   pnpm media:migrate:supabase --dry-run
 *   pnpm media:migrate:supabase --execute --confirm-destination <project-ref>
 *   pnpm media:migrate:supabase --execute --allow-fixtures --confirm-destination <ref>
 *
 * Never deletes local vault originals.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  mediaCatalogSchema,
  projectsReportSchema,
  duplicatesReportSchema,
} from '../lib/media-library/catalog-schema';
import { aiAnalysisStoreSchema } from '../lib/media-intelligence/vision/schema';
import {
  buildMigrationPlan,
  mapAssetToDbRow,
  mapDuplicateGroupToDbRow,
  mapProjectToDbRow,
  resolveLocalCatalogPaths,
  sha256File,
} from '../lib/media-intelligence/migration/mapping';
import { validateSupabaseConfig } from '../lib/media-intelligence/supabase/config';
import { createSupabaseServiceClient } from '../lib/media-intelligence/supabase/client';
import { recordAuditEvent } from '../lib/media-intelligence/audit/audit';
import { bucketForKind } from '../lib/media-intelligence/storage/object-keys';
import { getVaultLayout, resolveVaultRoot } from '../lib/media-vault/layout';

function parseArgs(argv: string[]) {
  const flags = new Set(argv);
  const get = (name: string) => {
    const idx = argv.indexOf(name);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };
  const execute = flags.has('--execute');
  const dryRun = !execute || flags.has('--dry-run');
  return {
    dryRun,
    execute,
    allowFixtures: flags.has('--allow-fixtures'),
    confirmDestination: get('--confirm-destination'),
    confirmProduction: flags.has('--confirm-production'),
    concurrency: Number(get('--concurrency') ?? 4),
    catalogDir:
      get('--catalog-dir') ??
      process.env.MEDIA_CATALOG_DIR?.trim() ??
      path.join(process.cwd(), 'data', 'media-catalog'),
    vaultRoot: get('--vault-root') ?? resolveVaultRoot(),
  };
}

async function readJson(filePath: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as unknown;
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const validated = validateSupabaseConfig({
    requireServiceRole: !args.dryRun,
  });
  if (!validated.ok) {
    console.error(`Config error: ${validated.reason}`);
    process.exit(1);
  }

  const config = validated.config;
  console.warn('══════════════════════════════════════════════');
  console.warn(' BCS Media → Supabase migration');
  console.warn(` Destination project: ${config.projectRef}`);
  console.warn(` Destination URL:     ${config.url}`);
  console.warn(` Production target:   ${config.isProductionTarget}`);
  console.warn(` Mode:                ${args.dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.warn('══════════════════════════════════════════════');

  const paths = resolveLocalCatalogPaths(args.catalogDir);
  const catalogRaw = await readJson(paths.catalog);
  const projectsRaw = await readJson(paths.projects);
  const duplicatesRaw = await readJson(paths.duplicates);
  const aiRaw = await readJson(paths.aiAnalysis);

  if (!catalogRaw) {
    console.error(`Missing catalog at ${paths.catalog}`);
    process.exit(1);
  }

  const catalog = mediaCatalogSchema.parse(catalogRaw);
  const projects = projectsRaw
    ? projectsReportSchema.parse(projectsRaw)
    : { projects: [], generatedAt: new Date().toISOString(), version: '1.0' };
  const duplicates = duplicatesRaw
    ? duplicatesReportSchema.parse(duplicatesRaw)
    : { groups: [], generatedAt: new Date().toISOString(), version: '1.0' };
  const aiStore = aiRaw
    ? aiAnalysisStoreSchema.parse(aiRaw)
    : { analyses: [], generatedAt: new Date().toISOString(), version: '1.0.0' };

  const plan = buildMigrationPlan({
    assets: catalog.assets,
    projects: projects.projects,
    duplicates: duplicates.groups,
    analyses: aiStore.analyses,
    destinationProjectRef: config.projectRef,
    isProductionTarget: config.isProductionTarget,
    isFixtureCatalog: Boolean(catalog.isFixture),
    dryRun: args.dryRun,
    allowFixtures: args.allowFixtures,
  });

  console.warn(
    JSON.stringify({ counts: plan.counts, warnings: plan.warnings }, null, 2),
  );

  if (plan.isFixtureCatalog && !args.allowFixtures) {
    console.error(
      'Aborted: fixture catalogs require --allow-fixtures (non-production).',
    );
    process.exit(2);
  }
  if (plan.isFixtureCatalog && plan.isProductionTarget) {
    console.error('Aborted: fixture catalogs cannot migrate to production.');
    process.exit(2);
  }
  if (!args.dryRun) {
    if (args.confirmDestination !== config.projectRef) {
      console.error(
        `Aborted: pass --confirm-destination ${config.projectRef} to execute.`,
      );
      process.exit(2);
    }
    if (config.isProductionTarget && !args.confirmProduction) {
      console.error(
        'Aborted: production target requires --confirm-production.',
      );
      process.exit(2);
    }
  }

  if (args.dryRun) {
    console.warn(
      'Dry run complete — no writes performed. Local vault untouched.',
    );
    await recordAuditEvent({
      action: 'migration_started',
      success: true,
      metadata: {
        dryRun: true,
        projectRef: config.projectRef,
        counts: plan.counts,
      },
    });
    return;
  }

  await recordAuditEvent({
    action: 'migration_started',
    success: true,
    metadata: {
      dryRun: false,
      projectRef: config.projectRef,
      counts: plan.counts,
    },
  });

  const client = createSupabaseServiceClient(config);
  const layout = getVaultLayout(args.vaultRoot);
  const errors: string[] = [];

  // Upsert metadata (idempotent on external_id)
  for (const asset of catalog.assets) {
    const row = mapAssetToDbRow(asset);
    const { error } = await client
      .from('media_assets')
      .upsert(row, { onConflict: 'external_id' });
    if (error) errors.push(`asset ${asset.id}: ${error.message}`);
  }
  for (const project of projects.projects) {
    const { error } = await client
      .from('media_projects')
      .upsert(mapProjectToDbRow(project), { onConflict: 'external_id' });
    if (error) errors.push(`project ${project.id}: ${error.message}`);
  }
  for (const group of duplicates.groups) {
    const { data, error } = await client
      .from('media_duplicate_groups')
      .upsert(mapDuplicateGroupToDbRow(group), { onConflict: 'external_id' })
      .select('id')
      .single();
    if (error) {
      errors.push(`dup ${group.id}: ${error.message}`);
      continue;
    }
    for (const member of group.members) {
      await client.from('media_duplicate_members').upsert(
        {
          group_id: data.id,
          asset_external_id: member.assetId,
          filename: member.filename ?? null,
          role: member.role,
        },
        { onConflict: 'group_id,asset_external_id' },
      );
    }
  }

  // Upload originals / derivatives when present locally (checksum verify)
  let uploaded = 0;
  for (const asset of catalog.assets) {
    const checksum = asset.sha256 ?? asset.checksum;
    const relative = asset.originalRelativePath;
    if (!checksum || !relative) continue;
    const absolute = path.join(layout.root, relative);
    try {
      const actual = await sha256File(absolute);
      if (actual !== checksum) {
        errors.push(`checksum mismatch ${asset.id}`);
        await recordAuditEvent({
          action: 'integrity_conflict',
          resourceId: asset.id,
          success: false,
        });
        continue;
      }
      const objectKey = mapAssetToDbRow(asset).storage_object_key!;
      const bytes = await fs.readFile(absolute);
      const { error } = await client.storage
        .from(bucketForKind('original'))
        .upload(objectKey, bytes, {
          contentType: asset.fileType,
          upsert: false,
        });
      if (error && !/already exists|Duplicate/i.test(error.message)) {
        errors.push(`upload ${asset.id}: ${error.message}`);
      } else {
        uploaded += 1;
        // verify remote checksum by re-download hash when possible is expensive;
        // we verified local pre-upload.
      }
    } catch (error) {
      // Missing local binary is OK — metadata-only migrate.
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        errors.push(
          `original ${asset.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  // AI analyses via repository-shaped upsert (history-preserving)
  for (const analysis of aiStore.analyses) {
    const { data: assetRow } = await client
      .from('media_assets')
      .select('id')
      .eq('external_id', analysis.assetId)
      .maybeSingle();
    if (!assetRow) continue;
    await client
      .from('media_ai_analyses')
      .update({ is_current: false })
      .eq('asset_id', assetRow.id)
      .eq('is_current', true);
    await client.from('media_ai_analyses').insert({
      asset_id: assetRow.id,
      analysis_version: analysis.analysisVersion,
      analyzed_at: analysis.analyzedAt,
      provider: analysis.provider,
      provider_model: analysis.providerModel,
      confidence: analysis.confidence,
      stage: analysis.stage.stage,
      stage_confidence: analysis.stage.confidence,
      quality: analysis.quality,
      boat: analysis.boat,
      keywords: analysis.keywords,
      tags: analysis.tags,
      notes: analysis.notes,
      is_current: true,
    });
  }

  console.warn(
    JSON.stringify(
      {
        uploadedOriginals: uploaded,
        errors: errors.slice(0, 50),
        errorCount: errors.length,
      },
      null,
      2,
    ),
  );

  await recordAuditEvent({
    action: errors.length ? 'migration_failed' : 'migration_completed',
    success: errors.length === 0,
    metadata: {
      projectRef: config.projectRef,
      uploaded,
      errorCount: errors.length,
    },
  });

  console.warn(
    'Local vault originals were NOT deleted (cold backup retained).',
  );
  if (errors.length) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  await recordAuditEvent({
    action: 'migration_failed',
    success: false,
    metadata: { reason: error instanceof Error ? error.message : 'unknown' },
  });
  process.exit(1);
});
