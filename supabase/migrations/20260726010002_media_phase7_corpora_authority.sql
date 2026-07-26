-- Phase 7 — Database-enforced corpus authority
-- Additive. Does not edit Phase 5/6 migrations.
-- Extends mutation flag allow-list; revokes direct DML; denial triggers; helpers.

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
    'publication_mutation',
    'corpus_mutation'
  ) then
    raise exception 'invalid mutation flag' using errcode = '22023';
  end if;
  perform set_config('media.mutation_flag', p_flag, true);
end;
$$;

revoke all on function public.media_set_mutation_flag(text) from public;

-- ── Restrictive grants ───────────────────────────────────────────────────────
alter table public.media_workspace_members enable row level security;
alter table public.media_workspace_members force row level security;

drop policy if exists media_workspace_members_select on public.media_workspace_members;
create policy media_workspace_members_select on public.media_workspace_members
  for select to authenticated
  using (user_id = auth.uid() or public.media_is_owner_or_admin());

revoke all on table public.media_workspace_members from public;
revoke insert, update, delete on public.media_workspace_members from anon, authenticated;
grant select on public.media_workspace_members to authenticated;

revoke all on table public.media_corpora from public;
revoke all on table public.media_corpus_versions from public;
revoke all on table public.media_corpus_items from public;
revoke all on table public.media_corpus_item_labels from public;
revoke all on table public.media_corpus_reviews from public;
revoke all on table public.media_corpus_events from public;
revoke all on table public.media_corpus_exports from public;

revoke insert, update, delete on public.media_corpora from anon, authenticated;
revoke insert, update, delete on public.media_corpus_versions from anon, authenticated;
revoke insert, update, delete on public.media_corpus_items from anon, authenticated;
revoke insert, update, delete on public.media_corpus_item_labels from anon, authenticated;
revoke insert, update, delete on public.media_corpus_reviews from anon, authenticated;
revoke insert, update, delete on public.media_corpus_events from anon, authenticated;
revoke insert, update, delete on public.media_corpus_exports from anon, authenticated;

grant select on public.media_corpora to authenticated;
grant select on public.media_corpus_versions to authenticated;
grant select on public.media_corpus_items to authenticated;
grant select on public.media_corpus_item_labels to authenticated;
grant select on public.media_corpus_reviews to authenticated;
grant select on public.media_corpus_events to authenticated;
grant select on public.media_corpus_exports to authenticated;

alter table public.media_corpora force row level security;
alter table public.media_corpus_versions force row level security;
alter table public.media_corpus_items force row level security;
alter table public.media_corpus_item_labels force row level security;
alter table public.media_corpus_reviews force row level security;
alter table public.media_corpus_events force row level security;
alter table public.media_corpus_exports force row level security;

-- ── Denial triggers ──────────────────────────────────────────────────────────
create or replace function public.media_enforce_corpus_mutation()
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
  if flag = 'corpus_mutation' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  raise exception 'permission denied for corpus tables'
    using errcode = '42501';
end;
$$;

drop trigger if exists media_corpora_enforce_mutation on public.media_corpora;
create trigger media_corpora_enforce_mutation
  before insert or update or delete on public.media_corpora
  for each row execute function public.media_enforce_corpus_mutation();

drop trigger if exists media_corpus_versions_enforce_mutation on public.media_corpus_versions;
create trigger media_corpus_versions_enforce_mutation
  before insert or update or delete on public.media_corpus_versions
  for each row execute function public.media_enforce_corpus_mutation();

drop trigger if exists media_corpus_items_enforce_mutation on public.media_corpus_items;
create trigger media_corpus_items_enforce_mutation
  before insert or update or delete on public.media_corpus_items
  for each row execute function public.media_enforce_corpus_mutation();

drop trigger if exists media_corpus_item_labels_enforce_mutation on public.media_corpus_item_labels;
create trigger media_corpus_item_labels_enforce_mutation
  before insert or update or delete on public.media_corpus_item_labels
  for each row execute function public.media_enforce_corpus_mutation();

drop trigger if exists media_corpus_reviews_enforce_mutation on public.media_corpus_reviews;
create trigger media_corpus_reviews_enforce_mutation
  before insert or update or delete on public.media_corpus_reviews
  for each row execute function public.media_enforce_corpus_mutation();

drop trigger if exists media_corpus_events_enforce_mutation on public.media_corpus_events;
create trigger media_corpus_events_enforce_mutation
  before insert or update or delete on public.media_corpus_events
  for each row execute function public.media_enforce_corpus_mutation();

drop trigger if exists media_corpus_exports_enforce_mutation on public.media_corpus_exports;
create trigger media_corpus_exports_enforce_mutation
  before insert or update or delete on public.media_corpus_exports
  for each row execute function public.media_enforce_corpus_mutation();

drop trigger if exists media_workspace_members_enforce_mutation on public.media_workspace_members;
create trigger media_workspace_members_enforce_mutation
  before insert or update or delete on public.media_workspace_members
  for each row execute function public.media_enforce_corpus_mutation();

