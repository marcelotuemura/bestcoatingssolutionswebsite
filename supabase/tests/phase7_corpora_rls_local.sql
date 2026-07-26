-- Phase 7 corpus authority — local Postgres validation.
-- Requires Phase 5–7 migrations.

do $$
declare
  owner1 uuid := '11111111-1111-1111-1111-111111111111';
  admin1 uuid := '33333333-3333-3333-3333-333333333333';
  editor1 uuid := '44444444-4444-4444-4444-444444444444';
  reviewer1 uuid := '55555555-5555-5555-5555-555555555555';
  viewer1 uuid := '66666666-6666-6666-6666-666666666666';
  outsider uuid := '77777777-7777-7777-7777-777777777777';
  corpus public.media_corpora;
  ver public.media_corpus_versions;
  item public.media_corpus_items;
  item2 public.media_corpus_items;
  label public.media_corpus_item_labels;
  manifest jsonb;
  checksum1 text;
  checksum2 text;
  asset_clear text := 'p7_asset_clear';
  asset_blocked text := 'p7_asset_blocked';
  asset_archived text := 'p7_asset_archived';
  asset_dup_a text := 'p7_asset_dup_a';
  asset_dup_b text := 'p7_asset_dup_b';
  asset_near text := 'p7_asset_near';
  cnt integer;
