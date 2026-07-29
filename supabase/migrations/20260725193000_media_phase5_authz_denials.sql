-- Phase 5 correction — hard authorization denials for hosted PostgREST/RLS gaps
-- Do not edit 20260724190000–003. This migration is idempotent where practical.
--
-- Root causes addressed:
-- 1) Viewer/reviewer/profile: RLS with no matching rows returns success (no error)
--    from PostgREST. Add BEFORE triggers that RAISE 42501 for unauthorized DML.
-- 2) Final owner self-revoke: count OTHER active owners after locking; deny when
--    revocation would leave zero active owners (including self-revoke).

-- ────────────────────────────────────────────────────────────────────────────
-- Session flags: SECURITY DEFINER RPCs opt in to permitted mutations
-- ────────────────────────────────────────────────────────────────────────────
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
    'role_admin_update'
  ) then
    raise exception 'invalid mutation flag' using errcode = '22023';
  end if;
  perform set_config('media.mutation_flag', p_flag, true);
end;
$$;

revoke all on function public.media_set_mutation_flag(text) from public;
-- Internal to definer RPCs only — do not grant to authenticated/anon

create or replace function public.media_mutation_flag()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select nullif(current_setting('media.mutation_flag', true), '');
$$;

revoke all on function public.media_mutation_flag() from public;

create or replace function public.media_is_owner_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.media_has_role('owner'::public.media_role)
      or public.media_has_role('administrator'::public.media_role);
$$;

revoke all on function public.media_is_owner_or_admin() from public;
grant execute on function public.media_is_owner_or_admin() to authenticated;

-- Service-role / superuser maintenance (seed, migrations) must not be blocked.
create or replace function public.media_is_service_context()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  jwt_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if jwt_role = 'service_role' then
    return true;
  end if;
  -- Local/superuser maintenance when no end-user JWT is present
  if auth.uid() is null and (
    session_user in ('postgres', 'supabase_admin')
    or current_user in ('postgres', 'supabase_admin')
  ) then
    return true;
  end if;
  return false;
end;
$$;

revoke all on function public.media_is_service_context() from public;

-- ────────────────────────────────────────────────────────────────────────────
-- Drop unsafe / overly broad policies (including leftovers) and recreate narrow
-- ────────────────────────────────────────────────────────────────────────────

-- media_assets: no viewer/editor/reviewer direct writes
drop policy if exists media_assets_editor_update on public.media_assets;
drop policy if exists media_assets_write_admin on public.media_assets;
drop policy if exists media_assets_insert on public.media_assets;
drop policy if exists media_assets_update on public.media_assets;
drop policy if exists media_assets_delete on public.media_assets;
drop policy if exists media_assets_authenticated_all on public.media_assets;

create policy media_assets_insert_admin on public.media_assets
  for insert to authenticated
  with check (public.media_is_owner_or_admin());

create policy media_assets_update_admin on public.media_assets
  for update to authenticated
  using (public.media_is_owner_or_admin())
  with check (public.media_is_owner_or_admin());

create policy media_assets_delete_admin on public.media_assets
  for delete to authenticated
  using (public.media_is_owner_or_admin());

-- media_ai_analyses: admin/owner only for direct DML (reviewers use RPCs)
drop policy if exists media_ai_write on public.media_ai_analyses;
drop policy if exists media_ai_write_admin on public.media_ai_analyses;
drop policy if exists media_ai_insert on public.media_ai_analyses;
drop policy if exists media_ai_update on public.media_ai_analyses;
drop policy if exists media_ai_delete on public.media_ai_analyses;

create policy media_ai_insert_admin on public.media_ai_analyses
  for insert to authenticated
  with check (public.media_is_owner_or_admin());

create policy media_ai_update_admin on public.media_ai_analyses
  for update to authenticated
  using (public.media_is_owner_or_admin())
  with check (public.media_is_owner_or_admin());

