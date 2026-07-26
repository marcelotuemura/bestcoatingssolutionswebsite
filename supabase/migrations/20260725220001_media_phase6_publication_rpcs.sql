-- Phase 6 — SECURITY DEFINER publication RPCs
-- Companion to 20260725220000. Actor always from auth.uid().

-- ── media_create_publication_draft ───────────────────────────────────────────
create or replace function public.media_create_publication_draft(
  p_workspace_id text,
  p_asset_external_id text,
  p_target text,
  p_payload jsonb,
  p_idempotency_key text,
  p_derivative_id text default null,
  p_scheduled_for timestamptz default null,
  p_destination_ref text default null
)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_can_prepare();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
  asset_rev integer;
  existing public.media_publication_jobs;
  job public.media_publication_jobs;
  delivery text := 'draft_ready';
  ext_id text;
begin
  if p_target not in ('website', 'social', 'google_business') then
    raise exception 'unsupported publication target' using errcode = '22023';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 then
    raise exception 'idempotency key required' using errcode = '22023';
  end if;
  if public.media_publication_payload_has_signed_url(p_payload) then
    raise exception 'signed URLs must not be persisted' using errcode = '22023';
  end if;
  if public.media_publication_asset_privacy_blocked(p_asset_external_id) then
    raise exception 'privacy-blocked assets cannot be drafted'
      using errcode = '42501';
  end if;

  select a.revision into asset_rev
  from public.media_assets a
  where a.external_id = p_asset_external_id and a.archived_at is null;

  if p_derivative_id is not null then
    if not exists (
      select 1
      from public.media_asset_derivatives d
      join public.media_assets a on a.id = d.asset_id
      where a.external_id = p_asset_external_id
        and d.id::text = p_derivative_id
        and d.object_key not like 'originals/%'
    ) and not exists (
      select 1
      from public.media_asset_derivatives d
      join public.media_assets a on a.id = d.asset_id
      where a.external_id = p_asset_external_id
        and d.kind = p_derivative_id
        and d.object_key not like 'originals/%'
    ) then
      -- Allow omitting strict derivative match when kind-like string used by adapters
      if p_derivative_id ~* '^(originals/|https?:)' then
        raise exception 'original files cannot be used as publication derivatives'
          using errcode = '22023';
      end if;
    end if;
  end if;

  select * into existing
  from public.media_publication_jobs j
  where j.idempotency_key = p_idempotency_key;

  if found then
    return existing;
  end if;

  perform public.media_set_mutation_flag('publication_mutation');
  ext_id := 'pub_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

  insert into public.media_publication_jobs (
    external_id, workspace_id, asset_external_id, asset_revision, derivative_id,
    target, status, provider_delivery_status, payload, scheduled_for,
    idempotency_key, destination_ref, provider_metadata, created_by
  ) values (
    ext_id, workspace, p_asset_external_id, asset_rev, p_derivative_id,
    p_target, 'draft', delivery, coalesce(p_payload, '{}'::jsonb), p_scheduled_for,
    p_idempotency_key, p_destination_ref,
    jsonb_build_object('autoPublish', false, 'bridge', 'phase6_draft'),
    actor
  )
  returning * into job;

  insert into public.media_publication_drafts (job_id, revision, payload, created_by)
  values (job.id, 1, job.payload, actor);

  perform public.media_publication_append_event(
    job.id, actor, 'draft_created', null, 'draft', p_target,
    jsonb_build_object('workspace_id', workspace)
  );
  perform public.media_audit_write(
    'publication_draft_created',
    'publication_job',
    job.id::text,
    true,
    jsonb_build_object('target', p_target, 'asset', p_asset_external_id)
  );
  return job;
end;
$$;

revoke all on function public.media_create_publication_draft(text, text, text, jsonb, text, text, timestamptz, text) from public;
grant execute on function public.media_create_publication_draft(text, text, text, jsonb, text, text, timestamptz, text) to authenticated;

