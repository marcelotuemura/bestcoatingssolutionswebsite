-- Phase 7 — Visual DAMS Gallery & Media Workspace (schema)
-- Additive only. Does not edit Phase 5/6 migrations.
-- Training corpus remains postponed to Phase 8.

-- ── Workspace membership ─────────────────────────────────────────────────────
create table if not exists public.media_workspace_members (
  workspace_id text not null,
  user_id uuid not null references public.media_users (id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists media_workspace_members_user_idx
  on public.media_workspace_members (user_id)
  where is_active = true;

-- ── Gallery metadata columns on assets ───────────────────────────────────────
alter table public.media_assets
  add column if not exists workspace_id text not null default 'bcs-default';

alter table public.media_assets
  add column if not exists display_title text;

alter table public.media_assets
  add column if not exists description text;

alter table public.media_assets
  add column if not exists location text;

alter table public.media_assets
  add column if not exists creator_name text;

alter table public.media_assets
  add column if not exists capture_date timestamptz;

alter table public.media_assets
  add column if not exists customer_notes text;

alter table public.media_assets
  add column if not exists review_status text not null default 'none'
  check (review_status in ('none', 'pending', 'in_review', 'approved', 'rejected'));

create index if not exists media_assets_workspace_created_idx
  on public.media_assets (workspace_id, created_at desc);

create index if not exists media_assets_workspace_kind_idx
  on public.media_assets (workspace_id, media_kind);

create index if not exists media_assets_display_title_idx
  on public.media_assets (workspace_id, display_title);

-- ── Collections ──────────────────────────────────────────────────────────────
create table if not exists public.media_collections (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  workspace_id text not null default 'bcs-default',
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text not null default '',
  cover_asset_external_id text,
  archived_at timestamptz,
  created_by uuid references public.media_users (id),
  updated_by uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_collections_workspace_idx
  on public.media_collections (workspace_id, archived_at);

create table if not exists public.media_collection_assets (
  collection_id uuid not null references public.media_collections (id) on delete cascade,
  asset_external_id text not null,
  added_by uuid references public.media_users (id),
  added_at timestamptz not null default now(),
  primary key (collection_id, asset_external_id)
);

create index if not exists media_collection_assets_asset_idx
  on public.media_collection_assets (asset_external_id);

-- ── Per-user favorites ───────────────────────────────────────────────────────
create table if not exists public.media_favorites (
  workspace_id text not null default 'bcs-default',
  user_id uuid not null references public.media_users (id) on delete cascade,
  asset_external_id text not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id, asset_external_id)
);

create index if not exists media_favorites_user_idx
  on public.media_favorites (user_id, created_at desc);

-- ── Gallery activity events ──────────────────────────────────────────────────
create table if not exists public.media_gallery_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null default 'bcs-default',
  actor_id uuid references public.media_users (id),
  action text not null,
  asset_external_id text,
  collection_id uuid references public.media_collections (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint media_gallery_events_no_signed_url check (
    metadata::text !~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl|service_role)'
  )
);

create index if not exists media_gallery_events_workspace_idx
  on public.media_gallery_events (workspace_id, created_at desc);

comment on table public.media_collections is
  'Phase 7 workspace collections for Visual DAMS Gallery.';
comment on table public.media_favorites is
  'Phase 7 per-user favorites; never shared across workspaces.';