create policy media_ai_delete_admin on public.media_ai_analyses
  for delete to authenticated
  using (public.media_is_owner_or_admin());

-- media_users: no direct authenticated UPDATE (RPC only)
drop policy if exists media_users_update_self on public.media_users;
drop policy if exists media_users_update_owner on public.media_users;
drop policy if exists media_users_update on public.media_users;
drop policy if exists media_users_update_authenticated on public.media_users;

-- Table privileges: authenticated may SELECT; direct INSERT/UPDATE/DELETE denied
-- so PostgREST returns an error (RLS zero-row updates do not). Mutations go through
-- SECURITY DEFINER RPCs (and service_role for privileged admin/migration paths).
revoke insert, update, delete on public.media_assets from public;
revoke insert, update, delete on public.media_assets from anon;
revoke insert, update, delete on public.media_assets from authenticated;

revoke insert, update, delete on public.media_ai_analyses from public;
revoke insert, update, delete on public.media_ai_analyses from anon;
revoke insert, update, delete on public.media_ai_analyses from authenticated;

revoke update, delete on public.media_users from public;
revoke update, delete on public.media_users from anon;
revoke update, delete on public.media_users from authenticated;

grant select on public.media_assets to authenticated;
grant select on public.media_ai_analyses to authenticated;
grant select on public.media_users to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- Denial triggers (raise 42501 so PostgREST returns an error, not silent 0-row)
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.media_enforce_assets_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  flag text := public.media_mutation_flag();
begin
  if public.media_is_service_context() or public.media_is_owner_or_admin() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Editor metadata RPC only (never direct client UPDATE)
  if tg_op = 'UPDATE' and flag = 'editor_metadata' then
    if public.media_has_role('editor'::public.media_role)
       or public.media_has_role('administrator'::public.media_role)
       or public.media_has_role('owner'::public.media_role) then
      return new;
    end if;
  end if;

  raise exception 'permission denied for media_assets' using errcode = '42501';
end;
$$;

drop trigger if exists media_assets_enforce_mutation on public.media_assets;
create trigger media_assets_enforce_mutation
  before insert or update or delete on public.media_assets
  for each row
  execute function public.media_enforce_assets_mutation();

create or replace function public.media_enforce_ai_analyses_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.media_is_service_context() or public.media_is_owner_or_admin() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  raise exception 'permission denied for media_ai_analyses' using errcode = '42501';
end;
$$;

drop trigger if exists media_ai_analyses_enforce_mutation on public.media_ai_analyses;
create trigger media_ai_analyses_enforce_mutation
  before insert or update or delete on public.media_ai_analyses
  for each row
  execute function public.media_enforce_ai_analyses_mutation();

create or replace function public.media_enforce_users_mutation()
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

  if flag = 'profile_display_name' then
    -- RPC path: only display_name (+ updated_at) may change
    if tg_op = 'UPDATE'
       and new.id = old.id
       and new.email is not distinct from old.email
       and new.is_active is not distinct from old.is_active
       and new.archived_at is not distinct from old.archived_at
       and new.created_at is not distinct from old.created_at
       and new.last_login_at is not distinct from old.last_login_at
       and new.id = auth.uid() then
      return new;
    end if;
  end if;

  if flag = 'user_admin_update' and public.media_has_role('owner'::public.media_role) then
    return new;
  end if;

  raise exception 'permission denied for media_users' using errcode = '42501';
end;
$$;

drop trigger if exists media_users_enforce_mutation on public.media_users;
create trigger media_users_enforce_mutation
  before update or delete on public.media_users
  for each row
  execute function public.media_enforce_users_mutation();

revoke all on function public.media_enforce_assets_mutation() from public;
revoke all on function public.media_enforce_ai_analyses_mutation() from public;
revoke all on function public.media_enforce_users_mutation() from public;