-- ── media_update_publication_draft ───────────────────────────────────────────
create or replace function public.media_update_publication_draft(
  p_job_id uuid,
  p_payload jsonb default null,
  p_derivative_id text default null,
  p_scheduled_for timestamptz default null,
  p_clear_schedule boolean default false
)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_can_prepare();
  job public.media_publication_jobs;
  prev text;
  next_rev integer;
begin
  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;
  if job.status not in ('draft', 'awaiting_approval') then
    raise exception 'draft can only be updated in draft or awaiting_approval'
      using errcode = '22023';
  end if;
  if public.media_publication_asset_privacy_blocked(job.asset_external_id) then
    raise exception 'privacy-blocked assets cannot be updated for publication'
      using errcode = '42501';
  end if;
  if p_payload is not null and public.media_publication_payload_has_signed_url(p_payload) then
    raise exception 'signed URLs must not be persisted' using errcode = '22023';
  end if;

  prev := job.status;
  perform public.media_set_mutation_flag('publication_mutation');
  update public.media_publication_jobs
  set
    payload = coalesce(p_payload, payload),
    derivative_id = coalesce(p_derivative_id, derivative_id),
    scheduled_for = case
      when p_clear_schedule then null
      else coalesce(p_scheduled_for, scheduled_for)
    end,
    updated_at = now()
  where id = job.id
  returning * into job;

  select coalesce(max(revision), 0) + 1 into next_rev
  from public.media_publication_drafts where job_id = job.id;

  insert into public.media_publication_drafts (job_id, revision, payload, created_by)
  values (job.id, next_rev, job.payload, actor);

  perform public.media_publication_append_event(
    job.id, actor, 'draft_updated', prev, job.status, job.target, '{}'::jsonb
  );
  return job;
end;
$$;

revoke all on function public.media_update_publication_draft(uuid, jsonb, text, timestamptz, boolean) from public;
grant execute on function public.media_update_publication_draft(uuid, jsonb, text, timestamptz, boolean) to authenticated;

-- ── media_submit_publication ─────────────────────────────────────────────────
create or replace function public.media_submit_publication(p_job_id uuid)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_can_prepare();
  job public.media_publication_jobs;
  prev text;
begin
  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;
  if not public.media_publication_can_transition(job.status, 'awaiting_approval') then
    raise exception 'invalid transition % → awaiting_approval', job.status
      using errcode = '22023';
  end if;
  if public.media_publication_asset_privacy_blocked(job.asset_external_id) then
    raise exception 'privacy-blocked assets cannot progress publication'
      using errcode = '42501';
  end if;

  prev := job.status;
  perform public.media_set_mutation_flag('publication_mutation');
  update public.media_publication_jobs
  set status = 'awaiting_approval', updated_at = now()
  where id = job.id
  returning * into job;

  perform public.media_publication_append_event(
    job.id, actor, 'submitted', prev, 'awaiting_approval', job.target, '{}'::jsonb
  );
  return job;
end;
$$;

revoke all on function public.media_submit_publication(uuid) from public;
grant execute on function public.media_submit_publication(uuid) to authenticated;

-- ── media_approve_publication ────────────────────────────────────────────────
create or replace function public.media_approve_publication(p_job_id uuid)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_can_approve();
  job public.media_publication_jobs;
  prev text;
  asset_rev integer;
  approval public.media_publication_approvals;
  next_version integer;
