-- Phase 6 — RLS for publication tables
-- Staff may read. Mutations are role-gated; live publish remains owner-only via app RPCs later.

alter table public.media_publication_jobs enable row level security;
alter table public.media_publication_drafts enable row level security;
alter table public.media_publication_events enable row level security;

drop policy if exists media_pub_jobs_select on public.media_publication_jobs;
create policy media_pub_jobs_select on public.media_publication_jobs
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_pub_jobs_insert on public.media_publication_jobs;
create policy media_pub_jobs_insert on public.media_publication_jobs
  for insert to authenticated
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
  );

drop policy if exists media_pub_jobs_update on public.media_publication_jobs;
create policy media_pub_jobs_update on public.media_publication_jobs
  for update to authenticated
  using (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
  )
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
  );

-- Viewers/reviewers: no direct DML. Reviewers may read via select.
-- Owners/admins/editors: insert/update as above. Delete restricted to owner.
drop policy if exists media_pub_jobs_delete on public.media_publication_jobs;
create policy media_pub_jobs_delete on public.media_publication_jobs
  for delete to authenticated
  using (public.media_has_role('owner'::public.media_role));

drop policy if exists media_pub_drafts_select on public.media_publication_drafts;
create policy media_pub_drafts_select on public.media_publication_drafts
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_pub_drafts_write on public.media_publication_drafts;
create policy media_pub_drafts_write on public.media_publication_drafts
  for all to authenticated
  using (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
  )
  with check (
    public.media_has_role('owner'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('editor'::public.media_role)
  );

drop policy if exists media_pub_events_select on public.media_publication_events;
create policy media_pub_events_select on public.media_publication_events
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_pub_events_insert on public.media_publication_events;
create policy media_pub_events_insert on public.media_publication_events
  for insert to authenticated
  with check (public.media_is_staff());

-- Defense in depth: viewers/reviewers cannot mutate publication jobs via grants.
revoke insert, update, delete on public.media_publication_jobs from anon;
revoke insert, update, delete on public.media_publication_drafts from anon;
revoke insert, update, delete on public.media_publication_events from anon;
