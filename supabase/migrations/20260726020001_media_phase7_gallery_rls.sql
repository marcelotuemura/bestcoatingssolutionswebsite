-- Phase 7 gallery RLS — SELECT for workspace members; mutations via RPCs.

create or replace function public.media_is_workspace_member(p_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and public.media_is_staff()
    and exists (
      select 1
      from public.media_workspace_members m
      where m.workspace_id = coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default')
        and m.user_id = auth.uid()
        and m.is_active = true
    );
$$;

revoke all on function public.media_is_workspace_member(text) from public;
grant execute on function public.media_is_workspace_member(text) to authenticated;

alter table public.media_workspace_members enable row level security;
alter table public.media_collections enable row level security;
alter table public.media_collection_assets enable row level security;
alter table public.media_favorites enable row level security;
alter table public.media_gallery_events enable row level security;

drop policy if exists media_workspace_members_select on public.media_workspace_members;
create policy media_workspace_members_select on public.media_workspace_members
  for select to authenticated
  using (user_id = auth.uid() or public.media_is_owner_or_admin());

drop policy if exists media_collections_select on public.media_collections;
create policy media_collections_select on public.media_collections
  for select to authenticated
  using (public.media_is_workspace_member(workspace_id));

drop policy if exists media_collection_assets_select on public.media_collection_assets;
create policy media_collection_assets_select on public.media_collection_assets
  for select to authenticated
  using (
    exists (
      select 1 from public.media_collections c
      where c.id = media_collection_assets.collection_id
        and public.media_is_workspace_member(c.workspace_id)
    )
  );

drop policy if exists media_favorites_select on public.media_favorites;
create policy media_favorites_select on public.media_favorites
  for select to authenticated
  using (
    user_id = auth.uid()
    and public.media_is_workspace_member(workspace_id)
  );

drop policy if exists media_gallery_events_select on public.media_gallery_events;
create policy media_gallery_events_select on public.media_gallery_events
  for select to authenticated
  using (public.media_is_workspace_member(workspace_id));

-- Tighten asset reads to workspace membership when membership rows exist.
drop policy if exists media_assets_select on public.media_assets;
create policy media_assets_select on public.media_assets
  for select to authenticated
  using (
    public.media_is_staff()
    and (
      not exists (
        select 1
        from public.media_workspace_members m
        where m.user_id = auth.uid()
          and m.is_active = true
      )
      or public.media_is_workspace_member(workspace_id)
    )
  );