begin
  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;
  if not public.media_publication_can_transition(job.status, 'approved') then
    raise exception 'invalid transition % → approved', job.status
      using errcode = '22023';
  end if;
  if public.media_publication_asset_privacy_blocked(job.asset_external_id) then
    raise exception 'privacy-blocked assets cannot be approved for publication'
      using errcode = '42501';
  end if;

  select a.revision into asset_rev
  from public.media_assets a
  where a.external_id = job.asset_external_id and a.archived_at is null;

  select * into approval
  from public.media_publication_approvals ap
  where ap.workspace_id = job.workspace_id
    and ap.asset_external_id = job.asset_external_id
    and ap.target = job.target
    and ap.revoked_at is null
    and (ap.expires_at is null or ap.expires_at > now())
    and ap.asset_revision = asset_rev
  order by ap.approval_version desc
  limit 1;

  if not found then
    select coalesce(max(approval_version), 0) + 1 into next_version
    from public.media_publication_approvals
    where workspace_id = job.workspace_id
      and asset_external_id = job.asset_external_id
      and target = job.target;

    perform public.media_set_mutation_flag('publication_mutation');
    insert into public.media_publication_approvals (
      workspace_id, asset_external_id, asset_revision, derivative_id,
      target, approval_version, approved_by, note
    ) values (
      job.workspace_id, job.asset_external_id, asset_rev, job.derivative_id,
      job.target, next_version, actor,
      'Phase 6 publication approval'
    )
    returning * into approval;
  end if;

  prev := job.status;
  perform public.media_set_mutation_flag('publication_mutation');
  update public.media_publication_jobs
  set
    status = 'approved',
    approval_id = approval.id::text,
    approval_version = approval.approval_version,
    asset_revision = asset_rev,
    reviewed_by = actor,
    updated_at = now()
  where id = job.id
  returning * into job;

  perform public.media_publication_append_event(
    job.id, actor, 'approved', prev, 'approved', job.target,
    jsonb_build_object('approval_id', approval.id)
  );
  perform public.media_audit_write(
    'publication_approved',
    'publication_job',
    job.id::text,
    true,
    jsonb_build_object('target', job.target, 'approval_id', approval.id)
  );
  return job;
end;
$$;

revoke all on function public.media_approve_publication(uuid) from public;
grant execute on function public.media_approve_publication(uuid) to authenticated;

-- ── media_reject_publication_approval ────────────────────────────────────────
create or replace function public.media_reject_publication_approval(
  p_job_id uuid,
  p_note text default null
)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_can_approve();
  job public.media_publication_jobs;
  prev text;
begin
  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;
  if job.status not in ('awaiting_approval', 'approved') then
    raise exception 'cannot reject approval from status %', job.status
      using errcode = '22023';
  end if;

  prev := job.status;
  perform public.media_set_mutation_flag('publication_mutation');

  if job.approval_id is not null then
    update public.media_publication_approvals
    set revoked_at = now()
    where id = job.approval_id::uuid and revoked_at is null;
  end if;

  update public.media_publication_jobs
  set
    status = 'draft',
    approval_id = null,
    approval_version = null,
    reviewed_by = actor,
    failure_detail = left(coalesce(p_note, 'approval rejected'), 2000),
    updated_at = now()
  where id = job.id
  returning * into job;

  perform public.media_publication_append_event(
    job.id, actor, 'approval_rejected', prev, 'draft', job.target,
    jsonb_build_object('note', p_note)
  );
  return job;
end;
$$;

revoke all on function public.media_reject_publication_approval(uuid, text) from public;
grant execute on function public.media_reject_publication_approval(uuid, text) to authenticated;

-- ── media_schedule_publication ───────────────────────────────────────────────
create or replace function public.media_schedule_publication(
  p_job_id uuid,
  p_scheduled_for timestamptz
)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_can_schedule();
  job public.media_publication_jobs;
  prev text;
  approval public.media_publication_approvals;
