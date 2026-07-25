-- Phase 5 correction — database-enforced RBAC
-- Replaces unsafe direct UPDATE/FOR ALL policies with narrow SECURITY DEFINER RPCs.
-- Safe to apply after 20260724190000–002.

-- ────────────────────────────────────────────────────────────────────────────
-- 0) Review decision table (narrow reviewer writes)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.media_ai_suggestion_reviews (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.media_ai_analyses (id) on delete cascade,
  decision text not null check (decision in ('accept', 'reject', 'deferred')),
  notes text,
  decided_by uuid not null references public.media_users (id),
  decided_at timestamptz not null default now(),
  unique (analysis_id, decided_by, decided_at)
);

alter table public.media_ai_suggestion_reviews enable row level security;

drop policy if exists media_ai_reviews_select on public.media_ai_suggestion_reviews;
create policy media_ai_reviews_select on public.media_ai_suggestion_reviews
  for select to authenticated
  using (public.media_is_staff());

-- No direct insert/update/delete for authenticated — RPC only.

-- ────────────────────────────────────────────────────────────────────────────
-- 1) Harden helper SECURITY DEFINER functions
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.media_current_roles()
returns public.media_role[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(r.role), '{}'::public.media_role[])
  from public.media_user_roles r
  join public.media_users u on u.id = r.user_id
  where r.user_id = auth.uid()
    and r.revoked_at is null
    and u.is_active = true
    and u.archived_at is null;
$$;

create or replace function public.media_has_role(target public.media_role)
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
    where r.role in (
      'owner'::public.media_role,
      'administrator'::public.media_role,
      'editor'::public.media_role,
      'reviewer'::public.media_role,
      'viewer'::public.media_role
    )
  );
$$;

create or replace function public.media_require_auth()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  return uid;
end;
$$;

create or replace function public.media_active_owner_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.media_user_roles r
  join public.media_users u on u.id = r.user_id
  where r.role = 'owner'::public.media_role
    and r.revoked_at is null
    and u.is_active = true
    and u.archived_at is null;
$$;

revoke all on function public.media_current_roles() from public;
revoke all on function public.media_has_role(public.media_role) from public;
revoke all on function public.media_is_staff() from public;
revoke all on function public.media_require_auth() from public;
revoke all on function public.media_active_owner_count() from public;

grant execute on function public.media_current_roles() to authenticated;
grant execute on function public.media_has_role(public.media_role) to authenticated;
grant execute on function public.media_is_staff() to authenticated;
-- media_require_auth / media_active_owner_count: used inside definer RPCs only
grant execute on function public.media_require_auth() to authenticated;
grant execute on function public.media_active_owner_count() to authenticated;

-- Internal audit helper (definer) — never trust caller identity fields
create or replace function public.media_audit_write(
  p_action text,
  p_resource_type text default null,
  p_resource_id text default null,
  p_success boolean default true,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  primary_role public.media_role;
begin
  select r.role into primary_role
  from unnest(public.media_current_roles()) as r(role)
  order by case r.role
    when 'owner' then 1
    when 'administrator' then 2
    when 'editor' then 3
    when 'reviewer' then 4
    else 5
  end
  limit 1;

  insert into public.media_audit_events (
    actor_id, actor_role, action, resource_type, resource_id, success, metadata
  ) values (
    uid,
    primary_role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_success,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.media_audit_write(text, text, text, boolean, jsonb) from public;
grant execute on function public.media_audit_write(text, text, text, boolean, jsonb) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 2) Drop unsafe direct mutation policies
-- ────────────────────────────────────────────────────────────────────────────
drop policy if exists media_assets_editor_update on public.media_assets;

drop policy if exists media_ai_write on public.media_ai_analyses;
create policy media_ai_write_admin on public.media_ai_analyses
  for all to authenticated
  using (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  )
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  );

