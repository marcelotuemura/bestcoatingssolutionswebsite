-- Phase 5 — Media Intelligence DAMS schema
-- Normalized PostgreSQL metadata. No absolute local filesystem paths.
-- Apply with Supabase CLI / SQL editor. RLS enabled in follow-up migration.

create extension if not exists "pgcrypto";

-- ── Roles enum ──────────────────────────────────────────────────────────────
do $$ begin
  create type media_role as enum (
    'owner',
    'administrator',
    'editor',
    'reviewer',
    'viewer'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type media_source_system as enum (
    'local_catalog',
    'local_vault',
    'migration',
    'ingestion',
    'manual',
    'fixture'
  );
exception when duplicate_object then null;
end $$;

-- ── Users (profile linked to auth.users) ───────────────────────────────────
create table if not exists public.media_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  archived_at timestamptz
);

create table if not exists public.media_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.media_users (id) on delete cascade,
  role media_role not null,
  assigned_by uuid references public.media_users (id),
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, role)
);

create index if not exists media_user_roles_user_idx
  on public.media_user_roles (user_id)
  where revoked_at is null;

-- ── Assets (deterministic catalog metadata) ────────────────────────────────
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  filename text not null,
  original_filename text not null,
  file_type text not null,
  media_kind text not null check (media_kind in ('image', 'video')),
  folder text not null default '',
  project_external_id text,
  project_name text,
  manufacturer text,
  boat_name text,
  boat_type text,
  repair_category text,
  stage text not null default 'unknown',
  keywords text[] not null default '{}',
  camera text,
  exif_date timestamptz,
  has_exif boolean not null default false,
  width integer,
  height integer,
  resolution text,
  orientation text not null default 'unknown',
  checksum text,
  file_size_bytes bigint,
  score_website numeric(5,2) not null default 0,
  score_marketing numeric(5,2) not null default 0,
  score_technical numeric(5,2) not null default 0,
  score_quality numeric(5,2),
  score_seo numeric(5,2),
  score_social numeric(5,2),
  score_overall numeric(5,2),
  privacy_status text not null default 'clear',
  privacy_issues text[] not null default '{}',
  is_hero_candidate boolean not null default false,
  is_exact_duplicate boolean not null default false,
  is_near_duplicate boolean not null default false,
  duplicate_group_external_id text,
  near_duplicate_group_external_id text,
  recommendations jsonb,
  video_meta jsonb,
  notes text,
  source_system media_source_system not null default 'migration',
  storage_bucket text,
  storage_object_key text,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.media_users (id),
  archived_at timestamptz,
  constraint media_assets_no_abs_path check (
    storage_object_key is null
    or storage_object_key !~ '^(/|[A-Za-z]:)'
  )
);

create index if not exists media_assets_checksum_idx on public.media_assets (checksum);
create index if not exists media_assets_project_idx on public.media_assets (project_external_id);

-- ── Derivatives (relative object keys only) ────────────────────────────────
create table if not exists public.media_asset_derivatives (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id) on delete cascade,
  kind text not null check (
    kind in ('thumbnail', 'webp', 'avif', 'preview', 'poster')
  ),
  size_px integer,
  storage_bucket text not null,
  object_key text not null,
  content_type text not null,
  bytes bigint,
  checksum text,
  created_at timestamptz not null default now(),
  unique (asset_id, kind, size_px),
  constraint media_deriv_no_abs_path check (object_key !~ '^(/|[A-Za-z]:)')
);

-- ── Projects ───────────────────────────────────────────────────────────────
create table if not exists public.media_projects (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  name text not null,
  manufacturer text,
  boat_name text,
  boat_type text,
  repair_category text,
  folder text,
  media_count integer not null default 0,
  image_count integer not null default 0,
  video_count integer not null default 0,
  before_count integer not null default 0,
  during_count integer not null default 0,
  after_count integer not null default 0,
  best_website_asset_external_id text,
  best_social_asset_external_id text,
  top_hero_asset_external_id text,
  duplicate_alert_count integer not null default 0,
  privacy_alert_count integer not null default 0,
  average_website_score numeric(5,2),
  average_marketing_score numeric(5,2),
  average_technical_score numeric(5,2),
  timeline_start timestamptz,
  timeline_end timestamptz,
  notes text,
  source_system media_source_system not null default 'migration',
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.media_users (id),
  archived_at timestamptz
);