begin
  if p_scheduled_for is null then
    raise exception 'scheduled_for required' using errcode = '22023';
  end if;

  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;

  if job.status = 'scheduled' then
    -- reschedule
    null;
  elsif not public.media_publication_can_transition(job.status, 'scheduled') then
    raise exception 'invalid transition % → scheduled', job.status
      using errcode = '22023';
  end if;

  if public.media_publication_asset_privacy_blocked(job.asset_external_id) then
    raise exception 'privacy-blocked assets cannot be scheduled'
      using errcode = '42501';
  end if;

  if job.approval_id is null then
    raise exception 'exact MediaApproval required before scheduling'
      using errcode = '42501';
  end if;

  select * into approval
  from public.media_publication_approvals
  where id = job.approval_id::uuid;

  if not found
     or approval.revoked_at is not null
     or (approval.expires_at is not null and approval.expires_at <= now())
     or approval.asset_external_id is distinct from job.asset_external_id
     or approval.target is distinct from job.target
     or approval.approval_version is distinct from job.approval_version
     or approval.asset_revision is distinct from job.asset_revision
  then
    raise exception 'approval does not match asset/target/version'
      using errcode = '42501';
  end if;

  prev := job.status;
  perform public.media_set_mutation_flag('publication_mutation');
  update public.media_publication_jobs
  set
    status = 'scheduled',
    scheduled_for = p_scheduled_for,
    updated_at = now()
  where id = job.id
  returning * into job;

  perform public.media_publication_append_event(
    job.id, actor,
    case when prev = 'scheduled' then 'schedule_changed' else 'scheduled' end,
    prev, 'scheduled', job.target,
    jsonb_build_object('scheduled_for', p_scheduled_for)
  );
  return job;
end;
$$;

revoke all on function public.media_schedule_publication(uuid, timestamptz) from public;
grant execute on function public.media_schedule_publication(uuid, timestamptz) to authenticated;

-- ── media_cancel_publication ─────────────────────────────────────────────────
create or replace function public.media_cancel_publication(p_job_id uuid)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_require_auth();
  job public.media_publication_jobs;
  prev text;
  can_cancel boolean := false;
begin
  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;
  if not public.media_publication_can_transition(job.status, 'cancelled') then
    raise exception 'invalid transition % → cancelled', job.status
      using errcode = '22023';
  end if;

  if job.status in ('draft', 'awaiting_approval') then
    can_cancel :=
      public.media_has_role('editor'::public.media_role)
      or public.media_has_role('administrator'::public.media_role)
      or public.media_has_role('owner'::public.media_role);
  elsif job.status in ('approved', 'scheduled', 'failed') then
    can_cancel :=
      public.media_has_role('administrator'::public.media_role)
      or public.media_has_role('owner'::public.media_role);
  end if;

  if not can_cancel then
    raise exception 'permission denied: cancel publication'
      using errcode = '42501';
  end if;

  prev := job.status;
  perform public.media_set_mutation_flag('publication_mutation');
  update public.media_publication_jobs
  set status = 'cancelled', updated_at = now()
  where id = job.id
  returning * into job;

  perform public.media_publication_append_event(
    job.id, actor, 'cancelled', prev, 'cancelled', job.target, '{}'::jsonb
  );
  return job;
end;
$$;

revoke all on function public.media_cancel_publication(uuid) from public;
grant execute on function public.media_cancel_publication(uuid) to authenticated;

-- ── media_execute_publication (begin publish attempt; owner only) ────────────
create or replace function public.media_execute_publication(p_job_id uuid)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_owner();
  job public.media_publication_jobs;
  prev text;
  approval public.media_publication_approvals;
begin
  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;

  if job.status = 'failed' then
    null; -- retry path
  elsif not public.media_publication_can_transition(job.status, 'publishing') then
    raise exception 'invalid transition % → publishing', job.status
      using errcode = '22023';
  end if;

  if public.media_publication_asset_privacy_blocked(job.asset_external_id) then
    raise exception 'privacy-blocked assets cannot be published'
      using errcode = '42501';
  end if;

  if job.approval_id is null then
    raise exception 'exact MediaApproval required before execute'
      using errcode = '42501';
  end if;

  select * into approval
  from public.media_publication_approvals
  where id = job.approval_id::uuid;

  if not found
     or approval.revoked_at is not null
     or (approval.expires_at is not null and approval.expires_at <= now())
     or approval.target is distinct from job.target
     or approval.asset_external_id is distinct from job.asset_external_id
     or approval.approval_version is distinct from job.approval_version
  then
    raise exception 'approval does not match asset/target/version'
      using errcode = '42501';
  end if;

  prev := job.status;
  perform public.media_set_mutation_flag('publication_mutation');
  update public.media_publication_jobs
  set
    status = 'publishing',
    provider_delivery_status = 'queued',
    failure_detail = null,
    updated_at = now()
  where id = job.id
  returning * into job;

  perform public.media_publication_append_event(
    job.id, actor, 'publish_attempted', prev, 'publishing', job.target, '{}'::jsonb
  );
  return job;