drop policy if exists media_ai_det_write on public.media_ai_detections;
create policy media_ai_det_write_admin on public.media_ai_detections
  for all to authenticated
  using (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  )
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  );

-- Privacy: remove broad update/insert for reviewers — RPC only
drop policy if exists media_privacy_review on public.media_privacy_flags;
drop policy if exists media_privacy_insert on public.media_privacy_flags;
create policy media_privacy_write_admin on public.media_privacy_flags
  for all to authenticated
  using (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  )
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  );

drop policy if exists media_dup_write on public.media_duplicate_groups;
create policy media_dup_write_admin on public.media_duplicate_groups
  for all to authenticated
  using (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  )
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
  );

-- Users: no authenticated direct UPDATE (profile via media_update_own_display_name;
-- active/archive via media_set_user_active_state). Service role bypasses RLS.
drop policy if exists media_users_update_self on public.media_users;
drop policy if exists media_users_update_owner on public.media_users;

-- Roles: select only for authenticated — mutations via RPC
drop policy if exists media_user_roles_mutate_owner on public.media_user_roles;

-- ────────────────────────────────────────────────────────────────────────────
-- 3) Editor metadata RPC (column-limited)
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.media_editor_update_asset_metadata(
  p_external_id text,
  p_manufacturer text default null,
  p_boat_name text default null,
  p_boat_type text default null,
  p_repair_category text default null,
  p_stage text default null,
  p_keywords text[] default null,
  p_notes text default null,
  p_project_name text default null
)
returns public.media_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_assets;
begin
  uid := public.media_require_auth();

  if not (
    public.media_has_role('editor'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    perform public.media_audit_write(
      'editor_metadata_update_denied',
      'media_assets',
      p_external_id,
      false,
      jsonb_build_object('reason', 'role')
    );
    raise exception 'permission denied' using errcode = '42501';
  end if;

  if not public.media_is_staff() then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  update public.media_assets a
  set
    manufacturer = coalesce(p_manufacturer, a.manufacturer),
    boat_name = coalesce(p_boat_name, a.boat_name),
    boat_type = coalesce(p_boat_type, a.boat_type),
    repair_category = coalesce(p_repair_category, a.repair_category),
    stage = coalesce(p_stage, a.stage),
    keywords = coalesce(p_keywords, a.keywords),
    notes = coalesce(p_notes, a.notes),
    project_name = coalesce(p_project_name, a.project_name),
    updated_at = now(),
    revision = a.revision + 1
  where a.external_id = p_external_id
    and a.archived_at is null
  returning * into row;

  if row.id is null then
    perform public.media_audit_write(
      'editor_metadata_update_denied',
      'media_assets',
      p_external_id,
      false,
      jsonb_build_object('reason', 'not_found_or_archived')
    );
    raise exception 'asset not found' using errcode = 'P0002';
  end if;

  perform public.media_audit_write(
    'editor_metadata_update',
    'media_assets',
    p_external_id,
    true,
    jsonb_build_object('actor', uid)
  );

  return row;
end;
$$;

revoke all on function public.media_editor_update_asset_metadata(
  text, text, text, text, text, text, text[], text, text
) from public;
grant execute on function public.media_editor_update_asset_metadata(
  text, text, text, text, text, text, text[], text, text
) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 4) Narrow reviewer RPCs
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.media_review_resolve_privacy_flag(
  p_flag_id uuid,
  p_notes text default null
)
returns public.media_privacy_flags
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_privacy_flags;
begin
  uid := public.media_require_auth();
  if not (
    public.media_has_role('reviewer'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    perform public.media_audit_write('privacy_resolve_denied', 'media_privacy_flags', p_flag_id::text, false, '{}'::jsonb);
    raise exception 'permission denied' using errcode = '42501';
  end if;

  update public.media_privacy_flags f
  set
    resolved_at = now(),
    resolved_by = uid,
    notes = coalesce(p_notes, f.notes)
  where f.id = p_flag_id
  returning * into row;

  if row.id is null then
    perform public.media_audit_write('privacy_resolve_denied', 'media_privacy_flags', p_flag_id::text, false, jsonb_build_object('reason', 'not_found'));
    raise exception 'privacy flag not found' using errcode = 'P0002';
  end if;

  perform public.media_audit_write('privacy_resolve', 'media_privacy_flags', p_flag_id::text, true, '{}'::jsonb);
  return row;
end;
$$;

create or replace function public.media_review_ai_suggestion(
  p_analysis_id uuid,
  p_decision text,
  p_notes text default null
)
returns public.media_ai_suggestion_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_ai_suggestion_reviews;
  visible boolean;
begin
  uid := public.media_require_auth();
  if p_decision not in ('accept', 'reject', 'deferred') then
    raise exception 'invalid decision' using errcode = '22023';
  end if;
  if not (
    public.media_has_role('reviewer'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    perform public.media_audit_write('ai_review_denied', 'media_ai_analyses', p_analysis_id::text, false, '{}'::jsonb);
    raise exception 'permission denied' using errcode = '42501';
  end if;

  select exists (
    select 1
    from public.media_ai_analyses a
    join public.media_assets s on s.id = a.asset_id
    where a.id = p_analysis_id
      and s.archived_at is null
  ) into visible;

  if not visible then
    perform public.media_audit_write('ai_review_denied', 'media_ai_analyses', p_analysis_id::text, false, jsonb_build_object('reason', 'not_visible'));
    raise exception 'analysis not found' using errcode = 'P0002';
  end if;

  insert into public.media_ai_suggestion_reviews (
    analysis_id, decision, notes, decided_by, decided_at
  ) values (
    p_analysis_id, p_decision, p_notes, uid, now()
  )
  returning * into row;

  -- Never rewrite analysis payload / history
  perform public.media_audit_write(
    'ai_review_decision',
    'media_ai_analyses',
    p_analysis_id::text,
    true,
    jsonb_build_object('decision', p_decision)
  );
  return row;
end;
$$;

create or replace function public.media_review_duplicate_decision(
  p_group_external_id text,
  p_decision text,
  p_notes text default null
)
returns public.media_duplicate_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_duplicate_groups;
begin
  uid := public.media_require_auth();
  if not (
    public.media_has_role('reviewer'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    perform public.media_audit_write('duplicate_decision_denied', 'media_duplicate_groups', p_group_external_id, false, '{}'::jsonb);
    raise exception 'permission denied' using errcode = '42501';
  end if;

  update public.media_duplicate_groups g
  set
    decision = p_decision,
    notes = coalesce(p_notes, g.notes),
    decided_by = uid,
    decided_at = now(),
    updated_at = now()
  where g.external_id = p_group_external_id
  returning * into row;

  if row.id is null then
    perform public.media_audit_write('duplicate_decision_denied', 'media_duplicate_groups', p_group_external_id, false, jsonb_build_object('reason', 'not_found'));
    raise exception 'duplicate group not found' using errcode = 'P0002';
  end if;

  perform public.media_audit_write(
    'duplicate_decision',
    'media_duplicate_groups',
    p_group_external_id,
    true,
    jsonb_build_object('decision', p_decision)
  );
  return row;
end;
$$;

revoke all on function public.media_review_resolve_privacy_flag(uuid, text) from public;
revoke all on function public.media_review_ai_suggestion(uuid, text, text) from public;
revoke all on function public.media_review_duplicate_decision(text, text, text) from public;
grant execute on function public.media_review_resolve_privacy_flag(uuid, text) to authenticated;
grant execute on function public.media_review_ai_suggestion(uuid, text, text) to authenticated;
grant execute on function public.media_review_duplicate_decision(text, text, text) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 5) Profile self-update (display_name only)
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.media_update_own_display_name(p_display_name text)
returns public.media_users
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_users;
begin
  uid := public.media_require_auth();
  if p_display_name is null or length(trim(p_display_name)) = 0 or length(p_display_name) > 120 then
    raise exception 'invalid display_name' using errcode = '22023';
  end if;

  update public.media_users u
  set
    display_name = trim(p_display_name),
    updated_at = now()
  where u.id = uid
  returning * into row;

  if row.id is null then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  perform public.media_audit_write('profile_display_name_update', 'media_users', uid::text, true, '{}'::jsonb);
  return row;
end;
$$;

revoke all on function public.media_update_own_display_name(text) from public;
grant execute on function public.media_update_own_display_name(text) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 6) Final-owner protection + controlled role RPCs
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.media_count_active_owners_locked()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  -- Lock relevant owner role rows to serialize concurrent removals
  perform 1
  from public.media_user_roles r
  where r.role = 'owner'::public.media_role
    and r.revoked_at is null
  for update;

  select public.media_active_owner_count() into n;
  return n;
end;
$$;

revoke all on function public.media_count_active_owners_locked() from public;

create or replace function public.media_assign_role(
  p_user_id uuid,
  p_role public.media_role
)
returns public.media_user_roles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_user_roles;
begin
  uid := public.media_require_auth();

  if p_role = 'owner'::public.media_role then
    if not public.media_has_role('owner'::public.media_role) then
      perform public.media_audit_write('role_assign_denied', 'media_user_roles', p_user_id::text, false, jsonb_build_object('role', p_role));
      raise exception 'only owners may assign owner roles' using errcode = '42501';
    end if;
  else
    if not public.media_has_role('owner'::public.media_role) then
      perform public.media_audit_write('role_assign_denied', 'media_user_roles', p_user_id::text, false, jsonb_build_object('role', p_role));
      raise exception 'only owners may manage roles' using errcode = '42501';
    end if;
  end if;

  insert into public.media_user_roles (user_id, role, assigned_by, assigned_at)
  values (p_user_id, p_role, uid, now())
  on conflict (user_id, role) do update
    set revoked_at = null,
        assigned_by = uid,
        assigned_at = now()
  returning * into row;

  perform public.media_audit_write(
    'role_assigned',
    'media_user_roles',
    p_user_id::text,
    true,
    jsonb_build_object('role', p_role)
  );
  return row;
end;
$$;

create or replace function public.media_revoke_role(
  p_user_id uuid,
  p_role public.media_role
)
returns public.media_user_roles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_user_roles;
  owners integer;
begin
  uid := public.media_require_auth();

  if not public.media_has_role('owner'::public.media_role) then
    perform public.media_audit_write('role_revoke_denied', 'media_user_roles', p_user_id::text, false, jsonb_build_object('role', p_role));
    raise exception 'only owners may revoke roles' using errcode = '42501';
  end if;

  if p_role = 'owner'::public.media_role then
    owners := public.media_count_active_owners_locked();
    if owners <= 1 then
      perform public.media_audit_write(
        'role_revoke_denied',
        'media_user_roles',
        p_user_id::text,
        false,
        jsonb_build_object('role', p_role, 'reason', 'final_owner')
      );
      raise exception 'cannot remove the final active owner' using errcode = 'P0001';
    end if;
  end if;

  update public.media_user_roles r
  set revoked_at = now()
  where r.user_id = p_user_id
    and r.role = p_role
    and r.revoked_at is null
  returning * into row;

  if row.id is null then
    raise exception 'role assignment not found' using errcode = 'P0002';
  end if;

  -- Re-check after update (concurrent safety)
  if p_role = 'owner'::public.media_role and public.media_active_owner_count() < 1 then
    raise exception 'cannot remove the final active owner' using errcode = 'P0001';
  end if;

  perform public.media_audit_write(
    'role_revoked',
    'media_user_roles',
    p_user_id::text,
    true,
    jsonb_build_object('role', p_role)
  );
  return row;
end;
$$;

create or replace function public.media_set_user_active_state(
  p_user_id uuid,
  p_is_active boolean,
  p_archive boolean default false
)
returns public.media_users
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  row public.media_users;
  is_owner boolean;
  owners integer;
begin
  uid := public.media_require_auth();
  if not public.media_has_role('owner'::public.media_role) then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.media_user_roles r
    where r.user_id = p_user_id
      and r.role = 'owner'::public.media_role
      and r.revoked_at is null
  ) into is_owner;

  if is_owner and (p_is_active = false or p_archive) then
    owners := public.media_count_active_owners_locked();
    if owners <= 1 then
      perform public.media_audit_write(
        'user_deactivate_denied',
        'media_users',
        p_user_id::text,
        false,
        jsonb_build_object('reason', 'final_owner')
      );
      raise exception 'cannot deactivate/archive the final active owner' using errcode = 'P0001';
    end if;
  end if;

  update public.media_users u
  set
    is_active = p_is_active,
    archived_at = case when p_archive then now() else null end,
    updated_at = now()
  where u.id = p_user_id
  returning * into row;

  if row.id is null then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  if is_owner and (p_is_active = false or p_archive)
     and public.media_active_owner_count() < 1 then
    raise exception 'cannot deactivate/archive the final active owner' using errcode = 'P0001';
  end if;

  perform public.media_audit_write(
    'user_active_state',
    'media_users',
    p_user_id::text,
    true,
    jsonb_build_object('is_active', p_is_active, 'archive', p_archive)
  );
  return row;
end;
$$;

revoke all on function public.media_assign_role(uuid, public.media_role) from public;
revoke all on function public.media_revoke_role(uuid, public.media_role) from public;
revoke all on function public.media_set_user_active_state(uuid, boolean, boolean) from public;
grant execute on function public.media_assign_role(uuid, public.media_role) to authenticated;
grant execute on function public.media_revoke_role(uuid, public.media_role) to authenticated;
grant execute on function public.media_set_user_active_state(uuid, boolean, boolean) to authenticated;

-- Trigger: block direct destructive paths that leave zero owners
create or replace function public.media_protect_final_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'media_user_roles' then
    if (tg_op = 'DELETE' and old.role = 'owner' and old.revoked_at is null)
       or (tg_op = 'UPDATE' and old.role = 'owner' and old.revoked_at is null
           and new.revoked_at is not null) then
      if public.media_active_owner_count() < 1 then
        raise exception 'cannot remove the final active owner' using errcode = 'P0001';
      end if;
    end if;
  elsif tg_table_name = 'media_users' then
    if (tg_op = 'UPDATE' and (
          (old.is_active = true and new.is_active = false)
          or (old.archived_at is null and new.archived_at is not null)
        ))
       or tg_op = 'DELETE' then
      if exists (
        select 1 from public.media_user_roles r
        where r.user_id = old.id
          and r.role = 'owner'::public.media_role
          and r.revoked_at is null
      ) and public.media_active_owner_count() < 1 then
        raise exception 'cannot remove the final active owner' using errcode = 'P0001';
      end if;
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists media_user_roles_final_owner on public.media_user_roles;
create constraint trigger media_user_roles_final_owner
  after update or delete on public.media_user_roles
  deferrable initially deferred
  for each row
  execute function public.media_protect_final_owner();

drop trigger if exists media_users_final_owner on public.media_users;
create constraint trigger media_users_final_owner
  after update or delete on public.media_users
  deferrable initially deferred
  for each row
  execute function public.media_protect_final_owner();

revoke all on function public.media_protect_final_owner() from public;

comment on function public.media_editor_update_asset_metadata is
  'Column-limited editor metadata updates. Never mutates checksum/storage/identity.';
comment on function public.media_revoke_role is
  'Owner-only role revocation with final-owner preservation.';
