-- Phase 5 — Row Level Security for all DAMS tables
-- Unauthenticated users receive no rows. Mutations are role-gated.

alter table public.media_users enable row level security;
alter table public.media_user_roles enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_asset_derivatives enable row level security;
alter table public.media_projects enable row level security;
alter table public.media_project_assets enable row level security;
alter table public.media_ai_analyses enable row level security;
alter table public.media_ai_detections enable row level security;
alter table public.media_privacy_flags enable row level security;
alter table public.media_duplicate_groups enable row level security;
alter table public.media_duplicate_members enable row level security;
alter table public.media_ingestion_runs enable row level security;
alter table public.media_analysis_runs enable row level security;
alter table public.media_audit_events enable row level security;

-- Deny-by-default: no policies for anon.

-- ── media_users ────────────────────────────────────────────────────────────
drop policy if exists media_users_select on public.media_users;
create policy media_users_select on public.media_users
  for select to authenticated
  using (
    id = auth.uid()
    or public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_users_update_self on public.media_users;
-- Direct self-update removed — use media_update_own_display_name RPC (003).
-- Owners may still update profiles via controlled admin path after 003.

drop policy if exists media_users_insert_owner on public.media_users;
create policy media_users_insert_owner on public.media_users
  for insert to authenticated
  with check (public.media_has_role('owner'));

-- ── media_user_roles ───────────────────────────────────────────────────────
drop policy if exists media_user_roles_select on public.media_user_roles;
create policy media_user_roles_select on public.media_user_roles
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

-- Role mutations are RPC-only (media_assign_role / media_revoke_role in 003).
drop policy if exists media_user_roles_mutate_owner on public.media_user_roles;

-- ── Read policies for staff ────────────────────────────────────────────────
drop policy if exists media_assets_select on public.media_assets;
create policy media_assets_select on public.media_assets
  for select to authenticated
  using (public.media_is_staff() and archived_at is null);

drop policy if exists media_assets_write_admin on public.media_assets;
create policy media_assets_write_admin on public.media_assets
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_deriv_select on public.media_asset_derivatives;
create policy media_deriv_select on public.media_asset_derivatives
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_deriv_write on public.media_asset_derivatives;
create policy media_deriv_write on public.media_asset_derivatives
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_projects_select on public.media_projects;
create policy media_projects_select on public.media_projects
  for select to authenticated
  using (public.media_is_staff() and archived_at is null);

drop policy if exists media_projects_write on public.media_projects;
create policy media_projects_write on public.media_projects
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_project_assets_select on public.media_project_assets;
create policy media_project_assets_select on public.media_project_assets
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_project_assets_write on public.media_project_assets;
create policy media_project_assets_write on public.media_project_assets
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

-- AI: staff read; only owner/admin may write analysis records (reviewers use RPCs).
drop policy if exists media_ai_select on public.media_ai_analyses;
create policy media_ai_select on public.media_ai_analyses
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_ai_write on public.media_ai_analyses;
create policy media_ai_write on public.media_ai_analyses
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_ai_det_select on public.media_ai_detections;
create policy media_ai_det_select on public.media_ai_detections
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_ai_det_write on public.media_ai_detections;
create policy media_ai_det_write on public.media_ai_detections
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_privacy_select on public.media_privacy_flags;
create policy media_privacy_select on public.media_privacy_flags
  for select to authenticated
  using (public.media_is_staff());

-- Privacy mutations are admin write + reviewer resolve RPC (003).
drop policy if exists media_privacy_review on public.media_privacy_flags;
drop policy if exists media_privacy_insert on public.media_privacy_flags;
create policy media_privacy_write on public.media_privacy_flags
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

-- Duplicates: staff read; create/delete admin-only; decisions via RPC (003).
drop policy if exists media_dup_select on public.media_duplicate_groups;
create policy media_dup_select on public.media_duplicate_groups
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_dup_write on public.media_duplicate_groups;
create policy media_dup_write on public.media_duplicate_groups
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_dup_mem_select on public.media_duplicate_members;
create policy media_dup_mem_select on public.media_duplicate_members
  for select to authenticated
  using (public.media_is_staff());

drop policy if exists media_dup_mem_write on public.media_duplicate_members;
create policy media_dup_mem_write on public.media_duplicate_members
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

-- Runs: admin+
drop policy if exists media_ingest_select on public.media_ingestion_runs;
create policy media_ingest_select on public.media_ingestion_runs
  for select to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_ingest_write on public.media_ingestion_runs;
create policy media_ingest_write on public.media_ingestion_runs
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_analysis_run_select on public.media_analysis_runs;
create policy media_analysis_run_select on public.media_analysis_runs
  for select to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
    or public.media_has_role('reviewer')
  );

drop policy if exists media_analysis_run_write on public.media_analysis_runs;
create policy media_analysis_run_write on public.media_analysis_runs
  for all to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  )
  with check (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

-- Audit: staff can read; inserts via service role / security definer preferred
drop policy if exists media_audit_select on public.media_audit_events;
create policy media_audit_select on public.media_audit_events
  for select to authenticated
  using (
    public.media_has_role('owner')
    or public.media_has_role('administrator')
  );

drop policy if exists media_audit_insert on public.media_audit_events;
create policy media_audit_insert on public.media_audit_events
  for insert to authenticated
  with check (public.media_is_staff());

-- Editors MUST NOT have direct UPDATE on media_assets.
-- Use media_editor_update_asset_metadata (003) for column-limited edits.
drop policy if exists media_assets_editor_update on public.media_assets;
