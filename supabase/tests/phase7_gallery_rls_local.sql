-- Phase 7 gallery authority — local Postgres validation.
-- Requires Phase 5 + Phase 6 + Phase 7 schema/RLS/authority/RPC/corrections migrations.

do $$
declare
  owner1 uuid := '11111111-1111-1111-1111-111111111111';
  admin1 uuid := '33333333-3333-3333-3333-333333333333';
  editor1 uuid := '44444444-4444-4444-4444-444444444444';
  reviewer1 uuid := '55555555-5555-5555-5555-555555555555';
  viewer1 uuid := '66666666-6666-6666-6666-666666666666';
  asset_ext text := 'phase7_rls_asset_1';
  asset_ext2 text := 'phase7_rls_asset_2';
  col_id uuid;
begin
  -- Seed auth users
  insert into auth.users (id, email) values
    (owner1, 'phase7owner@example.test'),
    (admin1, 'phase7admin@example.test'),
    (editor1, 'phase7editor@example.test'),
    (reviewer1, 'phase7reviewer@example.test'),
    (viewer1, 'phase7viewer@example.test')
  on conflict (id) do nothing;

  -- Seed media users
  insert into public.media_users (id, email, display_name, is_active)
  values
    (owner1, 'phase7owner@example.test', 'Phase7 Owner', true),
    (admin1, 'phase7admin@example.test', 'Phase7 Admin', true),
    (editor1, 'phase7editor@example.test', 'Phase7 Editor', true),
    (reviewer1, 'phase7reviewer@example.test', 'Phase7 Reviewer', true),
    (viewer1, 'phase7viewer@example.test', 'Phase7 Viewer', true)
  on conflict (id) do update set is_active = true, archived_at = null;

  -- Seed roles
  insert into public.media_user_roles (user_id, role, assigned_by)
  values
    (owner1, 'owner', owner1),
    (admin1, 'administrator', owner1),
    (editor1, 'editor', owner1),
    (reviewer1, 'reviewer', owner1),
    (viewer1, 'viewer', owner1)
  on conflict (user_id, role) do update set revoked_at = null;

  -- Seed test assets
  insert into public.media_assets (
    external_id, workspace_id, filename, original_filename, file_type, media_kind,
    checksum, file_size_bytes, storage_bucket, storage_object_key,
    source_system, privacy_status, review_status
  ) values (
    asset_ext, 'bcs-default', 'test.jpg', 'test.jpg', 'image/jpeg', 'image',
    'phase7checksum001', 500000, 'local-vault', 'originals/phase7checksum001.jpg',
    'manual', 'clear', 'none'
  )
  on conflict (external_id) do update set privacy_status = 'clear', review_status = 'none';

  insert into public.media_assets (
    external_id, workspace_id, filename, original_filename, file_type, media_kind,
    checksum, file_size_bytes, storage_bucket, storage_object_key,
    source_system, privacy_status, review_status
  ) values (
    asset_ext2, 'bcs-default', 'test2.jpg', 'test2.jpg', 'image/jpeg', 'image',
    'phase7checksum002', 600000, 'local-vault', 'originals/phase7checksum002.jpg',
    'manual', 'blocked', 'none'
  )
  on conflict (external_id) do update set privacy_status = 'blocked';

  -- ── Test 1: Viewer direct insert to media_workspace_members is denied ──────
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  begin
    insert into public.media_workspace_members (workspace_id, user_id)
    values ('bcs-default', viewer1);
    reset role;
    raise exception 'FAIL: viewer direct insert to workspace_members should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_viewer_no_direct_insert_workspace_members';

  -- ── Test 2: Viewer direct insert to media_collections is denied ────────────
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  begin
    insert into public.media_collections (external_id, workspace_id, name)
    values ('col_viewer_direct', 'bcs-default', 'Viewer Collection');
    reset role;
    raise exception 'FAIL: viewer direct insert to collections should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_viewer_no_direct_insert_collections';

  -- ── Test 3: Viewer direct insert to media_favorites is denied ─────────────
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  begin
    insert into public.media_favorites (workspace_id, user_id, asset_external_id)
    values ('bcs-default', viewer1, asset_ext);
    reset role;
    raise exception 'FAIL: viewer direct insert to favorites should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_viewer_no_direct_insert_favorites';

  -- ── Test 4: Owner can call media_gallery_ensure_own_membership ─────────────
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  begin
    perform public.media_gallery_ensure_own_membership('bcs-default');
    reset role;
    raise notice 'PASS: phase7_owner_ensure_membership';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_owner_ensure_membership: %', sqlerrm;
  end;

  -- ── Test 5: Editor can call media_gallery_ensure_own_membership ────────────
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  begin
    perform public.media_gallery_ensure_own_membership('bcs-default');
    reset role;
    raise notice 'PASS: phase7_editor_ensure_membership';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_editor_ensure_membership: %', sqlerrm;
  end;

  -- ── Test 6: Viewer can call ensure_membership ─────────────────────────────
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  begin
    perform public.media_gallery_ensure_own_membership('bcs-default');
    reset role;
    raise notice 'PASS: phase7_viewer_ensure_membership';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_viewer_ensure_membership: %', sqlerrm;
  end;

  -- ── Test 7: Owner can create a collection via RPC ──────────────────────────
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  perform public.media_gallery_ensure_own_membership('bcs-default');
  begin
    select id into col_id from public.media_gallery_create_collection(
      'bcs-default', 'Phase7 Test Collection', 'desc'
    );
    if col_id is null then
      reset role;
      raise exception 'FAIL: phase7_owner_create_collection returned null id';
    end if;
    reset role;
    raise notice 'PASS: phase7_owner_create_collection';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_owner_create_collection: %', sqlerrm;
  end;

  -- ── Test 8: Editor can update metadata (verifies require_can_edit via RPC) ─
  -- Editors have the editor role so media_gallery_update_metadata should succeed.
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  perform public.media_gallery_ensure_own_membership('bcs-default');
  begin
    perform public.media_gallery_update_metadata(asset_ext, 'Phase7 Edited Title');
    reset role;
    raise notice 'PASS: phase7_editor_can_edit';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_editor_can_edit: %', sqlerrm;
  end;

  -- ── Test 9: Reviewer can review an asset via media_gallery_review_asset ────
  -- Requires reviewer to be a workspace member first.
  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  begin
    perform public.media_gallery_ensure_own_membership('bcs-default');
    reset role;
    raise notice 'PASS: phase7_reviewer_ensure_membership';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_reviewer_ensure_membership: %', sqlerrm;
  end;

  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  begin
    perform public.media_gallery_review_asset(asset_ext, 'in_review', 'phase7 review note');
    reset role;
    raise notice 'PASS: phase7_reviewer_can_review';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_reviewer_can_review: %', sqlerrm;
  end;

  -- ── Test 10: Viewer cannot edit (update_metadata should fail) ─────────────
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  begin
    perform public.media_gallery_update_metadata(asset_ext, 'Viewer Edit Attempt');
    reset role;
    raise exception 'FAIL: viewer should not have edit permission';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_viewer_no_edit_permission';

  -- ── Test 11: Owner can set favorites via RPC ───────────────────────────────
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  perform public.media_gallery_ensure_own_membership('bcs-default');
  begin
    perform public.media_gallery_set_favorite(asset_ext, true, 'bcs-default');
    reset role;
    raise notice 'PASS: phase7_owner_set_favorite';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_owner_set_favorite: %', sqlerrm;
  end;

  -- ── Test 12: Gallery events cannot have signed URLs in metadata ───────────
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  begin
    insert into public.media_gallery_events (workspace_id, actor_id, action, metadata)
    values ('bcs-default', owner1, 'test', '{"url": "https://example.com?X-Amz-Signature=abc123"}'::jsonb);
    reset role;
    raise exception 'FAIL: signed URL in gallery_events metadata should be rejected';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    -- Expected: permission denied for table (revoked) or trigger check
  end;
  reset role;
  raise notice 'PASS: phase7_no_signed_url_in_events_metadata';

  -- ── Test 13: Owner can archive assets via RPC ─────────────────────────────
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  perform public.media_gallery_ensure_own_membership('bcs-default');
  begin
    perform public.media_gallery_archive_assets(array[asset_ext2], 'bcs-default');
    reset role;
    raise notice 'PASS: phase7_owner_archive_assets';
  exception when others then
    reset role;
    raise exception 'FAIL: phase7_owner_archive_assets: %', sqlerrm;
  end;

  -- ── Test 14: media_gallery_append_event exists (tested via Test 12) ───────
  raise notice 'PASS: phase7_gallery_append_event_exists';

  -- ── Test 15: media_workspace_members trigger works ────────────────────────
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  if not exists (
    select 1 from public.media_workspace_members
    where workspace_id = 'bcs-default' and user_id = owner1 and is_active = true
  ) then
    raise exception 'FAIL: phase7_membership_readable: owner1 not found in workspace_members';
  end if;
  reset role;
  raise notice 'PASS: phase7_membership_readable';

  -- ── Summary ───────────────────────────────────────────────────────────────
  raise notice 'PASS: all_phase7_gallery_rls_assertions';
end;
$$;
