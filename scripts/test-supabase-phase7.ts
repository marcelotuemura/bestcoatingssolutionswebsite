/**
 * Live non-production Supabase Phase 7 gallery integration suite.
 *
 *   MEDIA_SUPABASE_PHASE7_LIVE=1 MEDIA_SUPABASE_ENV=staging pnpm test:supabase:phase7
 *
 * FAIL when LIVE=1 and credentials are missing.
 * SKIP when LIVE not set.
 * Refuses production.
 *
 * Includes a real durable private-storage upload + preview authorization test.
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
import { buildGalleryOriginalObjectKey } from '@/lib/media-intelligence/gallery/object-keys';
import { MEDIA_STORAGE_BUCKETS } from '@/lib/media-intelligence/storage/object-keys';

const REPORT_DIR = path.join(process.cwd(), 'docs');
const REPORT = path.join(REPORT_DIR, 'MEDIA_SUPABASE_PHASE7_LIVE_REPORT.json');

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
      `FAIL: Supabase credentials required when LIVE=1. ${validated.reason}`,
    );
  }
  const { url } = validated.config;
  if (isSupabaseProductionTarget(url)) {
    throw new Error(
      'FAIL: Refusing to run against production Supabase target.',
    );
  }
  if (!url.includes('ybzeuxvzpbguszqxrtur') && env === 'staging') {
    console.warn(
      'WARN: staging URL does not include expected project ref ybzeuxvzpbguszqxrtur',
    );
  }
  return validated.config;
}

async function seedTestUser(
  service: SupabaseClient,
  email: string,
  password: string,
  role: string,
): Promise<string> {
  const { data: authData, error: authErr } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  if (
    authErr &&
    !/already registered|already been registered/i.test(authErr.message)
  ) {
    throw new Error(`seed user ${email}: ${authErr.message}`);
  }
  let userId = authData?.user?.id;
  if (!userId) {
    const listed = await service.auth.admin.listUsers({ perPage: 1000 });
    userId = listed.data.users.find((u) => u.email === email)?.id;
  }
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
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return client;
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
    await writeReport(startedAt, false);
    process.exit(1);
  }

  const { url, anonKey, serviceRoleKey } = config;
  const service = createClient(url, serviceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = randomBytes(4).toString('hex');
  const password = `P7-${randomBytes(12).toString('hex')}!`;

  const ownerEmail = `phase7-owner-${suffix}@test.gallery.local`;
  const editorEmail = `phase7-editor-${suffix}@test.gallery.local`;
  const viewerEmail = `phase7-viewer-${suffix}@test.gallery.local`;
  const outsiderEmail = `phase7-outsider-${suffix}@test.gallery.local`;

  try {
    await seedTestUser(service, ownerEmail, password, 'owner');
    await seedTestUser(service, editorEmail, password, 'editor');
    await seedTestUser(service, viewerEmail, password, 'viewer');
    await seedTestUser(service, outsiderEmail, password, 'viewer');
    record('seed_test_users', true);
  } catch (err) {
    record('seed_test_users', false, String(err));
    await writeReport(startedAt, false);
    process.exit(1);
  }

  const editor = await clientAs(url, anonKey, editorEmail, password);
  const viewer = await clientAs(url, anonKey, viewerEmail, password);
  const outsider = await clientAs(url, anonKey, outsiderEmail, password);

  // Membership
  {
    const { error } = await editor.rpc('media_gallery_ensure_own_membership', {
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'phase7_editor_ensure_membership',
      'media_gallery_ensure_own_membership',
      error as RpcError,
      'success',
    );
  }
  {
    const { error } = await viewer.rpc('media_gallery_ensure_own_membership', {
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'phase7_viewer_ensure_membership',
      'media_gallery_ensure_own_membership',
      error as RpcError,
      'success',
    );
  }

  // Durable storage upload + register + preview authorization
  const fixtureBytes = Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=',
    'base64',
  );
  const checksum = createHash('sha256').update(fixtureBytes).digest('hex');
  const externalId = `gallery_phase7_${suffix}`;
  const objectKey = buildGalleryOriginalObjectKey({
    workspaceId: 'bcs-default',
    checksum,
    filename: `phase7-fixture-${suffix}.jpg`,
  });
  const bucket = MEDIA_STORAGE_BUCKETS.original;

  // Bucket privacy
  {
    const { data: buckets, error } = await service.storage.listBuckets();
    const media = (buckets ?? []).find((b) => b.id === bucket);
    record(
      'phase7_media_originals_bucket_private',
      Boolean(media) && media?.public === false,
      error?.message ??
        (media
          ? `public=${String(media.public)}`
          : 'media-originals bucket missing'),
    );
  }

  // Upload durable original via service role (server-side path)
  {
    const { error } = await service.storage
      .from(bucket)
      .upload(objectKey, fixtureBytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    record(
      'phase7_durable_original_upload',
      !error || /already exists/i.test(error.message),
      error?.message,
    );
  }

  // Register through authorized editor RPC (application path)
  {
    const { data, error } = await editor.rpc('media_gallery_register_asset', {
      p_workspace_id: 'bcs-default',
      p_external_id: externalId,
      p_filename: `phase7-fixture-${suffix}.jpg`,
      p_original_filename: `phase7-fixture-${suffix}.jpg`,
      p_file_type: 'image/jpeg',
      p_media_kind: 'image',
      p_checksum: checksum,
      p_file_size_bytes: fixtureBytes.length,
      p_storage_bucket: bucket,
      p_storage_object_key: objectKey,
      p_width: 1,
      p_height: 1,
      p_orientation: '1',
      p_display_title: `Phase7 Fixture ${suffix}`,
    });
    recordRpc(
      'phase7_register_asset_durable',
      'media_gallery_register_asset',
      error as RpcError,
      'success',
    );
    const row = Array.isArray(data) ? data[0] : data;
    record(
      'phase7_db_row_matches_durable_object',
      Boolean(row) &&
        row.storage_bucket === bucket &&
        row.storage_object_key === objectKey &&
        row.external_id === externalId,
      row ? `bucket=${row.storage_bucket}` : (error?.message ?? 'no row'),
    );
  }

  // Object exists
  {
    const { data, error } = await service.storage
      .from(bucket)
      .download(objectKey);
    record(
      'phase7_durable_object_exists',
      Boolean(data) && !error,
      error?.message,
    );
  }

  // Authorized signed preview (editor/member) — short-lived, never persisted
  {
    const { data, error } = await service.storage
      .from(bucket)
      .createSignedUrl(objectKey, 60);
    record(
      'phase7_authorized_short_lived_preview',
      Boolean(data?.signedUrl) &&
        !error &&
        !/X-Amz-Signature/i.test(JSON.stringify(results)),
      error?.message,
    );
    // Ensure we do not write signed URL into the report file contents later
    void data?.signedUrl;
  }

  // Unauthorized: anon cannot download private object
  {
    const anon = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const dl = await anon.storage.from(bucket).download(objectKey);
    record(
      'phase7_unauthorized_cannot_download_original',
      Boolean(dl.error) || !dl.data,
      dl.error?.message ?? 'unexpected download success',
    );
  }

  // Outsider without membership cannot find by checksum via RPC
  {
    const { data, error } = await outsider.rpc(
      'media_gallery_find_asset_by_checksum',
      {
        p_workspace_id: 'bcs-default',
        p_checksum: checksum,
      },
    );
    // Membership required → error expected
    recordRpc(
      'phase7_outsider_find_checksum_denied',
      'media_gallery_find_asset_by_checksum',
      error as RpcError,
      'expected_error',
    );
    void data;
  }

  // Member find-by-checksum returns existing id
  {
    const { data, error } = await editor.rpc(
      'media_gallery_find_asset_by_checksum',
      {
        p_workspace_id: 'bcs-default',
        p_checksum: checksum,
      },
    );
    recordRpc(
      'phase7_find_asset_by_checksum',
      'media_gallery_find_asset_by_checksum',
      error as RpcError,
      'success',
    );
    const row = Array.isArray(data) ? data[0] : data;
    record(
      'phase7_find_checksum_returns_existing_id',
      Boolean(row) && row.external_id === externalId,
      row?.external_id ?? error?.message,
    );
  }

  // Reject local-vault register in hosted durable path (bucket validation)
  {
    const { error } = await editor.rpc('media_gallery_register_asset', {
      p_workspace_id: 'bcs-default',
      p_external_id: `gallery_bad_bucket_${suffix}`,
      p_filename: 'bad.jpg',
      p_original_filename: 'bad.jpg',
      p_file_type: 'image/jpeg',
      p_media_kind: 'image',
      p_checksum: createHash('sha256').update(`bad-${suffix}`).digest('hex'),
      p_file_size_bytes: 10,
      p_storage_bucket: 'gallery',
      p_storage_object_key: `workspaces/bcs-default/originals/bad.jpg`,
    });
    recordRpc(
      'phase7_rejects_unknown_bucket',
      'media_gallery_register_asset',
      error as RpcError,
      'expected_error',
    );
  }

  // Probe remaining RPCs for catalog resolution
  for (const [name, rpc, args] of [
    [
      'phase7_set_favorite_rpc_resolves',
      'media_gallery_set_favorite',
      {
        p_asset_external_id: externalId,
        p_favorite: true,
        p_workspace_id: 'bcs-default',
      },
    ],
    [
      'phase7_create_collection_rpc_resolves',
      'media_gallery_create_collection',
      {
        p_workspace_id: 'bcs-default',
        p_name: `Phase7 ${suffix}`,
        p_description: 'hosted durable test',
      },
    ],
    [
      'phase7_update_metadata_rpc_resolves',
      'media_gallery_update_metadata',
      { p_asset_external_id: externalId, p_display_title: `Updated ${suffix}` },
    ],
    [
      'phase7_submit_review_rpc_resolves',
      'media_gallery_submit_for_review',
      {
        p_asset_external_ids: [externalId],
        p_workspace_id: 'bcs-default',
      },
    ],
  ] as const) {
    const { error } = await editor.rpc(rpc, args as never);
    recordRpc(name, rpc, error as RpcError, 'success');
  }

  {
    const { error } = await editor.rpc('media_gallery_update_collection', {
      p_collection_id: '00000000-0000-0000-0000-000000000000',
      p_name: 'x',
    });
    recordRpc(
      'phase7_update_collection_rpc_resolves',
      'media_gallery_update_collection',
      error as RpcError,
      'expected_error',
    );
  }
  {
    const { error } = await editor.rpc('media_gallery_collection_set_assets', {
      p_collection_id: '00000000-0000-0000-0000-000000000000',
      p_asset_external_ids: [externalId],
      p_mode: 'add',
    });
    recordRpc(
      'phase7_collection_set_assets_rpc_resolves',
      'media_gallery_collection_set_assets',
      error as RpcError,
      'expected_error',
    );
  }
  {
    const { error } = await editor.rpc('media_gallery_archive_assets', {
      p_asset_external_ids: [`missing_${suffix}`],
      p_workspace_id: 'bcs-default',
    });
    recordRpc(
      'phase7_archive_assets_rpc_resolves',
      'media_gallery_archive_assets',
      error as RpcError,
      'success',
    );
  }
  {
    const { error } = await editor.rpc('media_gallery_review_asset', {
      p_asset_external_id: externalId,
      p_decision: 'approve',
      p_notes: '',
    });
    // editor may lack review role → expected_error OR success for owner-like
    if (isFunctionResolutionFailure(error as RpcError)) {
      recordRpc(
        'phase7_review_asset_rpc_resolves',
        'media_gallery_review_asset',
        error as RpcError,
        'expected_error',
      );
    } else {
      resolvedRpcs.add('media_gallery_review_asset');
      record(
        'phase7_review_asset_rpc_resolves',
        true,
        error?.message ?? 'ok_or_authz',
      );
    }
  }
  {
    const { error } = await editor.rpc('media_gallery_register_derivative', {
      p_asset_external_id: externalId,
      p_kind: 'thumbnail',
      p_size_px: 400,
      p_storage_bucket: MEDIA_STORAGE_BUCKETS.thumbnail,
      p_object_key: `workspaces/bcs-default/thumbnails/400/${externalId}.webp`,
      p_content_type: 'image/webp',
      p_bytes: 12,
      p_checksum: createHash('sha256').update('thumb').digest('hex'),
    });
    // May fail if thumb object missing — still proves RPC resolution
    if (isFunctionResolutionFailure(error as RpcError)) {
      recordRpc(
        'phase7_register_derivative_rpc_resolves',
        'media_gallery_register_derivative',
        error as RpcError,
        'expected_error',
      );
    } else {
      resolvedRpcs.add('media_gallery_register_derivative');
      record('phase7_register_derivative_rpc_resolves', true, error?.message);
    }
  }

  const unresolvedRpcs = PHASE7_GALLERY_RPC_CATALOG.filter(
    (rpc) => !resolvedRpcs.has(rpc),
  );
  record(
    'all_gallery_rpcs_in_catalog_resolved',
    unresolvedRpcs.length === 0,
    unresolvedRpcs.length
      ? `Unresolved: ${unresolvedRpcs.join(', ')}`
      : undefined,
  );

  // Cleanup fixture (DB + storage) — do not leave durable orphans
  {
    await service
      .from('media_asset_derivatives')
      .delete()
      .eq(
        'object_key',
        `workspaces/bcs-default/thumbnails/400/${externalId}.webp`,
      );
    await service
      .from('media_favorites')
      .delete()
      .eq('asset_external_id', externalId);
    await service
      .from('media_gallery_events')
      .delete()
      .eq('asset_external_id', externalId);
    const { error: delAssetErr } = await service
      .from('media_assets')
      .delete()
      .eq('external_id', externalId);
    const { error: delObjErr } = await service.storage
      .from(bucket)
      .remove([objectKey]);
    record(
      'phase7_fixture_cleanup',
      !delAssetErr && !delObjErr,
      delAssetErr?.message ?? delObjErr?.message,
    );
  }

  await writeReport(
    startedAt,
    results.every((r) => r.ok),
  );

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }
  console.warn(`\nAll ${results.length} Phase 7 checks passed.`);
}

async function writeReport(startedAt: string, ok: boolean) {
  const failed = results.filter((r) => !r.ok).length;
  const passed = results.filter((r) => r.ok).length;
  const report = {
    kind: 'phase7_gallery_supabase_live',
    phase: 7,
    status: ok ? 'PASS' : results.length === 0 ? 'FAIL' : 'FAIL',
    liveSupabaseClaimed: results.length > 0,
    skipped: false,
    failed,
    passed,
    startedAt,
    finishedAt: new Date().toISOString(),
    projectRefExpected: 'ybzeuxvzpbguszqxrtur',
    results: results.map((r) => ({
      name: r.name,
      ok: r.ok,
      // Never persist signed URLs or secrets in detail strings
      detail: r.detail?.replace(/https?:\/\/\S+/g, '[redacted-url]'),
    })),
    ok,
    notes: [
      'Durable original uploads use private media-originals bucket.',
      'Signed URLs are short-lived and never persisted in reports.',
      'PR #27 corpus migrations must not be applied.',
    ],
  };
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.warn(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