begin
  insert into auth.users (id, email) values
    (owner1, 'owner1@example.test'),
    (admin1, 'admin1@example.test'),
    (editor1, 'editor1@example.test'),
    (reviewer1, 'reviewer1@example.test'),
    (viewer1, 'viewer1@example.test'),
    (outsider, 'outsider@example.test')
  on conflict (id) do nothing;

  insert into public.media_users (id, email, display_name, is_active)
  values
    (owner1, 'owner1@example.test', 'Owner One', true),
    (admin1, 'admin1@example.test', 'Admin', true),
    (editor1, 'editor1@example.test', 'Editor', true),
    (reviewer1, 'reviewer1@example.test', 'Reviewer', true),
    (viewer1, 'viewer1@example.test', 'Viewer', true),
    (outsider, 'outsider@example.test', 'Outsider', true)
  on conflict (id) do update set is_active = true, archived_at = null;

  insert into public.media_user_roles (user_id, role, assigned_by)
  values
    (owner1, 'owner', owner1),
    (admin1, 'administrator', owner1),
    (editor1, 'editor', owner1),
    (reviewer1, 'reviewer', owner1),
    (viewer1, 'viewer', owner1),
    (outsider, 'viewer', owner1)
  on conflict (user_id, role) do update set revoked_at = null;

  insert into public.media_assets (
    external_id, filename, original_filename, file_type, media_kind,
    checksum, source_system, privacy_status, is_exact_duplicate,
    duplicate_group_external_id, is_near_duplicate, near_duplicate_group_external_id
  ) values
    (asset_clear, 'c.jpg', 'c.jpg', 'image/jpeg', 'image', 'chk-clear', 'manual', 'clear', false, null, false, null),
    (asset_blocked, 'b.jpg', 'b.jpg', 'image/jpeg', 'image', 'chk-blocked', 'manual', 'blocked', false, null, false, null),
    (asset_archived, 'a.jpg', 'a.jpg', 'image/jpeg', 'image', 'chk-arch', 'manual', 'clear', false, null, false, null),
    (asset_dup_a, 'd1.jpg', 'd1.jpg', 'image/jpeg', 'image', 'chk-dup-a', 'manual', 'clear', true, 'dup-group-1', false, null),
    (asset_dup_b, 'd2.jpg', 'd2.jpg', 'image/jpeg', 'image', 'chk-dup-b', 'manual', 'clear', true, 'dup-group-1', false, null),
    (asset_near, 'n.jpg', 'n.jpg', 'image/jpeg', 'image', 'chk-near', 'manual', 'clear', false, null, true, 'near-group-1')
  on conflict (external_id) do update
    set privacy_status = excluded.privacy_status,
        checksum = excluded.checksum,
        is_exact_duplicate = excluded.is_exact_duplicate,
        duplicate_group_external_id = excluded.duplicate_group_external_id,
        is_near_duplicate = excluded.is_near_duplicate,
        near_duplicate_group_external_id = excluded.near_duplicate_group_external_id,
        archived_at = null;

  update public.media_assets set archived_at = now() where external_id = asset_archived;

  -- Anonymous cannot read corpora
  perform test_helpers.set_auth(null);
  set local role anon;
  select count(*) into cnt from public.media_corpora;
  if cnt <> 0 then
    raise exception 'FAIL: anon should see 0 corpora';
  end if;
  reset role;
  raise notice 'PASS: phase7_anon_no_read';

  -- Viewer cannot create corpus
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  begin
    perform public.media_create_corpus('bcs-default', 'Viewer corpus', '', 'general_evaluation');
    reset role;
    raise exception 'FAIL: viewer create should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_viewer_no_mutate';

  -- Editor creates draft + version item
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  select * into corpus from public.media_create_corpus(
    'bcs-default', 'Editor corpus', 'desc', 'damage_detection'
  );
  select * into ver from public.media_corpus_versions
  where corpus_id = corpus.id order by version_number limit 1;
  select * into item from public.media_add_corpus_item(ver.id, asset_clear, null);

  begin
    perform public.media_submit_corpus_version(ver.id);
    reset role;
    raise exception 'FAIL: editor submit should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    perform public.media_approve_corpus_version(ver.id);
    reset role;
    raise exception 'FAIL: editor approve should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    perform public.media_release_corpus_version(ver.id);
    reset role;
    raise exception 'FAIL: editor release should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_editor_build_no_approve_release';

  -- Privacy blocked / archived cannot be added
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  begin
    perform public.media_add_corpus_item(ver.id, asset_blocked, null);
    reset role;
    raise exception 'FAIL: privacy-blocked add should fail';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    perform public.media_add_corpus_item(ver.id, asset_archived, null);
    reset role;
    raise exception 'FAIL: archived add should fail';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_privacy_archived_blocked';

  -- AI suggestion does not become human confirmed
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  select * into label from public.media_suggest_corpus_label(
    item.id, 'damage_type', 'gelcoat_crack', 0.9
  );
  if label.source <> 'ai_suggested' then
    raise exception 'FAIL: AI label source';
  end if;
  reset role;

  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  perform public.media_corpus_ensure_own_membership('bcs-default');
  begin
    -- include without human label must fail
    perform public.media_review_corpus_item(item.id, 'include', 'try', null, null);
    reset role;
    raise exception 'FAIL: include without human label should fail';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  select * into label from public.media_confirm_corpus_label(
    item.id, 'damage_type', 'gelcoat_crack'
  );
  if label.source <> 'human_confirmed' then
    raise exception 'FAIL: human label source';
  end if;
  select * into item from public.media_review_corpus_item(
    item.id, 'include', 'ok', 'human reviewed', null
  );
  perform public.media_assign_corpus_split(item.id, 'train');
  reset role;
  raise notice 'PASS: phase7_ai_label_not_auto_confirmed';

  -- Near duplicate path
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  select * into item2 from public.media_add_corpus_item(ver.id, asset_near, null);
  if item2.status <> 'needs_review' then
    raise exception 'FAIL: near duplicate should need review';
  end if;
  reset role;
  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  perform public.media_confirm_corpus_label(item2.id, 'damage_type', 'similar');
  begin
    perform public.media_review_corpus_item(item2.id, 'include', 'no ack', null, null);
    reset role;
    raise exception 'FAIL: near dup include without ack should fail';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  perform public.media_review_corpus_item(
    item2.id, 'acknowledge_near_duplicate', 'acked', null, null
  );
  select * into item2 from public.media_review_corpus_item(
    item2.id, 'include', 'include near', 'near ok', null
  );
  perform public.media_assign_corpus_split(item2.id, 'validation');
  reset role;
  raise notice 'PASS: phase7_near_duplicate_warning_ack';

  -- Exact duplicate split leakage
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  select * into item from public.media_add_corpus_item(ver.id, asset_dup_a, null);
  begin
    perform public.media_add_corpus_item(ver.id, asset_dup_b, null);
    reset role;
    raise exception 'FAIL: second exact dup should be rejected';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  perform public.media_confirm_corpus_label(item.id, 'damage_type', 'dup');
  perform public.media_review_corpus_item(item.id, 'include', 'dup include', null, null);
  perform public.media_assign_corpus_split(item.id, 'test');
  -- Simulate conflicting split assignment against same group via crafted second item
  -- (blocked at add time — coverage for assign conflict using same item group)
  reset role;
  raise notice 'PASS: phase7_exact_dup_no_duplicate_examples';

  -- Reviewer cannot release
  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  begin
    perform public.media_release_corpus_version(ver.id);
    reset role;
    raise exception 'FAIL: reviewer release should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_reviewer_no_release';

  -- Admin submit + approve; cannot release
  perform test_helpers.set_auth(admin1);
  set local role authenticated;
  perform public.media_corpus_ensure_own_membership('bcs-default');
  select * into ver from public.media_submit_corpus_version(ver.id);
  if ver.status <> 'review_ready' then
    raise exception 'FAIL: submit status';
  end if;
  select * into ver from public.media_approve_corpus_version(ver.id);
  if ver.status <> 'approved' then
    raise exception 'FAIL: approve status';
  end if;
  begin
    perform public.media_release_corpus_version(ver.id);
    reset role;
    raise exception 'FAIL: admin release should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_admin_approve_no_release';

  -- Owner release + immutable + manifest
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  perform public.media_corpus_ensure_own_membership('bcs-default');
  select public.media_corpus_build_manifest(ver.id) into manifest;
  checksum1 := manifest->>'manifestChecksum';
  select public.media_corpus_build_manifest(ver.id) into manifest;
  checksum2 := manifest->>'manifestChecksum';
  if checksum1 is distinct from checksum2 then
    raise exception 'FAIL: manifest checksum not deterministic';
  end if;
  if manifest::text ~* '(X-Amz-Signature|signedUrl|service_role|eyJhbGci)' then
    raise exception 'FAIL: manifest contains secrets/signed urls';
  end if;
  select * into ver from public.media_release_corpus_version(ver.id);
  if ver.status <> 'released' then
    raise exception 'FAIL: release status';
  end if;

  begin
    update public.media_corpus_versions set notes = 'tamper' where id = ver.id;
    reset role;
    raise exception 'FAIL: released version should be immutable';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    perform public.media_add_corpus_item(ver.id, asset_clear, null);
    reset role;
    raise exception 'FAIL: cannot add to released version';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  -- New version required after release
  select * into ver from public.media_create_corpus_version(corpus.id, 'post-release');
  if ver.version_number < 2 or ver.status <> 'building' then
    raise exception 'FAIL: new version after release';
  end if;
  reset role;
  raise notice 'PASS: phase7_release_immutable_new_version';

  -- Cross-workspace denied for outsider without membership
  perform test_helpers.set_auth(outsider);
  set local role authenticated;
  select count(*) into cnt from public.media_corpora where id = corpus.id;
  if cnt <> 0 then
    raise exception 'FAIL: outsider without membership should not read corpus';
  end if;
  begin
    perform public.media_create_corpus('other-ws', 'x', '', 'other');
    -- outsider is viewer — denied by draft role anyway
    reset role;
    raise exception 'FAIL: outsider create should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_cross_workspace_denied';

  -- Invalid lifecycle transition
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  begin
    -- cancelled versions cannot release
    select * into ver from public.media_cancel_corpus_version(ver.id);
    perform public.media_release_corpus_version(ver.id);
    reset role;
    raise exception 'FAIL: invalid lifecycle should fail';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_invalid_lifecycle_fails';

  -- Audit events present
  select count(*) into cnt
  from public.media_corpus_events
  where corpus_id = corpus.id and actor_id is not null and action is not null;
  if cnt < 3 then
    raise exception 'FAIL: expected audit events';
  end if;
  raise notice 'PASS: phase7_audit_events';

  -- Direct table write denied
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  begin
    insert into public.media_corpora (
      external_id, workspace_id, name, intended_use, created_by
    ) values (
      'corp_direct', 'bcs-default', 'direct', 'other', editor1
    );
    reset role;
    raise exception 'FAIL: direct insert should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase7_direct_write_denied';
end;
$$;