-- ────────────────────────────────────────────────────────────────────────────
-- Patch RPCs to set mutation flags + harden final-owner revoke
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
  perform public.media_set_mutation_flag('editor_metadata');

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
  perform public.media_set_mutation_flag('profile_display_name');

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
  row public.media_users;
  is_owner boolean;
  other_owners integer;
begin
  perform public.media_require_auth();
  perform public.media_set_mutation_flag('user_admin_update');

  if not public.media_has_role('owner'::public.media_role) then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  perform public.media_count_active_owners_locked();

  select exists (
    select 1 from public.media_user_roles r
    join public.media_users u on u.id = r.user_id
    where r.user_id = p_user_id
      and r.role = 'owner'::public.media_role
      and r.revoked_at is null
      and u.is_active = true
      and u.archived_at is null
  ) into is_owner;

  if is_owner and (p_is_active = false or p_archive) then
    select count(*)::integer into other_owners
    from public.media_user_roles r
    join public.media_users u on u.id = r.user_id
    where r.role = 'owner'::public.media_role
      and r.revoked_at is null
      and u.is_active = true
      and u.archived_at is null
      and r.user_id is distinct from p_user_id;

    if other_owners < 1 then
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

revoke all on function public.media_set_user_active_state(uuid, boolean, boolean) from public;
grant execute on function public.media_set_user_active_state(uuid, boolean, boolean) to authenticated;

-- Final-owner-safe role revoke: deny when no OTHER active owner would remain
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
  target_is_active_owner boolean;
  other_owners integer;
begin
  uid := public.media_require_auth();
  perform public.media_set_mutation_flag('role_admin_update');

  if not public.media_has_role('owner'::public.media_role) then
    perform public.media_audit_write(
      'role_revoke_denied',
      'media_user_roles',
      p_user_id::text,
      false,
      jsonb_build_object('role', p_role)
    );
    raise exception 'only owners may revoke roles' using errcode = '42501';
  end if;

  -- Serialize concurrent owner removals
  perform public.media_count_active_owners_locked();

  if p_role = 'owner'::public.media_role then
    select exists (
      select 1
      from public.media_user_roles r
      join public.media_users u on u.id = r.user_id
      where r.user_id = p_user_id
        and r.role = 'owner'::public.media_role
        and r.revoked_at is null
        and u.is_active = true
        and u.archived_at is null
    ) into target_is_active_owner;

    if target_is_active_owner then
      select count(*)::integer into other_owners
      from public.media_user_roles r
      join public.media_users u on u.id = r.user_id
      where r.role = 'owner'::public.media_role
        and r.revoked_at is null
        and u.is_active = true
        and u.archived_at is null
        and r.user_id is distinct from p_user_id;

      if other_owners < 1 then
        perform public.media_audit_write(
          'role_revoke_denied',
          'media_user_roles',
          p_user_id::text,
          false,
          jsonb_build_object(
            'role', p_role,
            'reason', 'final_owner',
            'self', p_user_id = uid
          )
        );
        raise exception 'cannot remove the final active owner' using errcode = 'P0001';
      end if;
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

revoke all on function public.media_revoke_role(uuid, public.media_role) from public;
grant execute on function public.media_revoke_role(uuid, public.media_role) to authenticated;

-- Review RPCs that mutate privacy/duplicates need the review flag for any
-- future triggers; set it for consistency.
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
  perform public.media_set_mutation_flag('review_mutation');
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

revoke all on function public.media_review_resolve_privacy_flag(uuid, text) from public;
grant execute on function public.media_review_resolve_privacy_flag(uuid, text) to authenticated;

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
  perform public.media_set_mutation_flag('review_mutation');
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

revoke all on function public.media_review_duplicate_decision(text, text, text) from public;
grant execute on function public.media_review_duplicate_decision(text, text, text) to authenticated;

comment on function public.media_enforce_assets_mutation is
  'Raises 42501 for unauthorized direct media_assets DML (PostgREST-visible denial).';
comment on function public.media_revoke_role is
  'Owner-only role revocation; denies when no other active owner would remain.';
