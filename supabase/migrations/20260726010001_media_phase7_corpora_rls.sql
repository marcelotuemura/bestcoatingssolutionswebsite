-- Phase 7: RLS for training corpora (SELECT for workspace members; mutations via RPCs).

alter table public.media_corpora enable row level security;
alter table public.media_corpus_versions enable row level security;
alter table public.media_corpus_items enable row level security;
alter table public.media_corpus_item_labels enable row level security;
alter table public.media_corpus_reviews enable row level security;
alter table public.media_corpus_events enable row level security;
alter table public.media_corpus_exports enable row level security;

-- Workspace membership helper (Phase 7). Staff must be an active member row.
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

drop policy if exists media_corpora_select on public.media_corpora;
create policy media_corpora_select on public.media_corpora
  for select to authenticated
  using (public.media_is_workspace_member(workspace_id));

drop policy if exists media_corpus_versions_select on public.media_corpus_versions;
create policy media_corpus_versions_select on public.media_corpus_versions
  for select to authenticated
  using (
    exists (
      select 1
      from public.media_corpora c
      where c.id = media_corpus_versions.corpus_id
        and public.media_is_workspace_member(c.workspace_id)
    )
  );

drop policy if exists media_corpus_items_select on public.media_corpus_items;
create policy media_corpus_items_select on public.media_corpus_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.media_corpus_versions v
      join public.media_corpora c on c.id = v.corpus_id
      where v.id = media_corpus_items.version_id
        and public.media_is_workspace_member(c.workspace_id)
    )
  );

drop policy if exists media_corpus_item_labels_select on public.media_corpus_item_labels;
create policy media_corpus_item_labels_select on public.media_corpus_item_labels
  for select to authenticated
  using (
    exists (
      select 1
      from public.media_corpus_items i
      join public.media_corpus_versions v on v.id = i.version_id
      join public.media_corpora c on c.id = v.corpus_id
      where i.id = media_corpus_item_labels.item_id
        and public.media_is_workspace_member(c.workspace_id)
    )
  );

drop policy if exists media_corpus_reviews_select on public.media_corpus_reviews;
create policy media_corpus_reviews_select on public.media_corpus_reviews
  for select to authenticated
  using (
    exists (
      select 1
      from public.media_corpus_items i
      join public.media_corpus_versions v on v.id = i.version_id
      join public.media_corpora c on c.id = v.corpus_id
      where i.id = media_corpus_reviews.item_id
        and public.media_is_workspace_member(c.workspace_id)
    )
  );

drop policy if exists media_corpus_events_select on public.media_corpus_events;
create policy media_corpus_events_select on public.media_corpus_events
  for select to authenticated
  using (
    (
      media_corpus_events.corpus_id is not null
      and exists (
        select 1
        from public.media_corpora c
        where c.id = media_corpus_events.corpus_id
          and public.media_is_workspace_member(c.workspace_id)
      )
    )
    or (
      media_corpus_events.version_id is not null
      and exists (
        select 1
        from public.media_corpus_versions v
        join public.media_corpora c on c.id = v.corpus_id
        where v.id = media_corpus_events.version_id
          and public.media_is_workspace_member(c.workspace_id)
      )
    )
  );

drop policy if exists media_corpus_exports_select on public.media_corpus_exports;
create policy media_corpus_exports_select on public.media_corpus_exports
  for select to authenticated
  using (
    exists (
      select 1
      from public.media_corpus_versions v
      join public.media_corpora c on c.id = v.corpus_id
      where v.id = media_corpus_exports.version_id
        and public.media_is_workspace_member(c.workspace_id)
    )
  );
