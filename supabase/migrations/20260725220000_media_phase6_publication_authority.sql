-- Phase 6 correction — database-enforced publication authority
-- Does not edit 20260724190000–20260725193000 or prior Phase 6 files.
-- Status: Phase 6 schema/RLS (20260725210000/001) were applied in local PG tests only;
-- document hosted apply status in MEDIA_PUBLISHERS_PHASE6.md before staging deploy.
--
-- Changes:
-- 1) Approvals table + workspace scope
-- 2) Revoke direct DML; SELECT-only for authenticated
-- 3) Denial triggers + mutation flag for SECURITY DEFINER RPCs
-- 4) Hardened publication RPCs (auth.uid()-derived actor)

-- ── Extend mutation flag allow-list ──────────────────────────────────────────
create or replace function public.media_set_mutation_flag(p_flag text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_flag not in (
    'editor_metadata',
    'profile_display_name',
    'review_mutation',
    'user_admin_update',
    'role_admin_update',
    'publication_mutation'
  ) then
    raise exception 'invalid mutation flag' using errcode = '22023';
  end if;
  perform set_config('media.mutation_flag', p_flag, true);
end;
$$;

revoke all on function public.media_set_mutation_flag(text) from public;

-- ── Workspace scope on jobs ──────────────────────────────────────────────────
alter table public.media_publication_jobs
  add column if not exists workspace_id text not null default 'bcs-default';

create index if not exists media_publication_jobs_workspace_idx
  on public.media_publication_jobs (workspace_id);

alter table public.media_publication_jobs
  add column if not exists asset_revision integer;

alter table public.media_publication_jobs
  add column if not exists published_at timestamptz;

-- ── Target-specific publication approvals ────────────────────────────────────
create table if not exists public.media_publication_approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null default 'bcs-default',
  asset_external_id text not null,
  asset_revision integer not null default 1,
  derivative_id text,
  target text not null check (target in ('website', 'social', 'google_business')),
  approval_version integer not null default 1,
  approved_by uuid not null references public.media_users (id),
  note text,
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, asset_external_id, target, approval_version)
);

create index if not exists media_publication_approvals_asset_idx
  on public.media_publication_approvals (workspace_id, asset_external_id, target);

alter table public.media_publication_approvals enable row level security;

drop policy if exists media_pub_approvals_select on public.media_publication_approvals;
create policy media_pub_approvals_select on public.media_publication_approvals
  for select to authenticated
  using (public.media_is_staff());

revoke all on table public.media_publication_approvals from public;
revoke insert, update, delete on public.media_publication_approvals from anon, authenticated;
grant select on public.media_publication_approvals to authenticated;

-- ── Restrictive grants / drop broad write policies ───────────────────────────
drop policy if exists media_pub_jobs_insert on public.media_publication_jobs;
drop policy if exists media_pub_jobs_update on public.media_publication_jobs;
drop policy if exists media_pub_jobs_delete on public.media_publication_jobs;
drop policy if exists media_pub_drafts_write on public.media_publication_drafts;
drop policy if exists media_pub_events_insert on public.media_publication_events;

drop policy if exists media_pub_jobs_select on public.media_publication_jobs;
create policy media_pub_jobs_select on public.media_publication_jobs
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_pub_drafts_select on public.media_publication_drafts;
create policy media_pub_drafts_select on public.media_publication_drafts
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_pub_events_select on public.media_publication_events;
create policy media_pub_events_select on public.media_publication_events
  for select to authenticated
  using (public.media_is_staff());

revoke all on table public.media_publication_jobs from public;
revoke all on table public.media_publication_drafts from public;
revoke all on table public.media_publication_events from public;
revoke insert, update, delete on public.media_publication_jobs from anon, authenticated;
revoke insert, update, delete on public.media_publication_drafts from anon, authenticated;
revoke insert, update, delete on public.media_publication_events from anon, authenticated;
grant select on public.media_publication_jobs to authenticated;
grant select on public.media_publication_drafts to authenticated;
grant select on public.media_publication_events to authenticated;

