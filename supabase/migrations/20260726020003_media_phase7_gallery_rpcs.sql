-- Phase 7 gallery SECURITY DEFINER RPCs

create or replace function public.media_gallery_ensure_own_membership(
  p_workspace_id text default 'bcs-default'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
begin
  if not public.media_is_staff() then
    raise exception 'permission denied: workspace membership'
      using errcode = '42501';
  end if;
  if workspace <> 'bcs-default'
    and not (
      public.media_has_role('owner'::public.media_role)
      or public.media_has_role('administrator'::public.media_role)
    )
  then
    raise exception 'permission denied: non-default workspace membership'
      using errcode = '42501';
  end if;
  perform public.media_set_mutation_flag('gallery_mutation');
  insert into public.media_workspace_members (workspace_id, user_id, is_active)
  values (workspace, uid, true)
  on conflict (workspace_id, user_id) do update set is_active = true;
end;
$$;

revoke all on function public.media_gallery_ensure_own_membership(text) from public;
grant execute on function public.media_gallery_ensure_own_membership(text) to authenticated;

-- Register an uploaded asset after private storage write (server-side).
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
  if p_storage_object_key is null
    or p_storage_object_key ~ '^(/|[A-Za-z]:)'
    or p_storage_object_key ~* '(https?:|X-Amz-Signature|signedUrl)'
  then
    raise exception 'invalid storage object key' using errcode = '22023';
  end if;

  -- Exact duplicate feedback by checksum
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
  -- Asset inserts still need service/admin path: use editor_metadata? No —
  -- assets are protected by media_enforce_assets_mutation. Use service flag
  -- pattern: set gallery_mutation is NOT enough for media_assets.
  -- Call via elevated asset write using existing service context OR
  -- temporarily use media_set_mutation_flag that assets accept.
  -- Phase 5 assets accept service_context only (or specific flags).
  -- For upload RPC we use service_role-like path: set request role service? 
  -- Safer: insert using flag that assets allow — check media_enforce_assets_mutation.
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
    jsonb_build_object('media_kind', p_media_kind, 'bytes', p_file_size_bytes)
  );
  perform public.media_audit_write(
    'gallery_asset_uploaded', 'media_asset', row.external_id, true,
    jsonb_build_object('workspace_id', workspace)
  );
  return row;
end;
$$;

revoke all on function public.media_gallery_register_asset(text, text, text, text, text, text, text, bigint, text, text, integer, integer, text, text) from public;
grant execute on function public.media_gallery_register_asset(text, text, text, text, text, text, text, bigint, text, text, integer, integer, text, text) to authenticated;

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
  actor uuid := public.media_gallery_require_can_edit();
  asset public.media_assets;
  der public.media_asset_derivatives;
begin
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

revoke all on function public.media_gallery_register_derivative(text, text, integer, text, text, text, bigint, text) from public;
grant execute on function public.media_gallery_register_derivative(text, text, integer, text, text, text, bigint, text) to authenticated;

create or replace function public.media_gallery_update_metadata(
  p_asset_external_id text,
  p_display_title text default null,
  p_description text default null,
  p_tags text[] default null,
  p_project_name text default null,
  p_vessel text default null,
  p_location text default null,
  p_creator_name text default null,
  p_capture_date timestamptz default null,
  p_customer_notes text default null,
  p_internal_notes text default null
)
returns public.media_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_edit();
  asset public.media_assets;
begin
  select * into asset from public.media_assets where external_id = p_asset_external_id for update;
  if not found then
    raise exception 'asset not found' using errcode = 'P0002';
  end if;
  perform public.media_gallery_require_member(asset.workspace_id);

  perform public.media_set_mutation_flag('editor_metadata');
  update public.media_assets
  set
    display_title = coalesce(p_display_title, display_title),
    description = coalesce(p_description, description),
    keywords = coalesce(p_tags, keywords),
    project_name = coalesce(p_project_name, project_name),
    boat_name = coalesce(p_vessel, boat_name),
    location = coalesce(p_location, location),
    creator_name = coalesce(p_creator_name, creator_name),
    capture_date = coalesce(p_capture_date, capture_date),
    customer_notes = coalesce(p_customer_notes, customer_notes),
    notes = coalesce(p_internal_notes, notes),
    updated_at = now()
  where id = asset.id
  returning * into asset;

  perform public.media_gallery_append_event(
    asset.workspace_id, actor, 'metadata_updated', asset.external_id, null,
    jsonb_build_object('fields', 'gallery_metadata')
  );
  return asset;
