/**
 * Live non-production Supabase Phase 7 corpus integration suite.
 *
 *   pnpm test:supabase:phase7
 *
 * Requires:
 *   MEDIA_SUPABASE_PHASE7_LIVE=1 (or MEDIA_SUPABASE_PHASE5_LIVE=1)
 *   MEDIA_SUPABASE_ENV=development|staging (not production)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * When live validation is explicitly requested and credentials are absent,
 * the suite fails (does not silently pass).
 *
 * RPC existence is proven only by parameterized calls (no zero-arg probes).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  isSupabaseProductionTarget,
  validateSupabaseConfig,
} from '@/lib/media-intelligence/supabase/config';
import {
  PHASE7_CORPUS_RPC_CATALOG,
  type Phase7CorpusRpc,
} from '@/lib/media-intelligence/corpora/rpc-catalog';

type ReportRow = {
  readonly name: string;
  readonly ok: boolean;
  readonly detail?: string;
};

type RpcError = { readonly message?: string; readonly code?: string } | null;

const results: ReportRow[] = [];
const resolvedRpcs = new Set<Phase7CorpusRpc>();

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  console.warn(
    `[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`,
  );
}

function isFunctionResolutionFailure(error: RpcError): boolean {
  if (!error?.message && !error?.code) return false;
  const message = error.message ?? '';
  const code = error.code ?? '';
  return (
    code === 'PGRST202' ||
    /could not find the function/i.test(message) ||
    /function .* does not exist/i.test(message) ||
    /Could not choose the best candidate function/i.test(message)
  );
}

function recordRpc(
  name: string,
  rpc: Phase7CorpusRpc,
  error: RpcError,
  mode: 'success' | 'expected_error',
) {
  if (isFunctionResolutionFailure(error)) {
    record(
      name,
      false,
      `RPC resolution failure for ${rpc}: ${error?.message ?? error?.code}`,
    );
    return;
  }
  resolvedRpcs.add(rpc);
  if (mode === 'success') {
    record(name, !error, error?.message);
    return;
  }
  record(
    name,
    Boolean(error),
    error?.message ?? 'expected authorization/validation error missing',
  );
}

function requireLiveEnv() {
  const liveRequested =
    process.env.MEDIA_SUPABASE_PHASE7_LIVE === '1' ||
    process.env.MEDIA_SUPABASE_PHASE5_LIVE === '1';
  if (!liveRequested) {
    throw new Error(
      'SKIP: Set MEDIA_SUPABASE_PHASE7_LIVE=1 (or PHASE5_LIVE=1) to run hosted Phase 7 tests.',
    );
  }
  const env = (process.env.MEDIA_SUPABASE_ENV ?? '').toLowerCase();
  if (env === 'production' || env === 'prod') {
    throw new Error('REFUSED: MEDIA_SUPABASE_ENV=production is not allowed.');
  }
  if (env !== 'development' && env !== 'staging' && env !== 'dev') {
    throw new Error(
      'REFUSED: MEDIA_SUPABASE_ENV must be development|staging for live tests.',
    );
  }
  const validated = validateSupabaseConfig({ requireServiceRole: true });
  if (!validated.ok) {
    throw new Error(
      `FAIL: Live Phase 7 validation requested but credentials invalid: ${validated.reason}`,
    );
  }
  if (
    validated.config.isProductionTarget ||
    isSupabaseProductionTarget(validated.config.url)
  ) {
    throw new Error('REFUSED: production Supabase project target.');
  }
  const prodRef = process.env.MEDIA_SUPABASE_PRODUCTION_REF?.trim();
  if (prodRef && validated.config.projectRef === prodRef) {
    throw new Error(
      'REFUSED: project ref matches MEDIA_SUPABASE_PRODUCTION_REF.',
    );
  }
  return {
    url: validated.config.url,
    anonKey: validated.config.anonKey,
    serviceKey: validated.config.serviceRoleKey!,
    projectRef: validated.config.projectRef,
  };
}

async function seedUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  role: string,
): Promise<string> {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error && !/already/i.test(error.message)) throw error;
  let userId = created.user?.id;
  if (!userId) {
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
    userId = list.users.find((u) => u.email === email)?.id;
  }
  if (!userId) throw new Error(`Failed to seed user ${email}`);
  await admin.from('media_users').upsert({
    id: userId,
    email,
    display_name: role,
    is_active: true,
  });
  await admin.from('media_user_roles').upsert(
    {
      user_id: userId,
      role,
      assigned_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: 'user_id,role' },
  );
  return userId;
}

async function clientAs(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

async function writeReport(projectRef: string, claimed: boolean) {
  const failed = results.filter((r) => !r.ok).length;
  const passed = results.filter((r) => r.ok).length;
  const report = {
    kind: 'hosted_phase7_corpora',
    projectRef,
    generatedAt: new Date().toISOString(),
    liveIntegrationClaimed: claimed && failed === 0,
    passed,
    failed,
    rpcCoverage: [...PHASE7_CORPUS_RPC_CATALOG].map((rpc) => ({
      rpc,
      resolved: resolvedRpcs.has(rpc),
    })),
    results,
  };
  const out = path.join(
    process.cwd(),
    'docs',
    'MEDIA_SUPABASE_PHASE7_LIVE_REPORT.json',
  );
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, `${JSON.stringify(report, null, 2)}\n`);
  console.warn(
    JSON.stringify(
      {
        passed,
        failed,
        liveIntegrationClaimed: report.liveIntegrationClaimed,
        rpcResolved: resolvedRpcs.size,
        rpcRequired: PHASE7_CORPUS_RPC_CATALOG.length,
      },
      null,
      2,
    ),
  );
  return failed;
}

async function main() {
  let cfg: ReturnType<typeof requireLiveEnv>;
  try {
    cfg = requireLiveEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('SKIP:')) {
      const skipReport = {
        status: 'skipped',
        reason: message,
        liveIntegrationClaimed: false,
        generatedAt: new Date().toISOString(),
      };
      console.warn(message);
      await fs.mkdir(path.join(process.cwd(), 'docs'), { recursive: true });
      await fs.writeFile(
        path.join(
          process.cwd(),
          'docs',
          'MEDIA_SUPABASE_PHASE7_LIVE_REPORT.json',
        ),
        `${JSON.stringify(skipReport, null, 2)}\n`,
      );
      process.exit(0);
    }
    console.error(message);
    const failReport = {
      status: 'failed',
      reason: message,
      liveIntegrationClaimed: false,
      generatedAt: new Date().toISOString(),
    };
    await fs.mkdir(path.join(process.cwd(), 'docs'), { recursive: true });
    await fs.writeFile(
      path.join(
        process.cwd(),
        'docs',
        'MEDIA_SUPABASE_PHASE7_LIVE_REPORT.json',
      ),
      `${JSON.stringify(failReport, null, 2)}\n`,
    );
    process.exit(2);
  }

  console.warn(`Live Phase 7 tests → project ${cfg.projectRef}`);
  const admin = createClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const table of [
    'media_corpora',
    'media_corpus_versions',
    'media_corpus_items',
    'media_corpus_item_labels',
    'media_corpus_reviews',
    'media_corpus_events',
    'media_corpus_exports',
    'media_workspace_members',
  ]) {
    const { error } = await admin.from(table).select('*').limit(1);
    record(`schema_${table}`, !error, error?.message);
  }

  const suffix = randomBytes(3).toString('hex');
  const password = `Test-${randomBytes(8).toString('hex')}!aA1`;
  const emails = {
    owner: `p7.owner.${suffix}@example.test`,
    admin: `p7.admin.${suffix}@example.test`,
    editor: `p7.editor.${suffix}@example.test`,
    reviewer: `p7.reviewer.${suffix}@example.test`,
    viewer: `p7.viewer.${suffix}@example.test`,
  };

  try {
    await seedUser(admin, emails.owner, password, 'owner');
    await seedUser(admin, emails.admin, password, 'administrator');
    await seedUser(admin, emails.editor, password, 'editor');
    await seedUser(admin, emails.reviewer, password, 'reviewer');
    await seedUser(admin, emails.viewer, password, 'viewer');
    record('seed_roles', true);
  } catch (error) {
    record(
      'seed_roles',
      false,
      error instanceof Error ? error.message : String(error),
    );
    process.exit((await writeReport(cfg.projectRef, false)) > 0 ? 1 : 0);
  }

  const assetClear = `p7_asset_clear_${suffix}`;
  const assetBlocked = `p7_asset_blocked_${suffix}`;
  await admin.from('media_assets').upsert({
    external_id: assetClear,
    filename: 'c.jpg',
    original_filename: 'c.jpg',
    file_type: 'image/jpeg',
    media_kind: 'image',
    checksum: createHash('sha256').update(assetClear).digest('hex'),
    privacy_status: 'clear',
    source_system: 'manual',
    revision: 1,
  });
  await admin.from('media_assets').upsert({
    external_id: assetBlocked,
    filename: 'b.jpg',
    original_filename: 'b.jpg',
    file_type: 'image/jpeg',
    media_kind: 'image',
    checksum: createHash('sha256').update(assetBlocked).digest('hex'),
    privacy_status: 'blocked',
    source_system: 'manual',
    revision: 1,
  });

  const anon = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false },
  });
  {
    const { data, error } = await anon
      .from('media_corpora')
      .select('id')
      .limit(5);
    record(
      'anon_cannot_read_corpora',
      !error && (data?.length ?? 0) === 0,
      error?.message ?? `rows=${data?.length ?? 0}`,
    );
  }

  const viewer = await clientAs(cfg.url, cfg.anonKey, emails.viewer, password);
  const editor = await clientAs(cfg.url, cfg.anonKey, emails.editor, password);
  const reviewer = await clientAs(
    cfg.url,
    cfg.anonKey,
    emails.reviewer,
    password,
  );
  const adminUser = await clientAs(
    cfg.url,
    cfg.anonKey,
    emails.admin,
    password,
  );
  const owner = await clientAs(cfg.url, cfg.anonKey, emails.owner, password);

  {
    const { error } = await viewer.rpc('media_create_corpus', {
      p_workspace_id: 'bcs-default',
      p_name: 'viewer-denied',
      p_description: '',
      p_intended_use: 'general_evaluation',
    });
    recordRpc(
      'viewer_cannot_create',
      'media_create_corpus',
      error,
      'expected_error',
    );
  }

  let corpusId = '';
  let versionId = '';
  let itemId = '';

  {
    const { data, error } = await editor.rpc('media_create_corpus', {
      p_workspace_id: 'bcs-default',
      p_name: `Phase7 ${suffix}`,
      p_description: 'hosted suite',
      p_intended_use: 'general_evaluation',
    });
    recordRpc('editor_create_corpus', 'media_create_corpus', error, 'success');
    corpusId = (data as { id?: string } | null)?.id ?? '';
    if (corpusId) {
      const { data: versions } = await editor
        .from('media_corpus_versions')
        .select('id')
        .eq('corpus_id', corpusId)
        .order('version_number', { ascending: true })
        .limit(1);
      versionId = versions?.[0]?.id ?? '';
    }
  }

  {
    const { error } = await editor.rpc('media_corpus_ensure_own_membership', {
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'editor_ensure_membership',
      'media_corpus_ensure_own_membership',
      error,
      'success',
    );
  }

  {
    const { data, error } = await editor.rpc('media_add_corpus_item', {
      p_version_id: versionId,
      p_asset_external_id: assetClear,
      p_analysis_external_id: null,
    });
    recordRpc('editor_add_item', 'media_add_corpus_item', error, 'success');
    itemId = (data as { id?: string } | null)?.id ?? '';
  }

  {
    const { error } = await editor.rpc('media_add_corpus_item', {
      p_version_id: versionId,
      p_asset_external_id: assetBlocked,
      p_analysis_external_id: null,
    });
    recordRpc(
      'privacy_blocked_cannot_add',
      'media_add_corpus_item',
      error,
      'expected_error',
    );
  }

  {
    const { data, error } = await editor.rpc('media_suggest_corpus_label', {
      p_item_id: itemId,
      p_label_key: 'damage_type',
      p_label_value: 'oxidation',
      p_confidence: 0.8,
    });
    recordRpc(
      'editor_ai_suggest_label',
      'media_suggest_corpus_label',
      error,
      'success',
    );
    const source = (data as { source?: string } | null)?.source;
    record('ai_label_not_human_confirmed', source === 'ai_suggested', source);
  }

  {
    const { error } = await editor.rpc('media_submit_corpus_version', {
      p_version_id: versionId,
    });
    recordRpc(
      'editor_cannot_submit',
      'media_submit_corpus_version',
      error,
      'expected_error',
    );
  }

  {
    const { error } = await editor.rpc('media_release_corpus_version', {
      p_version_id: versionId,
    });
    recordRpc(
      'editor_cannot_release',
      'media_release_corpus_version',
      error,
      'expected_error',
    );
  }

  {
    const { error } = await reviewer.rpc('media_corpus_ensure_own_membership', {
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'reviewer_ensure_membership',
      'media_corpus_ensure_own_membership',
      error,
      'success',
    );
  }

  {
    const { error } = await reviewer.rpc('media_confirm_corpus_label', {
      p_item_id: itemId,
      p_label_key: 'damage_type',
      p_label_value: 'oxidation',
    });
    recordRpc(
      'reviewer_confirm_label',
      'media_confirm_corpus_label',
      error,
      'success',
    );
  }

  {
    const { error } = await reviewer.rpc('media_review_corpus_item', {
      p_item_id: itemId,
      p_decision: 'include',
      p_notes: 'ok',
      p_inclusion_reason: 'reviewed',
      p_exclusion_reason: null,
    });
    recordRpc(
      'reviewer_include_item',
      'media_review_corpus_item',
      error,
      'success',
    );
  }

  {
    const { error } = await reviewer.rpc('media_assign_corpus_split', {
      p_item_id: itemId,
      p_split: 'train',
    });
    recordRpc(
      'reviewer_assign_split',
      'media_assign_corpus_split',
      error,
      'success',
    );
  }

  {
    const { error } = await reviewer.rpc('media_release_corpus_version', {
      p_version_id: versionId,
    });
    recordRpc(
      'reviewer_cannot_release',
      'media_release_corpus_version',
      error,
      'expected_error',
    );
  }

  {
    const { error } = await adminUser.rpc(
      'media_corpus_ensure_own_membership',
      {
        p_workspace_id: 'bcs-default',
      },
    );
    recordRpc(
      'admin_ensure_membership',
      'media_corpus_ensure_own_membership',
      error,
      'success',
    );
  }

  {
    const { error } = await adminUser.rpc('media_submit_corpus_version', {
      p_version_id: versionId,
    });
    recordRpc(
      'admin_submit_version',
      'media_submit_corpus_version',
      error,
      'success',
    );
  }

  {
    const { error } = await adminUser.rpc('media_approve_corpus_version', {
      p_version_id: versionId,
    });
    recordRpc(
      'admin_approve_version',
      'media_approve_corpus_version',
      error,
      'success',
    );
  }

  {
    const { error } = await adminUser.rpc('media_release_corpus_version', {
      p_version_id: versionId,
    });
    recordRpc(
      'admin_cannot_release',
      'media_release_corpus_version',
      error,
      'expected_error',
    );
  }

  {
    const { error } = await owner.rpc('media_corpus_ensure_own_membership', {
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'owner_ensure_membership',
      'media_corpus_ensure_own_membership',
      error,
      'success',
    );
  }

  {
    const { data, error } = await owner.rpc('media_corpus_build_manifest', {
      p_version_id: versionId,
    });
    recordRpc(
      'owner_build_manifest',
      'media_corpus_build_manifest',
      error,
      'success',
    );
    const text = JSON.stringify(data ?? {});
    record(
      'manifest_no_secrets',
      !/(X-Amz-Signature|signedUrl|service_role|eyJhbGci)/i.test(text),
      text.slice(0, 120),
    );
    const c1 = (data as { manifestChecksum?: string } | null)?.manifestChecksum;
    const { data: data2 } = await owner.rpc('media_corpus_build_manifest', {
      p_version_id: versionId,
    });
    const c2 = (data2 as { manifestChecksum?: string } | null)
      ?.manifestChecksum;
    record(
      'manifest_checksum_deterministic',
      Boolean(c1) && c1 === c2,
      `${c1} vs ${c2}`,
    );
    resolvedRpcs.add('media_corpus_build_manifest');
  }

  {
    const { data, error } = await owner.rpc('media_corpus_version_readiness', {
      p_version_id: versionId,
    });
    recordRpc(
      'owner_readiness',
      'media_corpus_version_readiness',
      error,
      'success',
    );
    record(
      'readiness_ready',
      Boolean((data as { ready?: boolean } | null)?.ready),
      JSON.stringify(data),
    );
  }

  {
    const { error } = await owner.rpc('media_release_corpus_version', {
      p_version_id: versionId,
    });
    recordRpc(
      'owner_release_version',
      'media_release_corpus_version',
      error,
      'success',
    );
  }

  {
    const { error } = await editor.rpc('media_add_corpus_item', {
      p_version_id: versionId,
      p_asset_external_id: assetClear,
      p_analysis_external_id: null,
    });
    recordRpc(
      'released_version_immutable_add',
      'media_add_corpus_item',
      error,
      'expected_error',
    );
  }

  {
    const { data, error } = await editor.rpc('media_create_corpus_version', {
      p_corpus_id: corpusId,
      p_notes: 'post-release',
    });
    recordRpc(
      'new_version_after_release',
      'media_create_corpus_version',
      error,
      'success',
    );
    const newVersionId = (data as { id?: string } | null)?.id ?? '';
    if (newVersionId) {
      const { error: cancelError } = await owner.rpc(
        'media_cancel_corpus_version',
        { p_version_id: newVersionId },
      );
      recordRpc(
        'owner_cancel_version',
        'media_cancel_corpus_version',
        cancelError,
        'success',
      );
    }
  }

  {
    const { error } = await owner.rpc('media_generate_corpus_export', {
      p_version_id: versionId,
    });
    recordRpc(
      'owner_generate_export',
      'media_generate_corpus_export',
      error,
      'success',
    );
  }

  {
    const { data, error } = await owner
      .from('media_corpus_events')
      .select('id,actor_id,action,created_at')
      .eq('corpus_id', corpusId)
      .limit(20);
    record(
      'audit_events_present',
      !error && (data?.length ?? 0) > 0,
      error?.message ?? `count=${data?.length ?? 0}`,
    );
  }

  {
    const { error } = await editor.rpc('media_corpus_asset_eligibility', {
      p_workspace_id: 'bcs-default',
      p_asset_external_id: assetBlocked,
    });
    recordRpc(
      'eligibility_rpc',
      'media_corpus_asset_eligibility',
      error,
      'success',
    );
  }

  {
    const { error } = await owner.rpc('media_archive_corpus', {
      p_corpus_id: corpusId,
    });
    recordRpc('owner_archive_corpus', 'media_archive_corpus', error, 'success');
  }

  // Cover remove RPC with a fresh building version on a new corpus
  {
    const { data: c } = await editor.rpc('media_create_corpus', {
      p_workspace_id: 'bcs-default',
      p_name: `Phase7 remove ${suffix}`,
      p_description: '',
      p_intended_use: 'other',
    });
    const cid = (c as { id?: string } | null)?.id;
    const { data: versions } = await editor
      .from('media_corpus_versions')
      .select('id')
      .eq('corpus_id', cid!)
      .limit(1);
    const vid = versions?.[0]?.id;
    const { data: item } = await editor.rpc('media_add_corpus_item', {
      p_version_id: vid,
      p_asset_external_id: assetClear,
      p_analysis_external_id: null,
    });
    const iid = (item as { id?: string } | null)?.id;
    const { error } = await editor.rpc('media_remove_corpus_item', {
      p_item_id: iid,
    });
    recordRpc(
      'editor_remove_item',
      'media_remove_corpus_item',
      error,
      'success',
    );
  }

  const missing = PHASE7_CORPUS_RPC_CATALOG.filter(
    (rpc) => !resolvedRpcs.has(rpc),
  );
  record(
    'rpc_catalog_fully_resolved',
    missing.length === 0,
    missing.length ? missing.join(',') : 'all resolved',
  );

  const failed = await writeReport(cfg.projectRef, true);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await fs.mkdir(path.join(process.cwd(), 'docs'), { recursive: true });
  await fs.writeFile(
    path.join(process.cwd(), 'docs', 'MEDIA_SUPABASE_PHASE7_LIVE_REPORT.json'),
    `${JSON.stringify(
      {
        status: 'failed',
        reason: error instanceof Error ? error.message : String(error),
        liveIntegrationClaimed: false,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  process.exit(1);
});
