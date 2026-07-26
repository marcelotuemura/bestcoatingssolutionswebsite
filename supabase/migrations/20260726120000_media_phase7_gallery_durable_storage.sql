-- Phase 7 correction — durable storage helpers (additive)
-- Does not edit prior Phase 5/6/7 migrations.
--
-- - Find existing asset by workspace + checksum (authorized members)
-- - Tighten register_asset: allow only media-originals or local-vault buckets
-- - Require workspace-scoped object keys (workspaces/{workspace}/...)

create or replace function public.media_gallery_find_asset_by_checksum(
  p_workspace_id text,
  p_checksum text
)
returns public.media_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
  row public.media_assets;
begin
  perform public.media_require_auth();
  perform public.media_gallery_require_member(workspace);

  if p_checksum is null or length(trim(p_checksum)) < 16 then
    raise exception 'checksum required' using errcode = '22023';
  end if;

  select * into row
  from public.media_assets a
  where a.workspace_id = workspace
    and a.checksum = p_checksum
    and a.archived_at is null
  order by a.created_at asc
  limit 1;

  return row;
end;
$$;

revoke all on function public.media_gallery_find_asset_by_checksum(text, text) from public;
grant execute on function public.media_gallery_find_asset_by_checksum(text, text) to authenticated;

create or replace function public.media_gallery_register_asset(
  p_workspace_id text,
  p_external_id text,
  p_filename text,
  p_original_filename text,
  p_file_type text,
  p_media_kind text,
  p_checksum text,
  p_file_size_bytes bigint,
  p_storage_bucket text,
  p_storage_object_key text,
  p_width integer default null,
  p_height integer default null,
  p_orientation text default 'unknown',
  p_display_title text default null
)
returns public.media_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_edit();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
  row public.media_assets;
begin
  perform public.media_gallery_ensure_own_membership(workspace);
  perform public.media_gallery_require_member(workspace);

  if p_media_kind not in ('image', 'video') then
    raise exception 'unsupported media kind' using errcode = '22023';
  end if;
  if p_checksum is null or length(trim(p_checksum)) < 16 then
    raise exception 'checksum required' using errcode = '22023';
  end if;
  if p_storage_bucket is null
    or p_storage_bucket not in ('media-originals', 'local-vault')
  then
    raise exception 'invalid storage bucket for gallery original'
      using errcode = '22023';
  end if;
  if p_storage_object_key is null
    or p_storage_object_key ~ '^(/|[A-Za-z]:)'
    or p_storage_object_key ~* '(https?:|X-Amz-Signature|signedUrl)'
  then
    raise exception 'invalid storage object key' using errcode = '22023';
  end if;
  if p_storage_object_key !~ ('^workspaces/' || workspace || '/originals/') then
    raise exception 'storage object key must be workspace-scoped'
      using errcode = '22023';
  end if;

  if exists (
    select 1 from public.media_assets a
    where a.workspace_id = workspace
      and a.checksum = p_checksum
      and a.archived_at is null
  ) then
    raise exception 'exact duplicate checksum already present'
      using errcode = '23505';
  end if;

  perform public.media_set_mutation_flag('gallery_mutation');
  perform set_config('request.jwt.claim.role', 'service_role', true);

  insert into public.media_assets (
    external_id, workspace_id, filename, original_filename, file_type, media_kind,
    checksum, file_size_bytes, storage_bucket, storage_object_key,
    width, height, orientation, display_title, source_system, created_by,
    review_status
  ) values (
    p_external_id, workspace, p_filename, p_original_filename, p_file_type, p_media_kind,
    p_checksum, p_file_size_bytes, p_storage_bucket, p_storage_object_key,
    p_width, p_height, coalesce(p_orientation, 'unknown'),
    coalesce(nullif(trim(p_display_title), ''), p_original_filename),
    'manual', actor, 'none'
  )
  on conflict (external_id) do update
    set updated_at = now()
  returning * into row;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform public.media_gallery_append_event(
    workspace, actor, 'asset_uploaded', row.external_id, null,
    jsonb_build_object(
      'media_kind', p_media_kind,
      'bytes', p_file_size_bytes,
      'storage_bucket', p_storage_bucket
    )
  );
  perform public.media_audit_write(
    'gallery_asset_uploaded', 'media_asset', row.external_id, true,
    jsonb_build_object(
      'workspace_id', workspace,
      'storage_bucket', p_storage_bucket
    )
  );
  return row;
end;
$$;

revoke all on function public.media_gallery_register_asset(text, text, text, text, text, text, text, bigint, text, text, integer, integer, text, text) from public;
grant execute on function public.media_gallery_register_asset(text, text, text, text, text, text, text, bigint, text, text, integer, integer, text, text) to authenticated;