alter table public.media_publication_jobs force row level security;
alter table public.media_publication_drafts force row level security;
alter table public.media_publication_events force row level security;
alter table public.media_publication_approvals force row level security;

-- ── Denial triggers ──────────────────────────────────────────────────────────
create or replace function public.media_enforce_publication_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  flag text := public.media_mutation_flag();
begin
  if public.media_is_service_context() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if flag = 'publication_mutation' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  raise exception 'permission denied for publication tables'
    using errcode = '42501';
end;
$$;

drop trigger if exists media_pub_jobs_enforce_mutation on public.media_publication_jobs;
create trigger media_pub_jobs_enforce_mutation
  before insert or update or delete on public.media_publication_jobs
  for each row execute function public.media_enforce_publication_mutation();

drop trigger if exists media_pub_drafts_enforce_mutation on public.media_publication_drafts;
create trigger media_pub_drafts_enforce_mutation
  before insert or update or delete on public.media_publication_drafts
  for each row execute function public.media_enforce_publication_mutation();

drop trigger if exists media_pub_events_enforce_mutation on public.media_publication_events;
create trigger media_pub_events_enforce_mutation
  before insert or update or delete on public.media_publication_events
  for each row execute function public.media_enforce_publication_mutation();

drop trigger if exists media_pub_approvals_enforce_mutation on public.media_publication_approvals;
create trigger media_pub_approvals_enforce_mutation
  before insert or update or delete on public.media_publication_approvals
  for each row execute function public.media_enforce_publication_mutation();

-- ── Helpers ──────────────────────────────────────────────────────────────────
create or replace function public.media_publication_payload_has_signed_url(p jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(p::text, '') ~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl)'
$$;

create or replace function public.media_publication_asset_privacy_blocked(
  p_asset_external_id text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  blocked boolean := false;
begin
  select
    a.privacy_status is distinct from 'clear'
    or exists (
      select 1
      from public.media_privacy_flags f
      where f.asset_id = a.id
        and f.resolved_at is null
    )
  into blocked
  from public.media_assets a
  where a.external_id = p_asset_external_id
    and a.archived_at is null;

  if blocked is null then
    raise exception 'asset not found' using errcode = 'P0002';
  end if;
  return blocked;
end;
$$;

revoke all on function public.media_publication_asset_privacy_blocked(text) from public;

create or replace function public.media_publication_can_transition(
  p_from text,
  p_to text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case p_from
    when 'draft' then p_to in ('awaiting_approval', 'approved', 'cancelled')
    when 'awaiting_approval' then p_to in ('approved', 'draft', 'cancelled')
    when 'approved' then p_to in ('scheduled', 'publishing', 'cancelled')
    when 'scheduled' then p_to in ('publishing', 'approved', 'cancelled')
    when 'publishing' then p_to in ('published', 'failed', 'approved')
    when 'failed' then p_to in ('publishing', 'cancelled')
    else false
  end;
$$;

create or replace function public.media_publication_append_event(
  p_job_id uuid,
  p_actor uuid,
  p_action text,
  p_previous text,
  p_next text,
  p_target text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.media_set_mutation_flag('publication_mutation');
  insert into public.media_publication_events (
    job_id, actor_id, action, previous_status, next_status, target, metadata
  ) values (
    p_job_id, p_actor, p_action, p_previous, p_next, p_target,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.media_publication_append_event(uuid, uuid, text, text, text, text, jsonb) from public;

create or replace function public.media_publication_require_can_prepare()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
begin
  if not (
    public.media_has_role('editor'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    raise exception 'permission denied: prepare publication draft'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_publication_require_can_prepare() from public;

create or replace function public.media_publication_require_can_approve()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
begin
  -- Matches approved app matrix: administrator + owner
  if not (
    public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    raise exception 'permission denied: approve publication'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_publication_require_can_approve() from public;

create or replace function public.media_publication_require_can_schedule()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
begin
  if not (
    public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    raise exception 'permission denied: schedule publication'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_publication_require_can_schedule() from public;

create or replace function public.media_publication_require_owner()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
begin
  if not public.media_has_role('owner'::public.media_role) then
    raise exception 'permission denied: owner-only publication action'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_publication_require_owner() from public;
