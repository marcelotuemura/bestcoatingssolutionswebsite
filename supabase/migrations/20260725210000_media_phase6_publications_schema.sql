-- Phase 6 — Publication jobs, drafts snapshot, and immutable events
-- Do not edit Phase 5 migrations (20260724190000–20260725193000).

create table if not exists public.media_publication_jobs (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  asset_external_id text not null,
  derivative_id text,
  target text not null check (target in ('website', 'social', 'google_business')),
  status text not null check (status in (
    'draft',
    'awaiting_approval',
    'approved',
    'scheduled',
    'publishing',
    'published',
    'failed',
    'cancelled'
  )),
  provider_delivery_status text not null check (provider_delivery_status in (
    'not_configured',
    'draft_ready',
    'queued',
    'delivered',
    'failed'
  )),
  payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz,
  idempotency_key text not null unique,
  approval_id text,
  approval_version integer,
  destination_ref text,
  failure_detail text,
  provider_metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.media_users (id),
  reviewed_by uuid references public.media_users (id),
  published_by uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_publication_jobs_status_idx
  on public.media_publication_jobs (status);
create index if not exists media_publication_jobs_asset_idx
  on public.media_publication_jobs (asset_external_id);
create index if not exists media_publication_jobs_target_idx
  on public.media_publication_jobs (target);

create table if not exists public.media_publication_drafts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.media_publication_jobs (id) on delete cascade,
  revision integer not null default 1,
  payload jsonb not null,
  created_by uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  unique (job_id, revision)
);

create table if not exists public.media_publication_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.media_publication_jobs (id) on delete cascade,
  actor_id uuid references public.media_users (id),
  action text not null,
  previous_status text,
  next_status text,
  target text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists media_publication_events_job_idx
  on public.media_publication_events (job_id, created_at desc);

comment on table public.media_publication_jobs is
  'Phase 6 approval-gated publication jobs. Never auto-publish.';
comment on column public.media_publication_jobs.provider_delivery_status is
  'delivered only when a real provider acknowledges success.';
