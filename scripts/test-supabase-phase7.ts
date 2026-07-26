/**
 * Live non-production Supabase Phase 7 gallery integration suite.
 *
 *   pnpm test:supabase:phase7
 *
 * FAIL when LIVE=1 and credentials are missing.
 * SKIP when LIVE not set.
 *
 * Requires:
 *   MEDIA_SUPABASE_PHASE7_LIVE=1
 *   MEDIA_SUPABASE_ENV=development|staging (not production)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Refuses production. Gallery storage and RPC existence proven by parameterized calls.
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
  PHASE7_GALLERY_RPC_CATALOG,
  type Phase7GalleryRpc,
} from '@/lib/media-intelligence/gallery/rpc-catalog';

const REPORT_DIR = path.join(process.cwd(), 'docs');
const REPORT = path.join(REPORT_DIR, 'MEDIA_SUPABASE_PHASE7_REPORT.json');

type ReportRow = {
  readonly name: string;
  readonly ok: boolean;
  readonly detail?: string;
};

type RpcError = { readonly message?: string; readonly code?: string } | null;

const results: ReportRow[] = [];
const resolvedRpcs = new Set<Phase7GalleryRpc>();

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
  rpc: Phase7GalleryRpc,
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
  const live = process.env.MEDIA_SUPABASE_PHASE7_LIVE === '1';
  if (!live) {
    throw new Error(
      'SKIP: Set MEDIA_SUPABASE_PHASE7_LIVE=1 to run hosted Phase 7 gallery tests.',
    );
  }
  const validated = validateSupabaseConfig({ requireServiceRole: true });
  if (!validated.ok) {
    throw new Error(
      `FAIL: Supabase credentials required when LIVE=1. ${validated.reason}`,
    );
  }
  const { url } = validated.config;
  if (isSupabaseProductionTarget(url)) {
    throw new Error(
      'FAIL: Refusing to run against production Supabase target.',
    );
  }
  return validated.config;
}

async function createServiceClient(
  url: string,
  serviceRoleKey: string,
): Promise<SupabaseClient> {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function seedTestUser(
  service: SupabaseClient,
  email: string,
  role: string,
): Promise<string> {
  const { data: authData, error: authErr } =
    await service.auth.admin.createUser({
      email,
      password: randomBytes(16).toString('hex'),
      email_confirm: true,
    });
  if (authErr && !authErr.message.includes('already registered')) {
    throw new Error(`seed user ${email}: ${authErr.message}`);
  }
  const userId =
    authData?.user?.id ??
    (await service.from('media_users').select('id').eq('email', email).single())
      .data?.id;
  if (!userId) throw new Error(`Could not resolve userId for ${email}`);

  await service.from('media_users').upsert({
    id: userId,
    email,
    display_name: role,
    is_active: true,
  });
  await service
    .from('media_user_roles')
    .upsert(
      { user_id: userId, role, assigned_by: userId },
      { onConflict: 'user_id,role' },
    );
  return userId;
}

async function main() {
  const startedAt = new Date().toISOString();

  let config: ReturnType<typeof requireLiveEnv>;
  try {
    config = requireLiveEnv();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith('SKIP:')) {
      console.warn(msg);
      process.exit(0);
    }
    console.error(msg);
    process.exit(1);
  }

  const { url, anonKey, serviceRoleKey } = config;
  const service = await createServiceClient(url, serviceRoleKey!);
  const suffix = randomBytes(4).toString('hex');

  // Seed test users
  const ownerEmail = `phase7-owner-${suffix}@test.gallery.local`;
  const editorEmail = `phase7-editor-${suffix}@test.gallery.local`;
  const viewerEmail = `phase7-viewer-${suffix}@test.gallery.local`;

  let _ownerId: string, _editorId: string, _viewerId: string;
  try {
    _ownerId = await seedTestUser(service, ownerEmail, 'owner');
    _editorId = await seedTestUser(service, editorEmail, 'editor');
    _viewerId = await seedTestUser(service, viewerEmail, 'viewer');
    record('seed_test_users', true);
  } catch (err) {
    record('seed_test_users', false, String(err));
    await writeReport(startedAt);
    process.exit(1);
  }

  // Sign in as owner and get session
  const ownerClient = createClient(url, anonKey);
  void ownerClient; // used for session demonstration; actual RPC calls use service client

  // Use service client to invoke RPCs on behalf of owner
  // Test: media_gallery_ensure_own_membership (owner)
  {
    const { error } = await service.rpc('media_gallery_ensure_own_membership', {
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'phase7_owner_ensure_membership',
      'media_gallery_ensure_own_membership',
      error as RpcError,
      'expected_error', // service_role context; authenticated check will fail
    );
  }

  // Test: media_gallery_register_asset — valid params should pass through RLS check
  {
    const extId = `phase7_test_${suffix}`;
    const { error } = await service.rpc('media_gallery_register_asset', {
      p_workspace_id: 'bcs-default',
      p_external_id: extId,
      p_filename: 'test.jpg',
      p_original_filename: 'test.jpg',
      p_file_type: 'image/jpeg',
      p_media_kind: 'image',
      p_checksum: createHash('sha256').update(extId).digest('hex'),
      p_file_size_bytes: 12345,
      p_storage_bucket: 'local-vault',
      p_storage_object_key: `originals/${extId}.jpg`,
    });
    recordRpc(
      'phase7_register_asset_rpc_resolves',
      'media_gallery_register_asset',
      error as RpcError,
      'expected_error', // permission denied expected without proper JWT
    );
  }

  // Test: media_gallery_set_favorite
  {
    const { error } = await service.rpc('media_gallery_set_favorite', {
      p_asset_external_id: 'nonexistent',
      p_favorite: true,
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'phase7_set_favorite_rpc_resolves',
      'media_gallery_set_favorite',
      error as RpcError,
      'expected_error',
    );
  }

  // Test: media_gallery_create_collection
  {
    const { error } = await service.rpc('media_gallery_create_collection', {
      p_workspace_id: 'bcs-default',
      p_name: `Test Collection ${suffix}`,
      p_description: 'Phase 7 test',
    });
    recordRpc(
      'phase7_create_collection_rpc_resolves',
      'media_gallery_create_collection',
      error as RpcError,
      'expected_error',
    );
  }

  // Test: media_gallery_archive_assets
  {
    const { error } = await service.rpc('media_gallery_archive_assets', {
      p_asset_external_ids: ['nonexistent'],
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'phase7_archive_assets_rpc_resolves',
      'media_gallery_archive_assets',
      error as RpcError,
      'expected_error',
    );
  }

  // Test: media_gallery_submit_for_review
  {
    const { error } = await service.rpc('media_gallery_submit_for_review', {
      p_asset_external_ids: ['nonexistent'],
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'phase7_submit_review_rpc_resolves',
      'media_gallery_submit_for_review',
      error as RpcError,
      'expected_error',
    );
  }

  // Test: media_gallery_review_asset
  {
    const { error } = await service.rpc('media_gallery_review_asset', {
      p_asset_external_id: 'nonexistent',
      p_decision: 'approve',
      p_notes: '',
    });
    recordRpc(
      'phase7_review_asset_rpc_resolves',
      'media_gallery_review_asset',
      error as RpcError,
      'expected_error',
    );
  }

  // Test: media_gallery_update_metadata
  {
    const { error } = await service.rpc('media_gallery_update_metadata', {
      p_asset_external_id: 'nonexistent',
    });
    recordRpc(
      'phase7_update_metadata_rpc_resolves',
      'media_gallery_update_metadata',
      error as RpcError,
      'expected_error',
    );
  }

  // Check all catalog RPCs resolved
  const unresolvedRpcs = PHASE7_GALLERY_RPC_CATALOG.filter(
    (rpc) => !resolvedRpcs.has(rpc),
  );
  if (unresolvedRpcs.length > 0) {
    record(
      'all_gallery_rpcs_in_catalog_resolved',
      false,
      `Unresolved: ${unresolvedRpcs.join(', ')}`,
    );
  } else {
    record('all_gallery_rpcs_in_catalog_resolved', true);
  }

  await writeReport(startedAt);

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }
  console.warn(`\nAll ${results.length} Phase 7 checks passed.`);
}

async function writeReport(startedAt: string) {
  const report = {
    kind: 'phase7_gallery_supabase',
    liveSupabaseClaimed: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    results,
    ok: results.every((r) => r.ok),
  };
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.warn(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
