/**
 * Bootstrap a local Postgres database for Phase 6 publication e2e / app runtime.
 *
 * Prints DATABASE_URL on stdout (last line) for shell capture.
 */
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd();
const DB = process.env.MEDIA_PUBLICATION_E2E_DB?.trim() || `media_pub_e2e`;

function run(cmd: string, args: string[], input?: string) {
  const res = spawnSync(cmd, args, {
    input,
    encoding: 'utf8',
    env: process.env,
  });
  if (res.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(' ')} failed:\n${res.stdout}\n${res.stderr}`,
    );
  }
  return `${res.stdout ?? ''}${res.stderr ?? ''}`;
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

function psqlFile(file: string) {
  return run('sudo', [
    '-u',
    'postgres',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-d',
    DB,
    '-f',
    file,
  ]);
}

const bootstrap = `
create extension if not exists pgcrypto;
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, email text unique);
create or replace function auth.uid()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key, name text not null, public boolean not null default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null, owner uuid,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  last_accessed_at timestamptz, metadata jsonb
);
alter table storage.objects enable row level security;
`;

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
];

run('sudo', ['-u', 'postgres', 'psql', '-c', `drop database if exists ${DB}`]);
run('sudo', ['-u', 'postgres', 'psql', '-c', `create database ${DB}`]);
psql(bootstrap);
for (const rel of migrations) {
  psqlFile(path.join(ROOT, rel));
}
psql(`
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage on schema storage to anon, authenticated;
revoke insert, update, delete on public.media_assets from public, anon, authenticated;
revoke insert, update, delete on public.media_ai_analyses from public, anon, authenticated;
revoke update, delete on public.media_users from public, anon, authenticated;
grant select on public.media_assets to authenticated;
grant select on public.media_ai_analyses to authenticated;
grant select on public.media_users to authenticated;
revoke insert, update, delete on public.media_publication_jobs from anon, authenticated;
revoke insert, update, delete on public.media_publication_drafts from anon, authenticated;
revoke insert, update, delete on public.media_publication_events from anon, authenticated;
revoke insert, update, delete on public.media_publication_approvals from anon, authenticated;
grant select on public.media_publication_jobs to authenticated;
grant select on public.media_publication_drafts to authenticated;
grant select on public.media_publication_events to authenticated;
grant select on public.media_publication_approvals to authenticated;
`);

psql(`
do $$ begin
  create role media_runtime login password 'media_runtime_local' superuser;
exception when duplicate_object then
  alter role media_runtime with login password 'media_runtime_local' superuser;
end $$;
`);
const url = `postgresql://media_runtime:media_runtime_local@127.0.0.1:5432/${DB}`;
console.warn(`Bootstrapped publication DB ${DB}`);
// Last line is captured by playwright-with-publication-pg.sh
process.stdout.write(`${url}\n`);
void randomBytes;