create table if not exists public.media_project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.media_projects (id) on delete cascade,
  asset_id uuid not null references public.media_assets (id) on delete cascade,
  sort_order integer not null default 0,
  unique (project_id, asset_id)
);

-- ── AI analyses (separate from deterministic catalog) ──────────────────────
create table if not exists public.media_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id) on delete cascade,
  analysis_version text not null,
  analyzed_at timestamptz not null,
  provider text not null,
  provider_model text,
  confidence numeric(4,3) not null default 0,
  stage text,
  stage_confidence numeric(4,3),
  quality jsonb not null default '{}'::jsonb,
  boat jsonb not null default '{}'::jsonb,
  keywords text[] not null default '{}',
  tags text[] not null default '{}',
  notes text,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.media_users (id)
);

create unique index if not exists media_ai_analyses_one_current
  on public.media_ai_analyses (asset_id)
  where is_current;

create table if not exists public.media_ai_detections (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.media_ai_analyses (id) on delete cascade,
  detection_kind text not null,
  label text not null,
  confidence numeric(4,3) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.media_privacy_flags (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id) on delete cascade,
  analysis_id uuid references public.media_ai_analyses (id) on delete set null,
  risk text not null,
  confidence numeric(4,3) not null default 0,
  requires_owner_review boolean not null default true,
  suggestion text,
  notes text,
  resolved_at timestamptz,
  resolved_by uuid references public.media_users (id),
  created_at timestamptz not null default now()
);

-- ── Duplicates ─────────────────────────────────────────────────────────────
create table if not exists public.media_duplicate_groups (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  kind text not null check (kind in ('exact', 'near')),
  similarity numeric(4,3) not null default 0,
  recommended_keep_asset_external_id text,
  notes text,
  decision text,
  decided_by uuid references public.media_users (id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_duplicate_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.media_duplicate_groups (id) on delete cascade,
  asset_id uuid references public.media_assets (id) on delete set null,
  asset_external_id text not null,
  filename text,
  role text not null default 'copy',
  unique (group_id, asset_external_id)
);

-- ── Runs & audit ───────────────────────────────────────────────────────────
create table if not exists public.media_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  source_system media_source_system not null default 'ingestion',
  processed integer not null default 0,
  ingested integer not null default 0,
  rejected integer not null default 0,
  failed integer not null default 0,
  report jsonb not null default '{}'::jsonb,
  created_by uuid references public.media_users (id)
);

create table if not exists public.media_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  provider text not null,
  processed integer not null default 0,
  analyzed integer not null default 0,
  failed integer not null default 0,
  report jsonb not null default '{}'::jsonb,
  created_by uuid references public.media_users (id)
);

create table if not exists public.media_audit_events (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  actor_role media_role,
  action text not null,
  resource_type text,
  resource_id text,
  success boolean not null default true,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists media_audit_events_at_idx
  on public.media_audit_events (at desc);

-- Helper: current user's active roles
create or replace function public.media_current_roles()
returns media_role[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(r.role), '{}'::media_role[])
  from public.media_user_roles r
  join public.media_users u on u.id = r.user_id
  where r.user_id = auth.uid()
    and r.revoked_at is null
    and u.is_active = true
    and u.archived_at is null;
$$;

create or replace function public.media_has_role(target media_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target = any (public.media_current_roles());
$$;

create or replace function public.media_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from unnest(public.media_current_roles()) as r(role)
    where r.role in ('owner', 'administrator', 'editor', 'reviewer', 'viewer')
  );
$$;

comment on table public.media_assets is
  'Deterministic catalog metadata only. AI fields live in media_ai_analyses.';
comment on table public.media_ai_analyses is
  'AI overlay history. is_current marks active analysis without deleting history.';
