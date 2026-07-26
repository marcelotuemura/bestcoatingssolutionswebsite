/**
 * Local PostgreSQL RBAC/RLS validation for Phase 5 correction.
 *
 * This is NOT a live Supabase project test. It validates SQL migrations and
 * database-enforced RBAC against a local Postgres with stub auth/storage.
 *
 *   pnpm test:supabase:phase5:local
 */
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const ROOT = process.cwd();
const DB = `media_phase5_${randomBytes(3).toString('hex')}`;
const REPORT = path.join(
  ROOT,
  'docs',
  'MEDIA_SUPABASE_PHASE5_LOCAL_PG_REPORT.json',
);

function run(cmd: string, args: string[], input?: string) {
  const res = spawnSync(cmd, args, {
    input,
    encoding: 'utf8',
    env: process.env,
  });
  const combined = `${res.stdout ?? ''}\n${res.stderr ?? ''}`;
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed:\n${combined}`);
  }
  return combined;
}

function psql(sql: string, db = DB) {
  return run('sudo', [
    '-u',
    'postgres',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-d',
    db,
    '-c',
    sql,
  ]);
}

function psqlFile(file: string, db = DB) {
  return run('sudo', [
    '-u',
    'postgres',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-d',
    db,
    '-f',
    file,
  ]);
}

async function main() {
  const notices: string[] = [];
  const started = new Date().toISOString();

  run('sudo', [
    '-u',
    'postgres',
    'psql',
    '-c',
    `drop database if exists ${DB}`,
  ]);
  run('sudo', ['-u', 'postgres', 'psql', '-c', `create database ${DB}`]);

  const bootstrap = `
create extension if not exists pgcrypto;

do $$ begin
  create role anon nologin;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role authenticated nologin;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role service_role nologin bypassrls;
exception when duplicate_object then null;
end $$;

create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  email text unique
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create schema if not exists test_helpers;
create or replace function test_helpers.set_auth(uid uuid)
returns void
language plpgsql
as $$
begin
  if uid is null then
    perform set_config('request.jwt.claim.sub', '', true);
  else
    perform set_config('request.jwt.claim.sub', uid::text, true);
  end if;
end;
$$;

create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz,
  metadata jsonb
);
alter table storage.objects enable row level security;
`;

  psql(bootstrap);

  const migrations = [
    'supabase/migrations/20260724190000_media_phase5_schema.sql',
    'supabase/migrations/20260724190001_media_phase5_rls.sql',
    'supabase/migrations/20260724190002_media_phase5_storage.sql',
    'supabase/migrations/20260724190003_media_phase5_rbac_hardening.sql',
    'supabase/migrations/20260725193000_media_phase5_authz_denials.sql',
    'supabase/migrations/20260725210000_media_phase6_publications_schema.sql',
    'supabase/migrations/20260725210001_media_phase6_publications_rls.sql',
    'supabase/migrations/20260725220000_media_phase6_publication_authority.sql',
    'supabase/migrations/20260725220001_media_phase6_publication_rpcs.sql',
    'supabase/migrations/20260726020000_media_phase7_gallery_schema.sql',
    'supabase/migrations/20260726020001_media_phase7_gallery_rls.sql',
    'supabase/migrations/20260726020002_media_phase7_gallery_authority.sql',
    'supabase/migrations/20260726020003_media_phase7_gallery_rpcs.sql',
    'supabase/migrations/20260726020004_media_phase7_gallery_corrections.sql',
    'supabase/migrations/20260726120000_media_phase7_gallery_durable_storage.sql',
  ];

  for (const rel of migrations) {
    psqlFile(path.join(ROOT, rel));
    notices.push(`applied:${rel}`);
  }

  // Table grants mirroring typical Supabase authenticated access + RLS.
  // Then re-apply Phase 5 authz denials so broad grants do not undo revokes.
  psql(`
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on all tables in schema storage to authenticated;
grant select on all tables in schema storage to anon;

-- Match 20260725193000 privilege posture
revoke insert, update, delete on public.media_assets from public, anon, authenticated;
revoke insert, update, delete on public.media_ai_analyses from public, anon, authenticated;
revoke update, delete on public.media_users from public, anon, authenticated;
grant select on public.media_assets to authenticated;
grant select on public.media_ai_analyses to authenticated;
grant select on public.media_users to authenticated;