-- ── Lifecycle transition helpers ─────────────────────────────────────────────
create or replace function public.media_corpus_can_transition(
  p_from text,
  p_to text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case p_from
    when 'draft' then p_to in ('under_review', 'archived')
    when 'under_review' then p_to in ('approved', 'draft', 'archived')
    when 'approved' then p_to in ('archived')
    when 'archived' then false
    else false
  end;
$$;

create or replace function public.media_corpus_version_can_transition(
  p_from text,
  p_to text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case p_from
    when 'building' then p_to in ('review_ready', 'cancelled')
    when 'review_ready' then p_to in ('approved', 'building', 'cancelled')
    when 'approved' then p_to in ('released', 'cancelled')
    when 'released' then p_to in ('superseded')
    when 'superseded' then false
    when 'cancelled' then false
    else false
  end;
$$;

create or replace function public.media_corpus_json_has_signed_url(p jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(p::text, '') ~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl|service_role|eyJhbGci)'
$$;

create or replace function public.media_corpus_append_event(
  p_corpus_id uuid,
  p_version_id uuid,
  p_item_id uuid,
  p_actor uuid,
  p_action text,
  p_previous text,
  p_next text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.media_corpus_json_has_signed_url(p_metadata) then
    raise exception 'signed URLs or secrets must not be persisted in corpus events'
      using errcode = '22023';
  end if;
  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpus_events (
    corpus_id, version_id, item_id, actor_id, action,
    previous_status, next_status, metadata
  ) values (
    p_corpus_id, p_version_id, p_item_id, p_actor, p_action,
    p_previous, p_next, coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.media_corpus_append_event(uuid, uuid, uuid, uuid, text, text, text, jsonb) from public;

-- ── Role gates ───────────────────────────────────────────────────────────────
create or replace function public.media_corpus_require_member(p_workspace_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
begin
  if not public.media_is_workspace_member(workspace) then
    raise exception 'permission denied: not a workspace member'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_corpus_require_member(text) from public;

create or replace function public.media_corpus_require_can_draft()
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
    raise exception 'permission denied: manage corpus draft'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_corpus_require_can_draft() from public;

create or replace function public.media_corpus_require_can_review()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
begin
  if not (
    public.media_has_role('reviewer'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    raise exception 'permission denied: review corpus'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_corpus_require_can_review() from public;

create or replace function public.media_corpus_require_can_approve()
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
    raise exception 'permission denied: approve corpus'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_corpus_require_can_approve() from public;

create or replace function public.media_corpus_require_owner()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
begin
  if not public.media_has_role('owner'::public.media_role) then
    raise exception 'permission denied: owner-only corpus action'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_corpus_require_owner() from public;

-- ── Eligibility ──────────────────────────────────────────────────────────────
create or replace function public.media_corpus_asset_eligibility(
  p_workspace_id text,
  p_asset_external_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a public.media_assets;
  findings jsonb := '[]'::jsonb;
  privacy_blocked boolean := false;
begin
  select * into a
  from public.media_assets
  where external_id = p_asset_external_id;

  if not found then
    return jsonb_build_object(
      'eligible', false,
      'findings', jsonb_build_array(
        jsonb_build_object('code', 'asset_missing', 'severity', 'error')
      )
    );
  end if;

  if a.archived_at is not null then
    findings := findings || jsonb_build_array(
      jsonb_build_object('code', 'asset_archived', 'severity', 'error')
    );
  end if;

  privacy_blocked :=
    a.privacy_status is distinct from 'clear'
    or exists (
      select 1
      from public.media_privacy_flags f
      where f.asset_id = a.id
        and f.resolved_at is null
    );

  if privacy_blocked then
    findings := findings || jsonb_build_array(
      jsonb_build_object('code', 'privacy_blocked', 'severity', 'error')
    );
  end if;

  if a.checksum is null or length(trim(a.checksum)) = 0 then
    findings := findings || jsonb_build_array(
      jsonb_build_object('code', 'checksum_missing', 'severity', 'error')
    );
  end if;

  if a.is_exact_duplicate and a.duplicate_group_external_id is null then
    findings := findings || jsonb_build_array(
      jsonb_build_object('code', 'exact_duplicate_unresolved', 'severity', 'error')
    );
  end if;

  if a.is_near_duplicate then
    findings := findings || jsonb_build_array(
      jsonb_build_object('code', 'near_duplicate', 'severity', 'warning')
    );
  end if;

  return jsonb_build_object(
    'eligible', not exists (
      select 1
      from jsonb_array_elements(findings) f
      where f->>'severity' = 'error'
    ),
    'findings', findings,
    'privacy_status', a.privacy_status,
    'is_exact_duplicate', a.is_exact_duplicate,
    'is_near_duplicate', a.is_near_duplicate,
    'duplicate_group', a.duplicate_group_external_id,
    'near_duplicate_group', a.near_duplicate_group_external_id,
    'checksum', a.checksum,
    'revision', a.revision,
    'workspace_id', p_workspace_id
  );
end;
$$;

revoke all on function public.media_corpus_asset_eligibility(text, text) from public;
grant execute on function public.media_corpus_asset_eligibility(text, text) to authenticated;
