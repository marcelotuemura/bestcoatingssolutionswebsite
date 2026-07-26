-- Phase 7 gallery authority — mutation flag, grants, denial triggers.

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
    'gallery_mutation'
  ) then
    raise exception 'invalid mutation flag' using errcode = '22023';
  end if;
  perform set_config('media.mutation_flag', p_flag, true);
end;
$$;

revoke all on function public.media_set_mutation_flag(text) from public;

revoke all on table public.media_workspace_members from public;
revoke all on table public.media_collections from public;
revoke all on table public.media_collection_assets from public;
revoke all on table public.media_favorites from public;
revoke all on table public.media_gallery_events from public;

revoke insert, update, delete on public.media_workspace_members from anon, authenticated;
revoke insert, update, delete on public.media_collections from anon, authenticated;
revoke insert, update, delete on public.media_collection_assets from anon, authenticated;
revoke insert, update, delete on public.media_favorites from anon, authenticated;
revoke insert, update, delete on public.media_gallery_events from anon, authenticated;

grant select on public.media_workspace_members to authenticated;
grant select on public.media_collections to authenticated;
grant select on public.media_collection_assets to authenticated;
grant select on public.media_favorites to authenticated;
grant select on public.media_gallery_events to authenticated;

alter table public.media_workspace_members force row level security;
alter table public.media_collections force row level security;
alter table public.media_collection_assets force row level security;
alter table public.media_favorites force row level security;
alter table public.media_gallery_events force row level security;

create or replace function public.media_enforce_gallery_mutation()
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
  if flag = 'gallery_mutation' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  raise exception 'permission denied for gallery tables'
    using errcode = '42501';
end;
$$;

drop trigger if exists media_workspace_members_enforce on public.media_workspace_members;
create trigger media_workspace_members_enforce
  before insert or update or delete on public.media_workspace_members
  for each row execute function public.media_enforce_gallery_mutation();

drop trigger if exists media_collections_enforce on public.media_collections;
create trigger media_collections_enforce
  before insert or update or delete on public.media_collections
  for each row execute function public.media_enforce_gallery_mutation();

drop trigger if exists media_collection_assets_enforce on public.media_collection_assets;
create trigger media_collection_assets_enforce
  before insert or update or delete on public.media_collection_assets
  for each row execute function public.media_enforce_gallery_mutation();

drop trigger if exists media_favorites_enforce on public.media_favorites;
create trigger media_favorites_enforce
  before insert or update or delete on public.media_favorites
  for each row execute function public.media_enforce_gallery_mutation();

drop trigger if exists media_gallery_events_enforce on public.media_gallery_events;
create trigger media_gallery_events_enforce
  before insert or update or delete on public.media_gallery_events
  for each row execute function public.media_enforce_gallery_mutation();

create or replace function public.media_gallery_append_event(
  p_workspace_id text,
  p_actor uuid,
  p_action text,
  p_asset_external_id text default null,
  p_collection_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(p_metadata::text, '') ~* '(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl|service_role)' then
    raise exception 'signed URLs or secrets must not be persisted'
      using errcode = '22023';
  end if;
  perform public.media_set_mutation_flag('gallery_mutation');
  insert into public.media_gallery_events (
    workspace_id, actor_id, action, asset_external_id, collection_id, metadata
  ) values (
    coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default'),
    p_actor, p_action, p_asset_external_id, p_collection_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.media_gallery_append_event(text, uuid, text, text, uuid, jsonb) from public;

create or replace function public.media_gallery_require_member(p_workspace_id text)
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

revoke all on function public.media_gallery_require_member(text) from public;

create or replace function public.media_gallery_require_can_edit()
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
    raise exception 'permission denied: gallery edit'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_gallery_require_can_edit() from public;

create or replace function public.media_gallery_require_can_review()
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
    raise exception 'permission denied: gallery review'
      using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke all on function public.media_gallery_require_can_review() from public;