alter table public.media_users force row level security;
alter table public.media_user_roles force row level security;
alter table public.media_assets force row level security;
alter table public.media_asset_derivatives force row level security;
alter table public.media_projects force row level security;
alter table public.media_project_assets force row level security;
alter table public.media_ai_analyses force row level security;
alter table public.media_ai_detections force row level security;
alter table public.media_privacy_flags force row level security;
alter table public.media_duplicate_groups force row level security;
alter table public.media_duplicate_members force row level security;
alter table public.media_ingestion_runs force row level security;
alter table public.media_analysis_runs force row level security;
alter table public.media_audit_events force row level security;
alter table public.media_ai_suggestion_reviews force row level security;
-- Re-assert Phase 6 privilege posture after broad grants above.
revoke insert, update, delete on public.media_publication_jobs from public, anon, authenticated;
revoke insert, update, delete on public.media_publication_drafts from public, anon, authenticated;
revoke insert, update, delete on public.media_publication_events from public, anon, authenticated;
revoke insert, update, delete on public.media_publication_approvals from public, anon, authenticated;
grant select on public.media_publication_jobs to authenticated;
grant select on public.media_publication_drafts to authenticated;
grant select on public.media_publication_events to authenticated;
grant select on public.media_publication_approvals to authenticated;
alter table public.media_publication_jobs force row level security;
alter table public.media_publication_drafts force row level security;
alter table public.media_publication_events force row level security;
alter table public.media_publication_approvals force row level security;
-- Re-assert Phase 7 gallery privilege posture.
revoke insert, update, delete on public.media_workspace_members from public, anon, authenticated;
revoke insert, update, delete on public.media_collections from public, anon, authenticated;
revoke insert, update, delete on public.media_collection_assets from public, anon, authenticated;
revoke insert, update, delete on public.media_favorites from public, anon, authenticated;
revoke insert, update, delete on public.media_gallery_events from public, anon, authenticated;
grant select on public.media_workspace_members to authenticated;
grant select on public.media_collections to authenticated;
grant select on public.media_collection_assets to authenticated;
grant select on public.media_favorites to authenticated;
grant select on public.media_gallery_events to authenticated;
alter table public.media_workspace_members force row level security;
alter table public.media_collections force row level security;
alter table public.media_collection_assets force row level security;
alter table public.media_favorites force row level security;
alter table public.media_gallery_events force row level security;
`);

  const testFiles = [
    path.join(ROOT, 'supabase/tests/phase5_rbac_local.sql'),
    path.join(ROOT, 'supabase/tests/phase6_publications_rls_local.sql'),
    path.join(ROOT, 'supabase/tests/phase7_gallery_rls_local.sql'),
  ];
  const passes: string[] = [];
  for (const testFile of testFiles) {
    const out = run('sudo', [
      '-u',
      'postgres',
      'psql',
      '-v',
      'ON_ERROR_STOP=1',
      '-d',
      DB,
      '-f',
      testFile,
    ]);
    const found = [...out.matchAll(/NOTICE:\s+PASS:\s+(\S+)/g)].map(
      (m) => m[1]!,
    );
    passes.push(...found);
    notices.push(...found.map((p) => `PASS:${p}`));
  }

  const report = {
    kind: 'local_postgres_rbac',
    liveSupabaseClaimed: false,
    database: DB,
    startedAt: started,
    finishedAt: new Date().toISOString(),
    migrationsApplied: migrations,
    passes,
    ok:
      passes.includes('all_local_rbac_assertions') &&
      passes.includes('all_phase6_publication_rls_assertions') &&
      passes.includes('all_phase7_gallery_rls_assertions'),
    notes: [
      'Local Postgres with stub auth.uid()/storage — not a live Supabase project.',
      'Auth session, signed URLs, and hosted Storage behavior still require pnpm test:supabase:phase5.',
      'Phase 6 publication RLS assertions included; live provider delivery not claimed.',
      'Phase 7 gallery RLS assertions included; hosted Storage behavior not claimed.',
    ],
  };

  await fs.mkdir(path.dirname(REPORT), { recursive: true });
  await fs.writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.warn(JSON.stringify(report, null, 2));

  run('sudo', [
    '-u',
    'postgres',
    'psql',
    '-c',
    `drop database if exists ${DB}`,
  ]);

  if (!report.ok) process.exit(1);
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  try {
    run('sudo', [
      '-u',
      'postgres',
      'psql',
      '-c',
      `drop database if exists ${DB}`,
    ]);
  } catch {
    /* ignore */
  }
  process.exit(1);
});
