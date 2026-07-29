-- Phase 2A — Archive inventory review overlays (human decisions only)
-- Manifest JSON remains the source of binary-derived inventory metadata.
-- Rollback: see docs/MEDIA_PHASE_2A_IMPLEMENTATION.md §Rollback

create table if not exists public.media_inventory_reviews (
  asset_id text primary key,
  project_slug text not null,
  division text,
  stage text,
  category text,
  asset_status text,
  privacy_status text not null default 'unchecked',
  quality_status text,
  publish_status text not null default 'not-published',
  featured boolean not null default false,
  hero_candidate boolean not null default false,
  alt_text text,
  caption text,
  notes text,
  privacy_checklist jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  reviewed_by text,
  reviewed_by_user_id uuid references public.media_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_inventory_reviews_privacy_status_chk
    check (privacy_status in ('unchecked', 'clear', 'review-required', 'blocked')),
  constraint media_inventory_reviews_publish_status_chk
    check (publish_status in (
      'not-published', 'candidate', 'queued', 'published', 'unpublished'
    )),
  constraint media_inventory_reviews_division_chk
    check (
      division is null
      or division in ('marine', 'aviation', 'commercial', 'unknown')
    ),
  constraint media_inventory_reviews_stage_chk
    check (
      stage is null
      or stage in (
        'before', 'damage', 'disassembly', 'preparation', 'fairing',
        'fiberglass', 'masking', 'primer', 'paint', 'gelcoat', 'polishing',
        'ceramic-coating', 'completed', 'unknown'
      )
    ),
  constraint media_inventory_reviews_category_chk
    check (
      category is null
      or category in (
        'hull', 'hardtop', 'deck', 'interior', 'detail', 'process',
        'result', 'context', 'unknown'
      )
    ),
  constraint media_inventory_reviews_asset_status_chk
    check (
      asset_status is null
      or asset_status in (
        'imported', 'analyzing', 'needs-review', 'approved', 'rejected',
        'published', 'archived'
      )
    ),
  constraint media_inventory_reviews_quality_status_chk
    check (
      quality_status is null
      or quality_status in (
        'unchecked', 'acceptable', 'blurry', 'duplicate', 'low-resolution',
        'overexposed', 'underexposed'
      )
    )
);

comment on table public.media_inventory_reviews is
  'Phase 2A human review overlays for data/pictures inventory. Does not store binaries.';

create index if not exists media_inventory_reviews_project_idx
  on public.media_inventory_reviews (project_slug);

create index if not exists media_inventory_reviews_privacy_idx
  on public.media_inventory_reviews (privacy_status);

create index if not exists media_inventory_reviews_updated_idx
  on public.media_inventory_reviews (updated_at desc);

alter table public.media_inventory_reviews enable row level security;

-- Deny-by-default for anon (no policies).

drop policy if exists media_inventory_reviews_select_staff
  on public.media_inventory_reviews;
create policy media_inventory_reviews_select_staff
  on public.media_inventory_reviews
  for select to authenticated
  using (public.media_is_staff());

-- Insert/update: roles that hold review_privacy or edit_metadata in app matrix
-- (owner, administrator, editor, reviewer).
drop policy if exists media_inventory_reviews_insert_reviewers
  on public.media_inventory_reviews;
create policy media_inventory_reviews_insert_reviewers
  on public.media_inventory_reviews
  for insert to authenticated
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
    or public.media_has_role('reviewer'::public.media_role)
  );

drop policy if exists media_inventory_reviews_update_reviewers
  on public.media_inventory_reviews;
create policy media_inventory_reviews_update_reviewers
  on public.media_inventory_reviews
  for update to authenticated
  using (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
    or public.media_has_role('reviewer'::public.media_role)
  )
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
    or public.media_has_role('reviewer'::public.media_role)
  );

-- No delete policy — reviews are retained (archive via asset_status).

create or replace function public.media_inventory_reviews_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- clock_timestamp(): advance even within a single transaction (now() is stable).
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists media_inventory_reviews_set_updated_at
  on public.media_inventory_reviews;
create trigger media_inventory_reviews_set_updated_at
  before update on public.media_inventory_reviews
  for each row
  execute function public.media_inventory_reviews_touch_updated_at();

-- ── Rollback ────────────────────────────────────────────────────────────────
-- drop trigger if exists media_inventory_reviews_set_updated_at on public.media_inventory_reviews;
-- drop function if exists public.media_inventory_reviews_touch_updated_at();
-- drop policy if exists media_inventory_reviews_update_reviewers on public.media_inventory_reviews;
-- drop policy if exists media_inventory_reviews_insert_reviewers on public.media_inventory_reviews;
-- drop policy if exists media_inventory_reviews_select_staff on public.media_inventory_reviews;
-- drop table if exists public.media_inventory_reviews;