end;
$$;

revoke all on function public.media_execute_publication(uuid) from public;
grant execute on function public.media_execute_publication(uuid) to authenticated;

-- ── media_record_publication_result ──────────────────────────────────────────
create or replace function public.media_record_publication_result(
  p_job_id uuid,
  p_externally_delivered boolean,
  p_provider_delivery_status text,
  p_provider_metadata jsonb default '{}'::jsonb,
  p_failure_detail text default null
)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_owner();
  job public.media_publication_jobs;
  prev text;
  next_status text;
  next_delivery text;
begin
  select * into job from public.media_publication_jobs where id = p_job_id for update;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;
  if job.status <> 'publishing' then
    raise exception 'result can only be recorded from publishing'
      using errcode = '22023';
  end if;
  if public.media_publication_payload_has_signed_url(coalesce(p_provider_metadata, '{}'::jsonb)) then
    raise exception 'signed URLs must not be persisted' using errcode = '22023';
  end if;

  prev := job.status;

  if p_failure_detail is not null and length(trim(p_failure_detail)) > 0 then
    next_status := 'failed';
    next_delivery := 'failed';
  elsif coalesce(p_externally_delivered, false) then
    -- Only claim published/delivered when caller asserts provider proof.
    -- Draft adapters must pass false.
    next_status := 'published';
    next_delivery := 'delivered';
  else
    next_status := 'approved';
    next_delivery := coalesce(nullif(p_provider_delivery_status, ''), 'draft_ready');
    if next_delivery not in ('not_configured', 'draft_ready', 'queued', 'failed') then
      next_delivery := 'draft_ready';
    end if;
  end if;

  perform public.media_set_mutation_flag('publication_mutation');
  update public.media_publication_jobs
  set
    status = next_status,
    provider_delivery_status = next_delivery,
    provider_metadata = coalesce(p_provider_metadata, '{}'::jsonb),
    failure_detail = case
      when next_status = 'failed' then left(p_failure_detail, 2000)
      else null
    end,
    published_by = case when next_status = 'published' then actor else null end,
    published_at = case when next_status = 'published' then now() else null end,
    updated_at = now()
  where id = job.id
  returning * into job;

  perform public.media_publication_append_event(
    job.id, actor,
    case
      when next_status = 'published' then 'publish_succeeded'
      when next_status = 'failed' then 'publish_failed'
      else 'publish_blocked_provider_not_configured'
    end,
    prev, next_status, job.target,
    jsonb_build_object(
      'externally_delivered', coalesce(p_externally_delivered, false),
      'provider_delivery_status', next_delivery
    )
  );
  return job;
end;
$$;

revoke all on function public.media_record_publication_result(uuid, boolean, text, jsonb, text) from public;
grant execute on function public.media_record_publication_result(uuid, boolean, text, jsonb, text) to authenticated;

-- ── media_retry_publication ──────────────────────────────────────────────────
create or replace function public.media_retry_publication(p_job_id uuid)
returns public.media_publication_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_publication_require_owner();
  job public.media_publication_jobs;
begin
  select * into job from public.media_publication_jobs where id = p_job_id;
  if not found then
    raise exception 'publication job not found' using errcode = 'P0002';
  end if;
  if job.status <> 'failed' then
    raise exception 'retry only allowed from failed' using errcode = '22023';
  end if;

  perform public.media_publication_append_event(
    job.id, actor, 'retry_requested', 'failed', 'failed', job.target, '{}'::jsonb
  );
  return public.media_execute_publication(p_job_id);
end;
$$;

revoke all on function public.media_retry_publication(uuid) from public;
grant execute on function public.media_retry_publication(uuid) to authenticated;
