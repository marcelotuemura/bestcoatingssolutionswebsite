-- Phase 2A follow-up — clear supabase db lint unused-variable warnings.
-- Behavior unchanged: auth / can-edit gates still run via PERFORM.
-- Rollback: re-apply prior function bodies from
--   20260725193000_media_phase5_authz_denials.sql
--   20260726020003_media_phase7_gallery_rpcs.sql

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

create or replace function public.media_gallery_register_derivative(
  p_asset_external_id text,
  p_kind text,
  p_size_px integer,
  p_storage_bucket text,
  p_object_key text,
  p_content_type text,
  p_bytes bigint default null,
  p_checksum text default null
)
returns public.media_asset_derivatives
language plpgsql
security definer
set search_path = public
as $$
declare
  asset public.media_assets;
  der public.media_asset_derivatives;
begin
  perform public.media_gallery_require_can_edit();
  select * into asset from public.media_assets where external_id = p_asset_external_id;
  if not found then
    raise exception 'asset not found' using errcode = 'P0002';
  end if;
  perform public.media_gallery_require_member(asset.workspace_id);
  if p_object_key like 'originals/%' then
    raise exception 'derivatives cannot use originals path' using errcode = '22023';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  insert into public.media_asset_derivatives (
    asset_id, kind, size_px, storage_bucket, object_key, content_type, bytes, checksum
  ) values (
    asset.id, p_kind, p_size_px, p_storage_bucket, p_object_key, p_content_type, p_bytes, p_checksum
  )
  on conflict (asset_id, kind, size_px) do update
    set object_key = excluded.object_key,
        content_type = excluded.content_type,
        bytes = excluded.bytes,
        checksum = excluded.checksum
  returning * into der;
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  return der;
end;
$$;
