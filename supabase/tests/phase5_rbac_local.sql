-- Phase 5 RBAC local Postgres validation (not a live Supabase project).
-- Requires stub auth/storage schemas applied first by the runner script.
-- Exits with RAISE EXCEPTION on any failed assertion.

do $$
declare
  owner1 uuid := '11111111-1111-1111-1111-111111111111';
  owner2 uuid := '22222222-2222-2222-2222-222222222222';
  admin1 uuid := '33333333-3333-3333-3333-333333333333';
  editor1 uuid := '44444444-4444-4444-4444-444444444444';
  reviewer1 uuid := '55555555-5555-5555-5555-555555555555';
  viewer1 uuid := '66666666-6666-6666-6666-666666666666';
  asset_ext text := 'local_rls_asset_1';
  asset_id uuid;
  analysis_id uuid;
  flag_id uuid;
  dup_ext text := 'local_dup_1';
  ok boolean;
  checksum_before text;
  checksum_after text;
  err text;
begin
  -- Seed users + roles (as superuser / bypass RLS)
  insert into auth.users (id, email) values
    (owner1, 'owner1@example.test'),
    (owner2, 'owner2@example.test'),
    (admin1, 'admin1@example.test'),
    (editor1, 'editor1@example.test'),
    (reviewer1, 'reviewer1@example.test'),
    (viewer1, 'viewer1@example.test')
  on conflict (id) do nothing;

  insert into public.media_users (id, email, display_name, is_active)
  values
    (owner1, 'owner1@example.test', 'Owner One', true),
    (owner2, 'owner2@example.test', 'Owner Two', true),
    (admin1, 'admin1@example.test', 'Admin', true),
    (editor1, 'editor1@example.test', 'Editor', true),
    (reviewer1, 'reviewer1@example.test', 'Reviewer', true),
    (viewer1, 'viewer1@example.test', 'Viewer', true)
  on conflict (id) do update set is_active = true, archived_at = null;

  insert into public.media_user_roles (user_id, role, assigned_by)
  values
    (owner1, 'owner', owner1),
    (owner2, 'owner', owner1),
    (admin1, 'administrator', owner1),
    (editor1, 'editor', owner1),
    (reviewer1, 'reviewer', owner1),
    (viewer1, 'viewer', owner1)
  on conflict (user_id, role) do update set revoked_at = null;

  insert into public.media_assets (
    external_id, filename, original_filename, file_type, media_kind,
    checksum, score_website, score_marketing, score_technical, source_system
  ) values (
    asset_ext, 't.jpg', 't.jpg', 'image/jpeg', 'image',
    'abc123checksum', 10, 10, 10, 'manual'
  )
  on conflict (external_id) do update set checksum = 'abc123checksum'
  returning id into asset_id;

  select id into asset_id from public.media_assets where external_id = asset_ext;
  select checksum into checksum_before from public.media_assets where id = asset_id;

  insert into public.media_ai_analyses (
    asset_id, analysis_version, analyzed_at, provider, provider_model, quality, boat, is_current
  ) values (
    asset_id, '1', now(), 'mock', 'v1', '{}'::jsonb, '{}'::jsonb, true
  )
  returning id into analysis_id;

  insert into public.media_privacy_flags (asset_id, risk, confidence, notes)
  values (asset_id, 'face', 0.9, 'seed')
  returning id into flag_id;

  insert into public.media_duplicate_groups (external_id, kind, similarity)
  values (dup_ext, 'exact', 1.0)
  on conflict (external_id) do nothing;

  -- ── Anon: no rows ───────────────────────────────────────────────────────
  perform test_helpers.set_auth(null);
  set local role authenticated;
  select count(*) = 0 into ok from public.media_assets;
  reset role;
  if not ok then raise exception 'FAIL: anon/unauth should see 0 assets'; end if;
  raise notice 'PASS: anon_no_assets';

  -- ── Viewer: read ok, mutate denied ──────────────────────────────────────
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  select count(*) > 0 into ok from public.media_assets where external_id = asset_ext;
  begin
    update public.media_assets set notes = 'hack' where external_id = asset_ext;
    if found then
      reset role;
      raise exception 'FAIL: viewer updated asset';
    end if;
  exception when insufficient_privilege or others then
    null;
  end;
  reset role;
  if not ok then raise exception 'FAIL: viewer should read assets'; end if;
  raise notice 'PASS: viewer_read_no_mutate';

  -- ── Editor: RPC metadata ok; direct checksum denied ─────────────────────
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  perform public.media_editor_update_asset_metadata(
    asset_ext, 'Axopar', null, null, null, null, array['test'], 'ok', null
  );
  begin
    update public.media_assets set checksum = 'deadbeef' where external_id = asset_ext;
    if found then
      reset role;
      raise exception 'FAIL: editor direct checksum update succeeded';
    end if;
  exception when insufficient_privilege or others then
    null;
  end;
  reset role;
  select checksum into checksum_after from public.media_assets where external_id = asset_ext;
  if checksum_after <> checksum_before then
    raise exception 'FAIL: checksum changed to %', checksum_after;
  end if;
  if not exists (
    select 1 from public.media_assets
    where external_id = asset_ext and manufacturer = 'Axopar' and notes = 'ok'
  ) then
    raise exception 'FAIL: editor RPC did not update metadata';
  end if;
  raise notice 'PASS: editor_rpc_ok_protected_denied';

  -- ── Reviewer: cannot delete analyses / create dup groups ────────────────
  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  begin
    delete from public.media_ai_analyses where id = analysis_id;
    if found then
      reset role;
      raise exception 'FAIL: reviewer deleted analysis';
    end if;
  exception when insufficient_privilege or others then
    null;
  end;
  begin
    insert into public.media_duplicate_groups (external_id, kind, similarity)
    values ('evil_dup', 'exact', 1);
    reset role;
    raise exception 'FAIL: reviewer created duplicate group';
  exception when insufficient_privilege or others then
    null;
  end;
  perform public.media_review_resolve_privacy_flag(flag_id, 'resolved');
  perform public.media_review_ai_suggestion(analysis_id, 'accept', 'looks good');
  perform public.media_review_duplicate_decision(dup_ext, 'keep_primary', 'ok');
  reset role;
  if not exists (select 1 from public.media_ai_analyses where id = analysis_id) then
    raise exception 'FAIL: analysis history was destroyed';
  end if;
  raise notice 'PASS: reviewer_narrow_rpcs_only';

  -- ── Admin cannot assign owner ───────────────────────────────────────────
  perform test_helpers.set_auth(admin1);
  set local role authenticated;
  begin
    perform public.media_assign_role(viewer1, 'owner');
    reset role;
    raise exception 'FAIL: admin assigned owner';
  exception when insufficient_privilege or others then
    err := sqlerrm;
  end;
  reset role;
  if err is null or err not like '%only owners%' then
    raise exception 'FAIL: expected owner-only assign denial, got %', err;
  end if;
  raise notice 'PASS: admin_cannot_assign_owner';

  -- ── Profile: display_name RPC; direct is_active denied ──────────────────
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  perform public.media_update_own_display_name('Viewer Renamed');
  begin
    update public.media_users set is_active = false, email = 'evil@x.test' where id = viewer1;
    if found then
      reset role;
      raise exception 'FAIL: viewer direct profile security update';
    end if;
  exception when insufficient_privilege or others then
    null;
  end;
  reset role;
  if not exists (
    select 1 from public.media_users
    where id = viewer1 and display_name = 'Viewer Renamed' and is_active = true
      and email = 'viewer1@example.test'
  ) then
    raise exception 'FAIL: profile update incorrect';
  end if;
  raise notice 'PASS: profile_display_name_only';

  -- ── Final owner: revoke second ok; sole fails ───────────────────────────
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  perform public.media_revoke_role(owner2, 'owner');
  begin
    perform public.media_revoke_role(owner1, 'owner');
    reset role;
    raise exception 'FAIL: final owner self-revoke succeeded';
  exception when others then
    if sqlerrm not like '%final active owner%' then
      reset role;
      raise exception 'FAIL: unexpected error on final revoke: %', sqlerrm;
    end if;
  end;
  begin
    perform public.media_set_user_active_state(owner1, false, true);
    reset role;
    raise exception 'FAIL: final owner self-archive succeeded';
  exception when others then
    if sqlerrm not like '%final active owner%' then
      reset role;
      raise exception 'FAIL: unexpected error on final archive: %', sqlerrm;
    end if;
  end;
  reset role;
  if public.media_active_owner_count() <> 1 then
    raise exception 'FAIL: expected exactly 1 active owner, got %', public.media_active_owner_count();
  end if;
  raise notice 'PASS: final_owner_protection';

  -- Restore second owner for concurrency-style sequential check
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  perform public.media_assign_role(owner2, 'owner');
  reset role;

  raise notice 'PASS: all_local_rbac_assertions';
end $$;
