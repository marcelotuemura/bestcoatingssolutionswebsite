-- Phase 6 publication authority — local Postgres validation.
-- Requires Phase 5 + Phase 6 schema/RLS/authority/RPC migrations.

do $$
declare
  owner1 uuid := '11111111-1111-1111-1111-111111111111';
  admin1 uuid := '33333333-3333-3333-3333-333333333333';
  editor1 uuid := '44444444-4444-4444-4444-444444444444';
  reviewer1 uuid := '55555555-5555-5555-5555-555555555555';
  viewer1 uuid := '66666666-6666-6666-6666-666666666666';
  job public.media_publication_jobs;
  job_id uuid;
  ok boolean;
  asset_ext text := 'local_rls_asset_1';
begin
  insert into auth.users (id, email) values
    (owner1, 'owner1@example.test'),
    (admin1, 'admin1@example.test'),
    (editor1, 'editor1@example.test'),
    (reviewer1, 'reviewer1@example.test'),
    (viewer1, 'viewer1@example.test')
  on conflict (id) do nothing;

  insert into public.media_users (id, email, display_name, is_active)
  values
    (owner1, 'owner1@example.test', 'Owner One', true),
    (admin1, 'admin1@example.test', 'Admin', true),
    (editor1, 'editor1@example.test', 'Editor', true),
    (reviewer1, 'reviewer1@example.test', 'Reviewer', true),
    (viewer1, 'viewer1@example.test', 'Viewer', true)
  on conflict (id) do update set is_active = true, archived_at = null;

  insert into public.media_user_roles (user_id, role, assigned_by)
  values
    (owner1, 'owner', owner1),
    (admin1, 'administrator', owner1),
    (editor1, 'editor', owner1),
    (reviewer1, 'reviewer', owner1),
    (viewer1, 'viewer', owner1)
  on conflict (user_id, role) do update set revoked_at = null;

  insert into public.media_assets (
    external_id, filename, original_filename, file_type, media_kind,
    checksum, score_website, score_marketing, score_technical, source_system,
    privacy_status
  ) values (
    asset_ext, 't.jpg', 't.jpg', 'image/jpeg', 'image',
    'phase6checksum', 10, 10, 10, 'manual', 'clear'
  )
  on conflict (external_id) do update set privacy_status = 'clear';

  -- Viewer: read ok, direct insert denied, RPC create denied
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  begin
    insert into public.media_publication_jobs (
      external_id, asset_external_id, target, status, provider_delivery_status,
      payload, idempotency_key, created_by
    ) values (
      'pub_viewer_direct', asset_ext, 'website', 'draft', 'draft_ready',
      '{"kind":"website"}'::jsonb, 'idem-viewer-direct', viewer1
    );
    reset role;
    raise exception 'FAIL: viewer direct insert should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    perform public.media_create_publication_draft(
      'bcs-default', asset_ext, 'website',
      '{"kind":"website","placement":"portfolio","title":"t","altText":"a"}'::jsonb,
      'idem-viewer-rpc'
    );
    reset role;
    raise exception 'FAIL: viewer RPC create should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase6_viewer_read_no_mutate';

  -- Reviewer cannot create/approve/execute
  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  begin
    perform public.media_create_publication_draft(
      'bcs-default', asset_ext, 'social',
      '{"kind":"social","platform":"instagram","destinationAccountRef":"x","caption":"c"}'::jsonb,
      'idem-reviewer'
    );
    reset role;
    raise exception 'FAIL: reviewer create should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase6_reviewer_no_publish_mutate';

  -- Editor can create draft via RPC
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  select * into job from public.media_create_publication_draft(
    'bcs-default', asset_ext, 'website',
    '{"kind":"website","placement":"portfolio","title":"Editor draft","altText":"alt"}'::jsonb,
    'idem-editor-draft-1'
  );
  job_id := job.id;
  reset role;
  if job.status <> 'draft' then
    raise exception 'FAIL: editor draft status';
  end if;
  raise notice 'PASS: phase6_editor_draft_ok';

  -- Editor cannot approve / execute / force status
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  begin
    perform public.media_approve_publication(job_id);
    reset role;
    raise exception 'FAIL: editor approve should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    perform public.media_execute_publication(job_id);
    reset role;
    raise exception 'FAIL: editor execute should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    update public.media_publication_jobs set status = 'published' where id = job_id;
    reset role;
    raise exception 'FAIL: editor direct status update should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  raise notice 'PASS: phase6_editor_cannot_force_protected_states';

  -- Admin can approve but cannot execute (owner-only)
  perform test_helpers.set_auth(admin1);
  set local role authenticated;
  select * into job from public.media_approve_publication(job_id);
  begin
    perform public.media_execute_publication(job_id);
    reset role;
    raise exception 'FAIL: admin execute should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  if job.status <> 'approved' then
    raise exception 'FAIL: admin approve status';
  end if;
  raise notice 'PASS: phase6_admin_approve_not_execute';

  -- Owner execute → draft_ready (non-delivered)
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  perform public.media_execute_publication(job_id);
  select * into job from public.media_record_publication_result(
    job_id, false, 'draft_ready', '{"note":"no provider"}'::jsonb, null
  );
  reset role;
  if job.status <> 'approved' or job.provider_delivery_status <> 'draft_ready' then
    raise exception 'FAIL: owner draft result % / %', job.status, job.provider_delivery_status;
  end if;
  select count(*) >= 1 into ok
  from public.media_publication_events e
  where e.job_id = job.id
    and e.action = 'publish_blocked_provider_not_configured';
  if not ok then
    raise exception 'FAIL: missing audit event for non-delivered execute';
  end if;
  raise notice 'PASS: phase6_owner_execute_nondelivered';

  -- Idempotency
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  select * into job from public.media_create_publication_draft(
    'bcs-default', asset_ext, 'website',
    '{"kind":"website","placement":"portfolio","title":"Editor draft","altText":"alt"}'::jsonb,
    'idem-editor-draft-1'
  );
  reset role;
  if job.id <> job_id then
    raise exception 'FAIL: idempotency should return same job';
  end if;
  raise notice 'PASS: phase6_idempotency_unique';

  -- Privacy blocked (clear JWT so service-context maintenance can update assets)
  perform test_helpers.set_auth(null);
  update public.media_assets set privacy_status = 'blocked' where external_id = asset_ext;
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  begin
    perform public.media_create_publication_draft(
      'bcs-default', asset_ext, 'social',
      '{"kind":"social","platform":"instagram","destinationAccountRef":"x","caption":"c"}'::jsonb,
      'idem-privacy-block'
    );
    reset role;
    raise exception 'FAIL: privacy-blocked create should fail';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  reset role;
  perform test_helpers.set_auth(null);
  update public.media_assets set privacy_status = 'clear' where external_id = asset_ext;
  raise notice 'PASS: phase6_privacy_blocked_rejected';

  raise notice 'PASS: all_phase6_publication_rls_assertions';
end;
$$;
