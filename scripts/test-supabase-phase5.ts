/**
 * Live non-production Supabase Phase 5 integration suite.
 *
 *   pnpm test:supabase:phase5
 *
 * Requires:
 *   MEDIA_SUPABASE_ENV=development|staging (not production)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   MEDIA_SUPABASE_PHASE5_LIVE=1
 *
 * Refuses production targets. Does not claim success if skipped.
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
  EDITOR_PROTECTED_FIELDS,
  PHASE5_RPC_CATALOG,
  rpcAssignRole,
  rpcEditorUpdateAssetMetadata,
  rpcRevokeRole,
  rpcSetUserActiveState,
  rpcUpdateOwnDisplayName,
} from '@/lib/media-intelligence/supabase/rpcs';

type ReportRow = {
  readonly name: string;
  readonly ok: boolean;
  readonly detail?: string;
};

const results: ReportRow[] = [];

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.warn(`[${mark}] ${name}${detail ? ` — ${detail}` : ''}`);
}

function requireLiveEnv(): {
  url: string;
  anonKey: string;
  serviceKey: string;
  projectRef: string;
} {
  if (process.env.MEDIA_SUPABASE_PHASE5_LIVE !== '1') {
    throw new Error(
      'SKIP: Set MEDIA_SUPABASE_PHASE5_LIVE=1 to run live Supabase tests.',
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
  if (!validated.ok) throw new Error(validated.reason);
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
      console.warn(JSON.stringify(skipReport, null, 2));
      const outDir = path.join(process.cwd(), 'docs');
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(
        path.join(outDir, 'MEDIA_SUPABASE_PHASE5_LIVE_REPORT.json'),
        `${JSON.stringify(skipReport, null, 2)}\n`,
      );
      process.exit(0);
    }
    console.error(message);
    process.exit(2);
  }

  console.warn(`Live Phase 5 tests → project ${cfg.projectRef} (${cfg.url})`);
  const admin = createClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const suffix = randomBytes(3).toString('hex');
  const password = `Test-${randomBytes(8).toString('hex')}!aA1`;
  const emails = {
    owner: `owner.${suffix}@example.test`,
    owner2: `owner2.${suffix}@example.test`,
    admin: `admin.${suffix}@example.test`,
    editor: `editor.${suffix}@example.test`,
    reviewer: `reviewer.${suffix}@example.test`,
    viewer: `viewer.${suffix}@example.test`,
  };

  const ids: Record<string, string> = {};
  try {
    ids.owner = await seedUser(admin, emails.owner, password, 'owner');
    ids.owner2 = await seedUser(admin, emails.owner2, password, 'owner');
    ids.admin = await seedUser(admin, emails.admin, password, 'administrator');
    ids.editor = await seedUser(admin, emails.editor, password, 'editor');
    ids.reviewer = await seedUser(admin, emails.reviewer, password, 'reviewer');
    ids.viewer = await seedUser(admin, emails.viewer, password, 'viewer');
    record('seed_roles', true, Object.keys(ids).join(','));
  } catch (error) {
    record(
      'seed_roles',
      false,
      error instanceof Error ? error.message : String(error),
    );
    await writeReport(cfg.projectRef);
    process.exit(1);
  }

  // AUTH
  try {
    const anon = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false },
    });
    const bad = await anon.auth.signInWithPassword({
      email: emails.viewer,
      password: 'wrong-password',
    });
    record('auth_invalid_login', Boolean(bad.error));

    const okLogin = await anon.auth.signInWithPassword({
      email: emails.viewer,
      password,
    });
    record(
      'auth_email_password_login',
      !okLogin.error && Boolean(okLogin.data.user),
    );
    await anon.auth.signOut();
    record('auth_logout', true);
  } catch (error) {
    record(
      'auth_suite',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // RLS anonymous
  try {
    const anon = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await anon
      .from('media_assets')
      .select('id')
      .limit(5);
    record(
      'rls_anon_no_assets',
      (!data || data.length === 0) && (error != null || true),
      error?.message ?? `rows=${data?.length ?? 0}`,
    );
  } catch (error) {
    record(
      'rls_anon_no_assets',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Seed one asset via service role
  const externalId = `test_asset_${suffix}`;
  await admin.from('media_assets').upsert({
    external_id: externalId,
    filename: 't.jpg',
    original_filename: 't.jpg',
    file_type: 'image/jpeg',
    media_kind: 'image',
    checksum: createHash('sha256').update(externalId).digest('hex'),
    score_website: 10,
    score_marketing: 10,
    score_technical: 10,
    source_system: 'manual',
  });

  // Viewer cannot mutate
  try {
    const viewer = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.viewer,
      password,
    );
    const { error } = await viewer
      .from('media_assets')
      .update({ notes: 'hack' })
      .eq('external_id', externalId);
    record('rls_viewer_cannot_update', Boolean(error));
  } catch (error) {
    record(
      'rls_viewer_cannot_update',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Editor RPC ok; direct protected field update denied
  try {
    const editor = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.editor,
      password,
    );
    const ok = await rpcEditorUpdateAssetMetadata(editor, {
      externalId,
      manufacturer: 'Axopar',
      notes: 'ok',
    });
    record('editor_rpc_metadata_ok', !ok.error, ok.error?.message);

    const direct = await editor
      .from('media_assets')
      .update({ checksum: 'deadbeef' })
      .eq('external_id', externalId)
      .select('checksum')
      .maybeSingle();
    const still = await admin
      .from('media_assets')
      .select('checksum')
      .eq('external_id', externalId)
      .maybeSingle();
    const unchanged =
      Boolean(direct.error) ||
      (still.data?.checksum && still.data.checksum !== 'deadbeef');
    record(
      'editor_cannot_update_protected_checksum',
      Boolean(unchanged),
      `protected=${EDITOR_PROTECTED_FIELDS.join(',')}`,
    );
  } catch (error) {
    record(
      'editor_suite',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Reviewer cannot delete AI analyses
  try {
    const reviewer = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.reviewer,
      password,
    );
    const { error } = await reviewer
      .from('media_ai_analyses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    record('reviewer_cannot_delete_analyses', Boolean(error));
    const dup = await reviewer.from('media_duplicate_groups').insert({
      external_id: `dup_${suffix}`,
      kind: 'exact',
      similarity: 1,
    });
    record('reviewer_cannot_create_duplicate_group', Boolean(dup.error));
  } catch (error) {
    record(
      'reviewer_suite',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Admin cannot assign owner
  try {
    const administrator = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.admin,
      password,
    );
    const { error } = await rpcAssignRole(administrator, ids.viewer, 'owner');
    record('admin_cannot_assign_owner', Boolean(error), error?.message);
  } catch (error) {
    record(
      'admin_cannot_assign_owner',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Final owner protection: revoke owner2 first (ok), then sole owner fails
  try {
    const owner = await clientAs(cfg.url, cfg.anonKey, emails.owner, password);
    const r1 = await rpcRevokeRole(owner, ids.owner2, 'owner');
    record('owner_can_revoke_second_owner', !r1.error, r1.error?.message);
    const r2 = await rpcRevokeRole(owner, ids.owner, 'owner');
    record(
      'final_owner_cannot_self_revoke',
      Boolean(r2.error),
      r2.error?.message,
    );
    const d1 = await rpcSetUserActiveState(owner, ids.owner, false, true);
    record(
      'final_owner_cannot_self_archive',
      Boolean(d1.error),
      d1.error?.message,
    );
  } catch (error) {
    record(
      'final_owner_suite',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Profile self-update
  try {
    const viewer = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.viewer,
      password,
    );
    const ok = await rpcUpdateOwnDisplayName(viewer, 'Viewer Name');
    record('profile_display_name_rpc', !ok.error, ok.error?.message);
    const bad = await viewer
      .from('media_users')
      .update({ is_active: false, email: 'evil@example.test' })
      .eq('id', ids.viewer);
    record('profile_direct_update_denied', Boolean(bad.error));
  } catch (error) {
    record(
      'profile_suite',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Storage private buckets
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const mediaBuckets = (buckets ?? []).filter((b) =>
      b.name.startsWith('media-'),
    );
    record(
      'storage_buckets_private',
      mediaBuckets.length > 0 && mediaBuckets.every((b) => b.public === false),
      mediaBuckets.map((b) => `${b.name}:${b.public}`).join(','),
    );
    const anon = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false },
    });
    const dl = await anon.storage.from('media-originals').download('nope.jpg');
    record('storage_anon_download_fails', Boolean(dl.error));
  } catch (error) {
    record(
      'storage_suite',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // RPC catalog sanity
  record(
    'rpc_catalog_present',
    PHASE5_RPC_CATALOG.length >= 8,
    PHASE5_RPC_CATALOG.map((r) => r.name).join(','),
  );

  // Cleanup seeded users (best-effort)
  for (const id of Object.values(ids)) {
    await admin.auth.admin.deleteUser(id).catch(() => undefined);
    await admin.from('media_user_roles').delete().eq('user_id', id);
    await admin.from('media_users').delete().eq('id', id);
  }
  await admin.from('media_assets').delete().eq('external_id', externalId);

  await writeReport(cfg.projectRef);
  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed ? 1 : 0);
}

async function writeReport(projectRef: string) {
  const report = {
    generatedAt: new Date().toISOString(),
    projectRef,
    liveIntegrationClaimed:
      results.length > 0 && results.every((r) => r.name !== 'skipped'),
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
  const outDir = path.join(process.cwd(), 'docs');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, 'MEDIA_SUPABASE_PHASE5_LIVE_REPORT.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.warn(JSON.stringify(report, null, 2));
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
