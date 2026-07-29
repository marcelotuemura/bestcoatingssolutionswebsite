-- Phase 2A inventory reviews — local Postgres RLS validation
-- (not a live Supabase project). Requires stub auth + phase5 users schema
-- and 20260729030000_media_phase2a_inventory_reviews.sql applied.
-- Exits with RAISE EXCEPTION on any failed assertion.

do $$
declare
  owner1 uuid := '11111111-1111-1111-1111-111111111111';
  admin1 uuid := '33333333-3333-3333-3333-333333333333';
  editor1 uuid := '44444444-4444-4444-4444-444444444444';
  reviewer1 uuid := '55555555-5555-5555-5555-555555555555';
  viewer1 uuid := '66666666-6666-6666-6666-666666666666';
  no_role uuid := '77777777-7777-7777-7777-777777777777';
  actor_id uuid;
  ok boolean;
  cnt int;
  updated_before timestamptz;
  updated_after timestamptz;
  pol_delete int;
begin
  -- Privileges for authenticated (RLS still gates)
  grant select, insert, update on public.media_inventory_reviews to authenticated;
  grant select on public.media_inventory_reviews to anon;
  -- No DELETE grant — and no DELETE policy either.
  revoke delete on public.media_inventory_reviews from anon, authenticated, public;
  alter table public.media_inventory_reviews force row level security;

  insert into auth.users (id, email) values
    (owner1, 'owner1@example.test'),
    (admin1, 'admin1@example.test'),
    (editor1, 'editor1@example.test'),
    (reviewer1, 'reviewer1@example.test'),
    (viewer1, 'viewer1@example.test'),
    (no_role, 'norole@example.test')
  on conflict (id) do nothing;

  insert into public.media_users (id, email, display_name, is_active)
  values
    (owner1, 'owner1@example.test', 'Owner One', true),
    (admin1, 'admin1@example.test', 'Admin', true),
    (editor1, 'editor1@example.test', 'Editor', true),
    (reviewer1, 'reviewer1@example.test', 'Reviewer', true),
    (viewer1, 'viewer1@example.test', 'Viewer', true),
    (no_role, 'norole@example.test', 'No Role', true)
  on conflict (id) do update set is_active = true, archived_at = null;

  insert into public.media_user_roles (user_id, role, assigned_by)
  values
    (owner1, 'owner', owner1),
    (admin1, 'administrator', owner1),
    (editor1, 'editor', owner1),
    (reviewer1, 'reviewer', owner1),
    (viewer1, 'viewer', owner1)
  on conflict (user_id, role) do update set revoked_at = null;

  -- Seed one review as table owner (bypass)
  insert into public.media_inventory_reviews (
    asset_id, project_slug, privacy_status, publish_status
  ) values (
    'seed-asset-1', 'formula', 'unchecked', 'not-published'
  )
  on conflict (asset_id) do update
    set privacy_status = 'unchecked', publish_status = 'not-published';

  -- RLS enabled
  select relrowsecurity into ok
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'media_inventory_reviews';
  if not ok then raise exception 'FAIL: RLS not enabled'; end if;
  raise notice 'PASS: rls_enabled';

  -- No DELETE policy
  select count(*) into pol_delete
  from pg_policies
  where schemaname = 'public'
    and tablename = 'media_inventory_reviews'
    and cmd = 'DELETE';
  if pol_delete <> 0 then raise exception 'FAIL: unexpected DELETE policy'; end if;
  raise notice 'PASS: no_delete_policy';

  -- Anon: no access
  perform test_helpers.set_auth(null);
  set local role anon;
  select count(*) into cnt from public.media_inventory_reviews;
  reset role;
  if cnt <> 0 then raise exception 'FAIL: anon should see 0 rows (got %)', cnt; end if;
  begin
    set local role anon;
    insert into public.media_inventory_reviews (asset_id, project_slug)
    values ('anon-insert', 'formula');
    reset role;
    raise exception 'FAIL: anon insert should not succeed';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    reset role;
  end;
  raise notice 'PASS: anon_denied';

  -- Authenticated without media roles: select denied (not staff)
  perform test_helpers.set_auth(no_role);
  set local role authenticated;
  select count(*) into cnt from public.media_inventory_reviews;
  reset role;
  if cnt <> 0 then raise exception 'FAIL: no-role auth should see 0'; end if;
  raise notice 'PASS: unauthenticated_staff_select_denied';

  -- Viewer (staff): SELECT ok, INSERT/UPDATE denied
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  select count(*) > 0 into ok from public.media_inventory_reviews;
  begin
    insert into public.media_inventory_reviews (asset_id, project_slug)
    values ('viewer-insert', 'formula');
    reset role;
    raise exception 'FAIL: viewer insert should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    update public.media_inventory_reviews
      set notes = 'viewer-hack' where asset_id = 'seed-asset-1';
    if found then
      reset role;
      raise exception 'FAIL: viewer update should be denied';
    end if;
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  if not ok then raise exception 'FAIL: viewer (staff) should SELECT'; end if;
  if exists (
    select 1 from public.media_inventory_reviews
    where asset_id = 'seed-asset-1' and notes = 'viewer-hack'
  ) then
    raise exception 'FAIL: viewer notes mutated';
  end if;
  raise notice 'PASS: viewer_select_no_write';

  -- Reviewer / editor / admin / owner write
  foreach actor_id in array array[
    reviewer1, editor1, admin1, owner1
  ] loop
    perform test_helpers.set_auth(actor_id);
    set local role authenticated;
    insert into public.media_inventory_reviews (
      asset_id, project_slug, privacy_status, notes
    ) values (
      'write-' || actor_id::text, 'bow-rider', 'unchecked', 'ok'
    )
    on conflict (asset_id) do update set notes = excluded.notes;
    update public.media_inventory_reviews
      set notes = 'updated-' || actor_id::text
      where asset_id = 'write-' || actor_id::text;
    reset role;
  end loop;
  raise notice 'PASS: reviewer_editor_admin_owner_write';

  -- Upsert on asset_id
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  insert into public.media_inventory_reviews (asset_id, project_slug, notes)
  values ('upsert-asset', 'hardtop-fiberglass-repair', 'first')
  on conflict (asset_id) do update set notes = excluded.notes;
  insert into public.media_inventory_reviews (asset_id, project_slug, notes)
  values ('upsert-asset', 'hardtop-fiberglass-repair', 'second')
  on conflict (asset_id) do update set notes = excluded.notes;
  select notes = 'second' into ok
  from public.media_inventory_reviews where asset_id = 'upsert-asset';
  select count(*) into cnt
  from public.media_inventory_reviews where asset_id = 'upsert-asset';
  reset role;
  if not ok or cnt <> 1 then raise exception 'FAIL: upsert on asset_id'; end if;
  raise notice 'PASS: upsert_asset_id';

  -- updated_at trigger
  select updated_at into updated_before
  from public.media_inventory_reviews where asset_id = 'upsert-asset';
  perform pg_sleep(0.05);
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  update public.media_inventory_reviews
    set caption = 'touched' where asset_id = 'upsert-asset';
  reset role;
  select updated_at into updated_after
  from public.media_inventory_reviews where asset_id = 'upsert-asset';
  if updated_after <= updated_before then
    raise exception 'FAIL: updated_at trigger did not advance';
  end if;
  raise notice 'PASS: updated_at_trigger';

  -- Idempotent re-apply of migration SQL statements that use IF NOT EXISTS / DROP POLICY IF EXISTS
  -- (runner also re-applies the migration file once more)

  raise notice 'PASS: all_phase2a_inventory_reviews_rls_assertions';
end $$;