end;
$$;

revoke all on function public.media_gallery_update_metadata(text, text, text, text[], text, text, text, text, timestamptz, text, text) from public;
grant execute on function public.media_gallery_update_metadata(text, text, text, text[], text, text, text, text, timestamptz, text, text) to authenticated;

create or replace function public.media_gallery_set_favorite(
  p_asset_external_id text,
  p_favorite boolean,
  p_workspace_id text default 'bcs-default'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid;
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
begin
  perform public.media_gallery_ensure_own_membership(workspace);
  actor := public.media_gallery_require_member(workspace);

  if not exists (
    select 1 from public.media_assets a
    where a.external_id = p_asset_external_id
      and a.workspace_id = workspace
  ) then
    raise exception 'asset not found in workspace' using errcode = 'P0002';
  end if;

  perform public.media_set_mutation_flag('gallery_mutation');
  if p_favorite then
    insert into public.media_favorites (workspace_id, user_id, asset_external_id)
    values (workspace, actor, p_asset_external_id)
    on conflict do nothing;
    perform public.media_gallery_append_event(
      workspace, actor, 'favorite_added', p_asset_external_id, null, '{}'::jsonb
    );
  else
    delete from public.media_favorites
    where workspace_id = workspace
      and user_id = actor
      and asset_external_id = p_asset_external_id;
    perform public.media_gallery_append_event(
      workspace, actor, 'favorite_removed', p_asset_external_id, null, '{}'::jsonb
    );
  end if;
end;
$$;

revoke all on function public.media_gallery_set_favorite(text, boolean, text) from public;
grant execute on function public.media_gallery_set_favorite(text, boolean, text) to authenticated;

create or replace function public.media_gallery_create_collection(
  p_workspace_id text,
  p_name text,
  p_description text default ''
)
returns public.media_collections
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_edit();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
  row public.media_collections;
begin
  perform public.media_gallery_ensure_own_membership(workspace);
  perform public.media_gallery_require_member(workspace);
  perform public.media_set_mutation_flag('gallery_mutation');
  insert into public.media_collections (
    external_id, workspace_id, name, description, created_by, updated_by
  ) values (
    'col_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
    workspace, trim(p_name), coalesce(p_description, ''), actor, actor
  )
  returning * into row;
  perform public.media_gallery_append_event(
    workspace, actor, 'collection_created', null, row.id,
    jsonb_build_object('name', row.name)
  );
  return row;
end;
$$;

revoke all on function public.media_gallery_create_collection(text, text, text) from public;
grant execute on function public.media_gallery_create_collection(text, text, text) to authenticated;

create or replace function public.media_gallery_update_collection(
  p_collection_id uuid,
  p_name text default null,
  p_description text default null,
  p_cover_asset_external_id text default null,
  p_archive boolean default false
)
returns public.media_collections
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_edit();
  row public.media_collections;
begin
  select * into row from public.media_collections where id = p_collection_id for update;
  if not found then
    raise exception 'collection not found' using errcode = 'P0002';
  end if;
  perform public.media_gallery_require_member(row.workspace_id);
  perform public.media_set_mutation_flag('gallery_mutation');
  update public.media_collections
  set
    name = coalesce(nullif(trim(p_name), ''), name),
    description = coalesce(p_description, description),
    cover_asset_external_id = coalesce(p_cover_asset_external_id, cover_asset_external_id),
    archived_at = case when p_archive then coalesce(archived_at, now()) else archived_at end,
    updated_by = actor,
    updated_at = now()
  where id = row.id
  returning * into row;
  perform public.media_gallery_append_event(
    row.workspace_id, actor, 'collection_updated', null, row.id, '{}'::jsonb
  );
  return row;
end;
$$;

revoke all on function public.media_gallery_update_collection(uuid, text, text, text, boolean) from public;
grant execute on function public.media_gallery_update_collection(uuid, text, text, text, boolean) to authenticated;

create or replace function public.media_gallery_collection_set_assets(
  p_collection_id uuid,
  p_asset_external_ids text[],
  p_mode text default 'add'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_edit();
  col public.media_collections;
  asset_id text;
  changed integer := 0;
begin
  if p_mode not in ('add', 'remove') then
    raise exception 'invalid mode' using errcode = '22023';
  end if;
  select * into col from public.media_collections where id = p_collection_id for update;
  if not found then
    raise exception 'collection not found' using errcode = 'P0002';
  end if;
  perform public.media_gallery_require_member(col.workspace_id);
  perform public.media_set_mutation_flag('gallery_mutation');

  foreach asset_id in array coalesce(p_asset_external_ids, '{}'::text[])
  loop
    if not exists (
      select 1 from public.media_assets a
      where a.external_id = asset_id and a.workspace_id = col.workspace_id
    ) then
      raise exception 'asset % not in workspace', asset_id using errcode = 'P0002';
    end if;
    if p_mode = 'add' then
      insert into public.media_collection_assets (collection_id, asset_external_id, added_by)
      values (col.id, asset_id, actor)
      on conflict do nothing;
      if found then changed := changed + 1; end if;
    else
      delete from public.media_collection_assets
      where collection_id = col.id and asset_external_id = asset_id;
      changed := changed + 1;
    end if;
  end loop;

  perform public.media_gallery_append_event(
    col.workspace_id, actor, 'collection_assets_' || p_mode, null, col.id,
    jsonb_build_object('count', changed)
  );
  return changed;
end;
$$;

revoke all on function public.media_gallery_collection_set_assets(uuid, text[], text) from public;
grant execute on function public.media_gallery_collection_set_assets(uuid, text[], text) to authenticated;

create or replace function public.media_gallery_archive_assets(
  p_asset_external_ids text[],
  p_workspace_id text default 'bcs-default'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_edit();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
  n integer;
begin
  perform public.media_gallery_require_member(workspace);
  perform public.media_set_mutation_flag('editor_metadata');
  update public.media_assets
  set archived_at = now(), updated_at = now()
  where workspace_id = workspace
    and external_id = any (p_asset_external_ids)
    and archived_at is null;
  get diagnostics n = row_count;
  perform public.media_gallery_append_event(
    workspace, actor, 'assets_archived', null, null,
    jsonb_build_object('count', n)
  );
  return n;
end;
$$;

revoke all on function public.media_gallery_archive_assets(text[], text) from public;
grant execute on function public.media_gallery_archive_assets(text[], text) to authenticated;

create or replace function public.media_gallery_submit_for_review(
  p_asset_external_ids text[],
  p_workspace_id text default 'bcs-default'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_edit();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
  n integer;
begin
  perform public.media_gallery_require_member(workspace);
  perform public.media_set_mutation_flag('editor_metadata');
  update public.media_assets
  set review_status = 'pending', updated_at = now()
  where workspace_id = workspace
    and external_id = any (p_asset_external_ids)
    and privacy_status = 'clear'
    and archived_at is null;
  get diagnostics n = row_count;
  perform public.media_gallery_append_event(
    workspace, actor, 'assets_submitted_review', null, null,
    jsonb_build_object('count', n)
  );
  return n;
end;
$$;

revoke all on function public.media_gallery_submit_for_review(text[], text) from public;
grant execute on function public.media_gallery_submit_for_review(text[], text) to authenticated;

create or replace function public.media_gallery_review_asset(
  p_asset_external_id text,
  p_decision text,
  p_notes text default ''
)
returns public.media_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_review();
  asset public.media_assets;
  next_status text;
begin
  if p_decision not in ('approve', 'reject', 'in_review') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;
  select * into asset from public.media_assets where external_id = p_asset_external_id for update;
  if not found then
    raise exception 'asset not found' using errcode = 'P0002';
  end if;
  perform public.media_gallery_require_member(asset.workspace_id);
  next_status := case p_decision
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    else 'in_review'
  end;
  perform public.media_set_mutation_flag('editor_metadata');
  update public.media_assets
  set review_status = next_status, updated_at = now()
  where id = asset.id
  returning * into asset;
  perform public.media_gallery_append_event(
    asset.workspace_id, actor, 'asset_reviewed', asset.external_id, null,
    jsonb_build_object('decision', p_decision, 'notes', left(coalesce(p_notes, ''), 200))
  );
  return asset;
end;
$$;

revoke all on function public.media_gallery_review_asset(text, text, text) from public;
grant execute on function public.media_gallery_review_asset(text, text, text) to authenticated;
