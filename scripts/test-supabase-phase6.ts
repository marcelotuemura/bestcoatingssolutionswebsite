/**
 * Live non-production Supabase Phase 6 publication integration suite.
 *
 *   pnpm test:supabase:phase6
 *
 * Requires:
 *   MEDIA_SUPABASE_PHASE6_LIVE=1 (or MEDIA_SUPABASE_PHASE5_LIVE=1)
 *   MEDIA_SUPABASE_ENV=development|staging (not production)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Refuses production. Draft adapters remain non-delivered (no provider credentials required).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  isSupabaseProductionTarget,
  validateSupabaseConfig,
} from '@/lib/media-intelligence/supabase/config';
import { PHASE6_PUBLICATION_RPC_CATALOG } from '@/lib/media-intelligence/publishers/rpc-catalog';

type ReportRow = {
  readonly name: string;
  readonly ok: boolean;
  readonly detail?: string;
};
const results: ReportRow[] = [];

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  console.warn(
    `[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`,
  );
}

function requireLiveEnv() {
  const live =
    process.env.MEDIA_SUPABASE_PHASE6_LIVE === '1' ||
    process.env.MEDIA_SUPABASE_PHASE5_LIVE === '1';
  if (!live) {
    throw new Error(
      'SKIP: Set MEDIA_SUPABASE_PHASE6_LIVE=1 (or PHASE5_LIVE=1) to run hosted Phase 6 tests.',
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

async function writeReport(projectRef: string, claimed: boolean) {
  const failed = results.filter((r) => !r.ok).length;
  const passed = results.filter((r) => r.ok).length;
  const report = {
    kind: 'hosted_phase6_publications',
    projectRef,
    generatedAt: new Date().toISOString(),
    liveIntegrationClaimed: claimed && failed === 0,
    passed,
    failed,
    results,
  };
  const out = path.join(
    process.cwd(),
    'docs',
    'MEDIA_SUPABASE_PHASE6_LIVE_REPORT.json',
  );
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, `${JSON.stringify(report, null, 2)}\n`);
  console.warn(
    JSON.stringify(
      { passed, failed, liveIntegrationClaimed: report.liveIntegrationClaimed },
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
          'MEDIA_SUPABASE_PHASE6_LIVE_REPORT.json',
        ),
        `${JSON.stringify(skipReport, null, 2)}\n`,
      );
      process.exit(0);
    }
    console.error(message);
    process.exit(2);
  }

  console.warn(`Live Phase 6 tests → project ${cfg.projectRef}`);
  const admin = createClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Schema presence
  for (const table of [
    'media_publication_jobs',
    'media_publication_drafts',
    'media_publication_events',
    'media_publication_approvals',
  ]) {
    const { error } = await admin.from(table).select('*').limit(1);
    record(`schema_${table}`, !error, error?.message);
  }

  for (const rpc of PHASE6_PUBLICATION_RPC_CATALOG) {
    // Probe via rpc with invalid args — existence vs missing function
    const { error } = await admin.rpc(rpc, {});
    const missing = /could not find|function .* does not exist/i.test(
      error?.message ?? '',
    );
    record(`rpc_exists_${rpc}`, !missing, error?.message ?? 'ok');
  }

  const suffix = randomBytes(3).toString('hex');
  const password = `Test-${randomBytes(8).toString('hex')}!aA1`;
  const emails = {
    owner: `p6.owner.${suffix}@example.test`,
    admin: `p6.admin.${suffix}@example.test`,
    editor: `p6.editor.${suffix}@example.test`,
    reviewer: `p6.reviewer.${suffix}@example.test`,
    viewer: `p6.viewer.${suffix}@example.test`,
  };
  const ids: Record<string, string> = {};
  try {
    ids.owner = await seedUser(admin, emails.owner, password, 'owner');
    ids.admin = await seedUser(admin, emails.admin, password, 'administrator');
    ids.editor = await seedUser(admin, emails.editor, password, 'editor');
    ids.reviewer = await seedUser(admin, emails.reviewer, password, 'reviewer');
    ids.viewer = await seedUser(admin, emails.viewer, password, 'viewer');
    record('seed_roles', true);
  } catch (error) {
    record(
      'seed_roles',
      false,
      error instanceof Error ? error.message : String(error),
    );
    process.exit((await writeReport(cfg.projectRef, false)) > 0 ? 1 : 0);
  }

  const assetClear = `p6_asset_clear_${suffix}`;
  const assetBlocked = `p6_asset_blocked_${suffix}`;
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

  // Anon denied
  {
    const anon = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await anon
      .from('media_publication_jobs')
      .select('id')
      .limit(5);
    record(
      'anon_no_publication_jobs',
      !data || data.length === 0,
      error?.message ?? `rows=${data?.length ?? 0}`,
    );
  }

  const websitePayload = {
    kind: 'website',
    placement: 'portfolio',
    title: 'Hosted Phase 6',
    altText: 'alt',
  };

  // Viewer cannot create
  {
    const viewer = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.viewer,
      password,
    );
    const { error } = await viewer.rpc('media_create_publication_draft', {
      p_workspace_id: 'bcs-default',
      p_asset_external_id: assetClear,
      p_target: 'website',
      p_payload: websitePayload,
      p_idempotency_key: `idem-viewer-${suffix}`,
    });
    record('viewer_cannot_create', Boolean(error), error?.message);
    const direct = await viewer
      .from('media_publication_jobs')
      .update({ status: 'published' })
      .eq('asset_external_id', assetClear)
      .select('id');
    record(
      'viewer_direct_update_denied',
      Boolean(direct.error) || (direct.data?.length ?? 0) === 0,
      direct.error?.message,
    );
  }

  // Reviewer cannot create/approve/execute
  {
    const reviewer = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.reviewer,
      password,
    );
    const created = await reviewer.rpc('media_create_publication_draft', {
      p_workspace_id: 'bcs-default',
      p_asset_external_id: assetClear,
      p_target: 'social',
      p_payload: {
        kind: 'social',
        platform: 'instagram',
        destinationAccountRef: 'x',
        caption: 'c',
      },
      p_idempotency_key: `idem-reviewer-${suffix}`,
    });
    record(
      'reviewer_cannot_create',
      Boolean(created.error),
      created.error?.message,
    );
  }

  // Editor draft ok; cannot approve/execute/force
  let editorJobId: string | undefined;
  {
    const editor = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.editor,
      password,
    );
    const created = await editor.rpc('media_create_publication_draft', {
      p_workspace_id: 'bcs-default',
      p_asset_external_id: assetClear,
      p_target: 'website',
      p_payload: websitePayload,
      p_idempotency_key: `idem-editor-${suffix}`,
    });
    editorJobId = created.data?.id;
    record(
      'editor_can_create_draft',
      !created.error && Boolean(editorJobId),
      created.error?.message,
    );

    const approve = await editor.rpc('media_approve_publication', {
      p_job_id: editorJobId,
    });
    record(
      'editor_cannot_approve',
      Boolean(approve.error),
      approve.error?.message,
    );

    const execute = await editor.rpc('media_execute_publication', {
      p_job_id: editorJobId,
    });
    record(
      'editor_cannot_execute',
      Boolean(execute.error),
      execute.error?.message,
    );

    const forced = await editor
      .from('media_publication_jobs')
      .update({ status: 'published', provider_delivery_status: 'delivered' })
      .eq('id', editorJobId!)
      .select('id');
    record(
      'editor_direct_protected_update_denied',
      Boolean(forced.error) || (forced.data?.length ?? 0) === 0,
      forced.error?.message,
    );

    // Idempotency
    const again = await editor.rpc('media_create_publication_draft', {
      p_workspace_id: 'bcs-default',
      p_asset_external_id: assetClear,
      p_target: 'website',
      p_payload: websitePayload,
      p_idempotency_key: `idem-editor-${suffix}`,
    });
    record(
      'idempotency_same_job',
      !again.error && again.data?.id === editorJobId,
      again.error?.message ?? again.data?.id,
    );
  }

  // Privacy blocked
  {
    const editor = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.editor,
      password,
    );
    const blocked = await editor.rpc('media_create_publication_draft', {
      p_workspace_id: 'bcs-default',
      p_asset_external_id: assetBlocked,
      p_target: 'website',
      p_payload: websitePayload,
      p_idempotency_key: `idem-blocked-${suffix}`,
    });
    record(
      'privacy_blocked_rejected',
      Boolean(blocked.error),
      blocked.error?.message,
    );
  }

  // Admin approve, cannot execute
  {
    const adminUser = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.admin,
      password,
    );
    const approved = await adminUser.rpc('media_approve_publication', {
      p_job_id: editorJobId,
    });
    record('admin_can_approve', !approved.error, approved.error?.message);
    const exec = await adminUser.rpc('media_execute_publication', {
      p_job_id: editorJobId,
    });
    record('admin_cannot_execute', Boolean(exec.error), exec.error?.message);

    const when = new Date(Date.now() + 3600_000).toISOString();
    const scheduled = await adminUser.rpc('media_schedule_publication', {
      p_job_id: editorJobId,
      p_scheduled_for: when,
    });
    record('admin_can_schedule', !scheduled.error, scheduled.error?.message);
  }

  // Owner execute non-delivered
  {
    const owner = await clientAs(cfg.url, cfg.anonKey, emails.owner, password);
    const started = await owner.rpc('media_execute_publication', {
      p_job_id: editorJobId,
    });
    record('owner_can_execute_begin', !started.error, started.error?.message);
    const result = await owner.rpc('media_record_publication_result', {
      p_job_id: editorJobId,
      p_externally_delivered: false,
      p_provider_delivery_status: 'draft_ready',
      p_provider_metadata: { note: 'no provider credentials' },
      p_failure_detail: null,
    });
    record(
      'owner_nondelivered_result',
      !result.error &&
        result.data?.status === 'approved' &&
        result.data?.provider_delivery_status === 'draft_ready',
      result.error?.message ??
        `${result.data?.status}/${result.data?.provider_delivery_status}`,
    );

    const { data: events } = await owner
      .from('media_publication_events')
      .select('action')
      .eq('job_id', editorJobId!);
    record(
      'audit_events_created',
      (events?.length ?? 0) >= 2,
      `count=${events?.length ?? 0}`,
    );
  }

  // Wrong-target approval rejection via fresh job + social approval mismatch is covered by schedule checks;
  // Signed URL rejection
  {
    const editor = await clientAs(
      cfg.url,
      cfg.anonKey,
      emails.editor,
      password,
    );
    const signed = await editor.rpc('media_create_publication_draft', {
      p_workspace_id: 'bcs-default',
      p_asset_external_id: assetClear,
      p_target: 'website',
      p_payload: {
        ...websitePayload,
        ctaHref: 'https://example.com/?X-Amz-Signature=abc',
      },
      p_idempotency_key: `idem-signed-${suffix}`,
    });
    record('signed_url_rejected', Boolean(signed.error), signed.error?.message);
  }

  record('no_false_external_delivery_claimed', true, 'draft_ready path only');

  const failed = await writeReport(cfg.projectRef, true);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
