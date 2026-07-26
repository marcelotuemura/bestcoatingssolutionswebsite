-- Phase 7 — Training corpus and dataset governance (schema)
-- Additive only. Does not edit Phase 5/6 migrations.
-- Never stores signed URLs. Never trains models or calls external providers.

-- ── Workspace membership (corpus scope) ──────────────────────────────────────
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

-- ── Corpora ──────────────────────────────────────────────────────────────────
create table if not exists public.media_corpora (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  workspace_id text not null default 'bcs-default',
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text not null default '',
  intended_use text not null check (
    intended_use in (
      'damage_detection',
      'estimate_assist',
      'quality_scoring',
      'privacy_detection',
      'general_evaluation',
      'other'
    )
  ),
  status text not null default 'draft' check (
    status in ('draft', 'under_review', 'approved', 'archived')
  ),
  created_by uuid references public.media_users (id),
  updated_by uuid references public.media_users (id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_corpora_workspace_idx
  on public.media_corpora (workspace_id, status);

-- ── Versions ─────────────────────────────────────────────────────────────────
create table if not exists public.media_corpus_versions (
  id uuid primary key default gen_random_uuid(),
  corpus_id uuid not null references public.media_corpora (id) on delete cascade,
  version_number integer not null check (version_number >= 1),
  status text not null default 'building' check (
    status in (
      'building',
      'review_ready',
      'approved',
      'released',
      'superseded',
      'cancelled'
    )
  ),
  notes text not null default '',
  manifest_schema_version text not null default '1.0.0',
  manifest_checksum text,
  released_at timestamptz,
  released_by uuid references public.media_users (id),
  superseded_by uuid references public.media_corpus_versions (id),
  created_by uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (corpus_id, version_number)
);

create index if not exists media_corpus_versions_status_idx
  on public.media_corpus_versions (corpus_id, status);

-- ── Items ────────────────────────────────────────────────────────────────────
create table if not exists public.media_corpus_items (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.media_corpus_versions (id) on delete cascade,
  asset_external_id text not null,
  asset_revision integer not null default 1,
  analysis_external_id text,
  status text not null default 'candidate' check (
    status in ('candidate', 'included', 'excluded', 'needs_review')
  ),
  dataset_split text check (
    dataset_split is null
    or dataset_split in ('train', 'validation', 'test', 'holdout')
  ),
  inclusion_reason text,
  exclusion_reason text,
  privacy_status_snapshot text not null default 'clear',
  is_exact_duplicate_snapshot boolean not null default false,
  is_near_duplicate_snapshot boolean not null default false,
  duplicate_group_snapshot text,
  near_duplicate_group_snapshot text,
  checksum_snapshot text,
  provenance jsonb not null default '{}'::jsonb,
  content_snapshot jsonb not null default '{}'::jsonb,
  near_duplicate_acknowledged boolean not null default false,
  created_by uuid references public.media_users (id),
  updated_by uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (version_id, asset_external_id),
  constraint media_corpus_items_no_signed_url check (
    provenance::text !~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl)'
    and content_snapshot::text !~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl)'
  )
);

create index if not exists media_corpus_items_version_idx
  on public.media_corpus_items (version_id, status);
create index if not exists media_corpus_items_split_idx
  on public.media_corpus_items (version_id, dataset_split);
create index if not exists media_corpus_items_dup_group_idx
  on public.media_corpus_items (version_id, duplicate_group_snapshot);

-- ── Labels (AI suggested vs human confirmed) ─────────────────────────────────
create table if not exists public.media_corpus_item_labels (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.media_corpus_items (id) on delete cascade,
  label_key text not null check (char_length(trim(label_key)) between 1 and 80),
  label_value text not null check (char_length(trim(label_value)) between 1 and 500),
  source text not null check (source in ('ai_suggested', 'human_confirmed')),
  confidence numeric(5,4),
  created_by uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  unique (item_id, label_key, source)
);

create index if not exists media_corpus_item_labels_item_idx
  on public.media_corpus_item_labels (item_id, source);

-- ── Reviews ──────────────────────────────────────────────────────────────────
create table if not exists public.media_corpus_reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.media_corpus_items (id) on delete cascade,
  decision text not null check (
    decision in ('include', 'exclude', 'needs_review', 'acknowledge_near_duplicate')
  ),
  notes text not null default '',
  reviewer_id uuid not null references public.media_users (id),
  created_at timestamptz not null default now()
);

create index if not exists media_corpus_reviews_item_idx
  on public.media_corpus_reviews (item_id, created_at desc);

-- ── Events (immutable audit trail) ───────────────────────────────────────────
create table if not exists public.media_corpus_events (
  id uuid primary key default gen_random_uuid(),
  corpus_id uuid references public.media_corpora (id) on delete set null,
  version_id uuid references public.media_corpus_versions (id) on delete set null,
  item_id uuid references public.media_corpus_items (id) on delete set null,
  actor_id uuid references public.media_users (id),
  action text not null,
  previous_status text,
  next_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint media_corpus_events_no_signed_url check (
    metadata::text !~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl)'
  )
);

create index if not exists media_corpus_events_corpus_idx
  on public.media_corpus_events (corpus_id, created_at desc);
create index if not exists media_corpus_events_version_idx
  on public.media_corpus_events (version_id, created_at desc);

-- ── Exports ──────────────────────────────────────────────────────────────────
create table if not exists public.media_corpus_exports (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.media_corpus_versions (id) on delete cascade,
  format text not null default 'json_manifest' check (
    format in ('json_manifest')
  ),
  status text not null default 'pending' check (
    status in ('pending', 'ready', 'failed', 'cancelled')
  ),
  manifest jsonb,
  manifest_checksum text,
  failure_detail text,
  created_by uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_corpus_exports_no_signed_url check (
    coalesce(manifest::text, '') !~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl)'
  )
);

create index if not exists media_corpus_exports_version_idx
  on public.media_corpus_exports (version_id, created_at desc);

comment on table public.media_corpora is
  'Phase 7 training corpora — governed datasets, never auto-exported externally.';
comment on table public.media_corpus_versions is
  'Released versions are immutable; further changes require a new version.';
comment on column public.media_corpus_item_labels.source is
  'ai_suggested never becomes human_confirmed without an explicit review RPC.';
