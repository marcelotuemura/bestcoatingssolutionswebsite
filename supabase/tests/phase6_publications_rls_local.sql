-- Phase 6 publication RLS local Postgres validation.
-- Requires Phase 5 + Phase 6 migrations and stub auth helpers.

do $$
declare
  owner1 uuid := '11111111-1111-1111-1111-111111111111';
  editor1 uuid := '44444444-4444-4444-4444-444444444444';
  reviewer1 uuid := '55555555-5555-5555-5555-555555555555';
  viewer1 uuid := '66666666-6666-6666-6666-666666666666';
  job_id uuid;
  ok boolean;
begin
  -- Ensure seed users exist (idempotent with Phase 5 local seed).
  insert into auth.users (id, email) values
    (owner1, 'owner1@example.test'),
    (editor1, 'editor1@example.test'),
    (reviewer1, 'reviewer1@example.test'),
    (viewer1, 'viewer1@example.test')
  on conflict (id) do nothing;

  insert into public.media_users (id, email, display_name, is_active)
  values
    (owner1, 'owner1@example.test', 'Owner One', true),
    (editor1, 'editor1@example.test', 'Editor', true),
    (reviewer1, 'reviewer1@example.test', 'Reviewer', true),
    (viewer1, 'viewer1@example.test', 'Viewer', true)
  on conflict (id) do update set is_active = true, archived_at = null;

  insert into public.media_user_roles (user_id, role, assigned_by)
  values
    (owner1, 'owner', owner1),
    (editor1, 'editor', owner1),
    (reviewer1, 'reviewer', owner1),
    (viewer1, 'viewer', owner1)
  on conflict (user_id, role) do update set revoked_at = null;

  -- Owner seeds a publication job (bypass via set role after auth).
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  insert into public.media_publication_jobs (
    external_id, asset_external_id, target, status, provider_delivery_status,
    payload, idempotency_key, created_by
  ) values (
    'pub_local_1', 'local_rls_asset_1', 'website', 'draft', 'draft_ready',
    '{"kind":"website","placement":"portfolio","title":"t","altText":"a"}'::jsonb,
    'idem-local-1', owner1
  )
  returning id into job_id;
  insert into public.media_publication_events (
    job_id, actor_id, action, next_status, target, metadata
  ) values (
    job_id, owner1, 'draft_created', 'draft', 'website', '{}'::jsonb
  );
  reset role;

  -- Viewer: can read, cannot insert/update
  perform test_helpers.set_auth(viewer1);
  set local role authenticated;
  select count(*) = 1 into ok from public.media_publication_jobs where id = job_id;
  if not ok then
    reset role;
    raise exception 'FAIL: viewer should read publication jobs';
  end if;
  begin
    insert into public.media_publication_jobs (
      external_id, asset_external_id, target, status, provider_delivery_status,
      payload, idempotency_key, created_by
    ) values (
      'pub_local_viewer', 'local_rls_asset_1', 'social', 'draft', 'not_configured',
      '{"kind":"social","platform":"instagram","destinationAccountRef":"x","caption":"c"}'::jsonb,
      'idem-viewer', viewer1
    );
    reset role;
    raise exception 'FAIL: viewer insert publication job should be denied';
  exception when insufficient_privilege or others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    update public.media_publication_jobs set status = 'approved' where id = job_id;
    -- RLS with check may silently update 0 rows or raise; require no change.
  exception when others then
    null;
  end;
  select status = 'draft' into ok from public.media_publication_jobs where id = job_id;
  reset role;
  if not ok then
    raise exception 'FAIL: viewer must not change publication status';
  end if;
  raise notice 'PASS: phase6_viewer_read_no_mutate';

  -- Reviewer: read ok, mutate denied
  perform test_helpers.set_auth(reviewer1);
  set local role authenticated;
  select count(*) = 1 into ok from public.media_publication_jobs where id = job_id;
  if not ok then
    reset role;
    raise exception 'FAIL: reviewer should read publication jobs';
  end if;
  begin
    update public.media_publication_jobs set status = 'publishing' where id = job_id;
  exception when others then
    null;
  end;
  select status = 'draft' into ok from public.media_publication_jobs where id = job_id;
  reset role;
  if not ok then
    raise exception 'FAIL: reviewer must not mutate publication jobs';
  end if;
  raise notice 'PASS: phase6_reviewer_no_publish_mutate';

  -- Editor: may insert draft
  perform test_helpers.set_auth(editor1);
  set local role authenticated;
  insert into public.media_publication_jobs (
    external_id, asset_external_id, target, status, provider_delivery_status,
    payload, idempotency_key, created_by
  ) values (
    'pub_local_editor', 'local_rls_asset_1', 'social', 'draft', 'draft_ready',
    '{"kind":"social","platform":"instagram","destinationAccountRef":"bcs","caption":"hi"}'::jsonb,
    'idem-editor-1', editor1
  );
  reset role;
  raise notice 'PASS: phase6_editor_draft_ok';

  -- Owner: may update toward approved (app layer still gates live publish)
  perform test_helpers.set_auth(owner1);
  set local role authenticated;
  update public.media_publication_jobs
    set status = 'approved', reviewed_by = owner1, updated_at = now()
    where id = job_id;
  select status = 'approved' into ok from public.media_publication_jobs where id = job_id;
  reset role;
  if not ok then
    raise exception 'FAIL: owner should approve publication job row';
  end if;
  raise notice 'PASS: phase6_owner_approve_ok';

  -- Idempotency unique constraint
  begin
    insert into public.media_publication_jobs (
      external_id, asset_external_id, target, status, provider_delivery_status,
      payload, idempotency_key, created_by
    ) values (
      'pub_local_dup', 'local_rls_asset_1', 'website', 'draft', 'draft_ready',
      '{"kind":"website","placement":"portfolio","title":"t","altText":"a"}'::jsonb,
      'idem-local-1', owner1
    );
    raise exception 'FAIL: duplicate idempotency key should be rejected';
  exception when unique_violation then
    raise notice 'PASS: phase6_idempotency_unique';
  end;

  raise notice 'PASS: all_phase6_publication_rls_assertions';
end;
$$;
