-- Phase 7 — SECURITY DEFINER corpus RPCs
-- Actor always from auth.uid(). Released versions are immutable.

-- ── Immutability guard ───────────────────────────────────────────────────────
create or replace function public.media_corpus_version_is_immutable(p_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.media_corpus_versions v
    where v.id = p_version_id
      and v.status in ('released', 'superseded', 'cancelled')
  );
$$;

create or replace function public.media_corpus_enforce_version_immutability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'media_corpus_versions' then
    if tg_op = 'UPDATE'
      and old.status in ('released', 'superseded', 'cancelled')
      and not (
        old.status = 'released'
        and new.status = 'superseded'
        and public.media_mutation_flag() = 'corpus_mutation'
      )
    then
      raise exception 'released corpus versions are immutable'
        using errcode = '22023';
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if public.media_corpus_version_is_immutable(
      case
        when tg_table_name = 'media_corpus_items' then old.version_id
        when tg_table_name = 'media_corpus_exports' then old.version_id
        else null
      end
    ) then
      raise exception 'released corpus versions are immutable'
        using errcode = '22023';
    end if;
    return old;
  end if;

  if tg_table_name = 'media_corpus_items' then
    if public.media_corpus_version_is_immutable(new.version_id)
      or public.media_corpus_version_is_immutable(coalesce(old.version_id, new.version_id))
    then
      raise exception 'released corpus versions are immutable'
        using errcode = '22023';
    end if;
  elsif tg_table_name = 'media_corpus_item_labels' then
    if exists (
      select 1
      from public.media_corpus_items i
      where i.id = coalesce(new.item_id, old.item_id)
        and public.media_corpus_version_is_immutable(i.version_id)
    ) then
      raise exception 'released corpus versions are immutable'
        using errcode = '22023';
    end if;
  elsif tg_table_name = 'media_corpus_reviews' then
    if exists (
      select 1
      from public.media_corpus_items i
      where i.id = coalesce(new.item_id, old.item_id)
        and public.media_corpus_version_is_immutable(i.version_id)
    ) then
      raise exception 'released corpus versions are immutable'
        using errcode = '22023';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists media_corpus_versions_immutable on public.media_corpus_versions;
create trigger media_corpus_versions_immutable
  before update on public.media_corpus_versions
  for each row execute function public.media_corpus_enforce_version_immutability();

drop trigger if exists media_corpus_items_immutable on public.media_corpus_items;
create trigger media_corpus_items_immutable
  before insert or update or delete on public.media_corpus_items
  for each row execute function public.media_corpus_enforce_version_immutability();

drop trigger if exists media_corpus_item_labels_immutable on public.media_corpus_item_labels;
create trigger media_corpus_item_labels_immutable
  before insert or update or delete on public.media_corpus_item_labels
  for each row execute function public.media_corpus_enforce_version_immutability();

drop trigger if exists media_corpus_reviews_immutable on public.media_corpus_reviews;
create trigger media_corpus_reviews_immutable
  before insert or update or delete on public.media_corpus_reviews
  for each row execute function public.media_corpus_enforce_version_immutability();

-- ── media_corpus_ensure_own_membership ───────────────────────────────────────
create or replace function public.media_corpus_ensure_own_membership(
  p_workspace_id text default 'bcs-default'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.media_require_auth();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
begin
  if not public.media_is_staff() then
    raise exception 'permission denied: workspace membership'
      using errcode = '42501';
  end if;
  if workspace <> 'bcs-default'
    and not (
      public.media_has_role('owner'::public.media_role)
      or public.media_has_role('administrator'::public.media_role)
    )
  then
    raise exception 'permission denied: non-default workspace membership'
      using errcode = '42501';
  end if;
  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_workspace_members (workspace_id, user_id, is_active)
  values (workspace, uid, true)
  on conflict (workspace_id, user_id) do update
    set is_active = true;
end;
$$;

revoke all on function public.media_corpus_ensure_own_membership(text) from public;
grant execute on function public.media_corpus_ensure_own_membership(text) to authenticated;

-- ── media_create_corpus ──────────────────────────────────────────────────────
create or replace function public.media_create_corpus(
  p_workspace_id text,
  p_name text,
  p_description text,
  p_intended_use text
)
returns public.media_corpora
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_draft();
  workspace text := coalesce(nullif(trim(p_workspace_id), ''), 'bcs-default');
  row public.media_corpora;
begin
  perform public.media_corpus_ensure_own_membership(workspace);
  perform public.media_corpus_require_member(workspace);

  if p_intended_use not in (
    'damage_detection', 'estimate_assist', 'quality_scoring',
    'privacy_detection', 'general_evaluation', 'other'
  ) then
    raise exception 'invalid intended use' using errcode = '22023';
  end if;

  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpora (
    external_id, workspace_id, name, description, intended_use,
    status, created_by, updated_by
  ) values (
    'corp_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
    workspace, trim(p_name), coalesce(p_description, ''), p_intended_use,
    'draft', actor, actor
  )
  returning * into row;

  -- First version
  insert into public.media_corpus_versions (
    corpus_id, version_number, status, notes, created_by
  ) values (
    row.id, 1, 'building', 'Initial version', actor
  );

  perform public.media_corpus_append_event(
    row.id, null, null, actor, 'corpus_created', null, 'draft',
    jsonb_build_object('workspace_id', workspace, 'intended_use', p_intended_use)
  );
  perform public.media_audit_write(
    'corpus_created', 'media_corpus', row.id::text, true,
    jsonb_build_object('workspace_id', workspace)
  );
  return row;
end;
$$;

revoke all on function public.media_create_corpus(text, text, text, text) from public;
grant execute on function public.media_create_corpus(text, text, text, text) to authenticated;

-- ── media_create_corpus_version ──────────────────────────────────────────────
create or replace function public.media_create_corpus_version(
  p_corpus_id uuid,
  p_notes text default ''
)
returns public.media_corpus_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_draft();
  corpus public.media_corpora;
  next_num integer;
  ver public.media_corpus_versions;
begin
  select * into corpus from public.media_corpora where id = p_corpus_id for update;
  if not found then
    raise exception 'corpus not found' using errcode = 'P0002';
  end if;
  perform public.media_corpus_require_member(corpus.workspace_id);
  if corpus.status = 'archived' then
    raise exception 'cannot version an archived corpus' using errcode = '22023';
  end if;

  select coalesce(max(version_number), 0) + 1 into next_num
  from public.media_corpus_versions where corpus_id = corpus.id;

  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpus_versions (
    corpus_id, version_number, status, notes, created_by
  ) values (
    corpus.id, next_num, 'building', coalesce(p_notes, ''), actor
  )
  returning * into ver;

  update public.media_corpora
  set status = case when status = 'approved' then 'draft' else status end,
      updated_by = actor,
      updated_at = now()
  where id = corpus.id;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, null, actor, 'version_created', null, 'building',
    jsonb_build_object('version_number', next_num)
  );
  return ver;
end;
$$;

revoke all on function public.media_create_corpus_version(uuid, text) from public;
grant execute on function public.media_create_corpus_version(uuid, text) to authenticated;

-- ── media_add_corpus_item ────────────────────────────────────────────────────
create or replace function public.media_add_corpus_item(
  p_version_id uuid,
  p_asset_external_id text,
  p_analysis_external_id text default null
)
returns public.media_corpus_items
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_draft();
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  elig jsonb;
  item public.media_corpus_items;
  prov jsonb;
begin
  select * into ver from public.media_corpus_versions where id = p_version_id for update;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);

  if ver.status <> 'building' then
    raise exception 'candidates may only be added while version is building'
      using errcode = '22023';
  end if;

  elig := public.media_corpus_asset_eligibility(corpus.workspace_id, p_asset_external_id);
  if (elig->>'eligible')::boolean is not true then
    raise exception 'asset is not eligible for corpus inclusion: %', elig->'findings'
      using errcode = '42501';
  end if;

  -- Exact duplicates must not create duplicated training examples in a version.
  if coalesce((elig->>'is_exact_duplicate')::boolean, false)
    and elig->>'duplicate_group' is not null
    and exists (
      select 1
      from public.media_corpus_items i
      where i.version_id = ver.id
        and i.duplicate_group_snapshot = elig->>'duplicate_group'
        and i.status in ('candidate', 'included', 'needs_review')
    )
  then
    raise exception 'exact duplicate group already represented in this version'
      using errcode = '22023';
  end if;

  prov := jsonb_build_object(
    'source_system', 'media_assets',
    'workspace_id', corpus.workspace_id,
    'asset_external_id', p_asset_external_id,
    'analysis_external_id', p_analysis_external_id,
    'captured_at', now()
  );
  if public.media_corpus_json_has_signed_url(prov) then
    raise exception 'signed URLs must not be persisted' using errcode = '22023';
  end if;

  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpus_items (
    version_id, asset_external_id, asset_revision, analysis_external_id,
    status, privacy_status_snapshot, is_exact_duplicate_snapshot,
    is_near_duplicate_snapshot, duplicate_group_snapshot,
    near_duplicate_group_snapshot, checksum_snapshot, provenance,
    created_by, updated_by
  ) values (
    ver.id,
    p_asset_external_id,
    coalesce((elig->>'revision')::integer, 1),
    p_analysis_external_id,
    case
      when (elig->'findings') @> '[{"code":"near_duplicate"}]'::jsonb
        then 'needs_review'
      else 'candidate'
    end,
    coalesce(elig->>'privacy_status', 'clear'),
    coalesce((elig->>'is_exact_duplicate')::boolean, false),
    coalesce((elig->>'is_near_duplicate')::boolean, false),
    elig->>'duplicate_group',
    elig->>'near_duplicate_group',
    elig->>'checksum',
    prov,
    actor, actor
  )
  returning * into item;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, item.id, actor, 'item_added', null, item.status,
    jsonb_build_object('asset_external_id', p_asset_external_id)
  );
  return item;
end;
$$;

revoke all on function public.media_add_corpus_item(uuid, text, text) from public;
grant execute on function public.media_add_corpus_item(uuid, text, text) to authenticated;

-- ── media_remove_corpus_item ─────────────────────────────────────────────────
create or replace function public.media_remove_corpus_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_draft();
  item public.media_corpus_items;
  ver public.media_corpus_versions;
  corpus public.media_corpora;
begin
  select * into item from public.media_corpus_items where id = p_item_id for update;
  if not found then
    raise exception 'corpus item not found' using errcode = 'P0002';
  end if;
  select * into ver from public.media_corpus_versions where id = item.version_id;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);
  if ver.status <> 'building' then
    raise exception 'candidates may only be removed while version is building'
      using errcode = '22023';
  end if;

  perform public.media_set_mutation_flag('corpus_mutation');
  delete from public.media_corpus_items where id = item.id;
  perform public.media_corpus_append_event(
    corpus.id, ver.id, item.id, actor, 'item_removed', item.status, null,
    jsonb_build_object('asset_external_id', item.asset_external_id)
  );
end;
$$;

revoke all on function public.media_remove_corpus_item(uuid) from public;
grant execute on function public.media_remove_corpus_item(uuid) to authenticated;

-- ── media_suggest_corpus_label (AI — never auto-confirms) ────────────────────
create or replace function public.media_suggest_corpus_label(
  p_item_id uuid,
  p_label_key text,
  p_label_value text,
  p_confidence numeric default null
)
returns public.media_corpus_item_labels
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_draft();
  item public.media_corpus_items;
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  label public.media_corpus_item_labels;
begin
  select * into item from public.media_corpus_items where id = p_item_id for update;
  if not found then
    raise exception 'corpus item not found' using errcode = 'P0002';
  end if;
  select * into ver from public.media_corpus_versions where id = item.version_id;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);
  if ver.status not in ('building', 'review_ready') then
    raise exception 'labels locked for this version status' using errcode = '22023';
  end if;

  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpus_item_labels (
    item_id, label_key, label_value, source, confidence, created_by
  ) values (
    item.id, trim(p_label_key), trim(p_label_value), 'ai_suggested', p_confidence, actor
  )
  on conflict (item_id, label_key, source) do update
    set label_value = excluded.label_value,
        confidence = excluded.confidence
  returning * into label;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, item.id, actor, 'label_ai_suggested', null, null,
    jsonb_build_object('label_key', label.label_key)
  );
  return label;
end;
$$;

revoke all on function public.media_suggest_corpus_label(uuid, text, text, numeric) from public;
grant execute on function public.media_suggest_corpus_label(uuid, text, text, numeric) to authenticated;

-- ── media_confirm_corpus_label (human only) ──────────────────────────────────
create or replace function public.media_confirm_corpus_label(
  p_item_id uuid,
  p_label_key text,
  p_label_value text
)
returns public.media_corpus_item_labels
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_review();
  item public.media_corpus_items;
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  label public.media_corpus_item_labels;
begin
  select * into item from public.media_corpus_items where id = p_item_id for update;
  if not found then
    raise exception 'corpus item not found' using errcode = 'P0002';
  end if;
  select * into ver from public.media_corpus_versions where id = item.version_id;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);
  if ver.status not in ('building', 'review_ready') then
    raise exception 'labels locked for this version status' using errcode = '22023';
  end if;

  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpus_item_labels (
    item_id, label_key, label_value, source, confidence, created_by
  ) values (
    item.id, trim(p_label_key), trim(p_label_value), 'human_confirmed', null, actor
  )
  on conflict (item_id, label_key, source) do update
    set label_value = excluded.label_value,
        created_by = excluded.created_by
  returning * into label;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, item.id, actor, 'label_human_confirmed', null, null,
    jsonb_build_object('label_key', label.label_key)
  );
  return label;
end;
$$;

revoke all on function public.media_confirm_corpus_label(uuid, text, text) from public;
grant execute on function public.media_confirm_corpus_label(uuid, text, text) to authenticated;

-- ── media_review_corpus_item ─────────────────────────────────────────────────
create or replace function public.media_review_corpus_item(
  p_item_id uuid,
  p_decision text,
  p_notes text default '',
  p_inclusion_reason text default null,
  p_exclusion_reason text default null
)
returns public.media_corpus_items
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_review();
  item public.media_corpus_items;
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  prev text;
  next_status text;
begin
  if p_decision not in ('include', 'exclude', 'needs_review', 'acknowledge_near_duplicate') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;

  select * into item from public.media_corpus_items where id = p_item_id for update;
  if not found then
    raise exception 'corpus item not found' using errcode = 'P0002';
  end if;
  select * into ver from public.media_corpus_versions where id = item.version_id;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);
  if ver.status not in ('building', 'review_ready') then
    raise exception 'reviews locked for this version status' using errcode = '22023';
  end if;

  -- Re-check eligibility for include
  if p_decision = 'include' then
    if item.privacy_status_snapshot is distinct from 'clear' then
      raise exception 'privacy-blocked assets cannot be included' using errcode = '42501';
    end if;
    if item.is_exact_duplicate_snapshot
      and (
        item.duplicate_group_snapshot is null
        or length(trim(item.duplicate_group_snapshot)) = 0
      )
    then
      raise exception 'unresolved exact duplicates cannot be included'
        using errcode = '42501';
    end if;
    if item.checksum_snapshot is null or length(trim(item.checksum_snapshot)) = 0 then
      raise exception 'checksum required for inclusion' using errcode = '42501';
    end if;
    if item.is_near_duplicate_snapshot and not item.near_duplicate_acknowledged
      and p_decision <> 'acknowledge_near_duplicate'
    then
      -- allow include only if already acknowledged
      raise exception 'near duplicates require explicit acknowledgement'
        using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.media_corpus_item_labels l
      where l.item_id = item.id and l.source = 'human_confirmed'
    ) then
      raise exception 'human-confirmed labels required for inclusion'
        using errcode = '42501';
    end if;
  end if;

  prev := item.status;
  next_status := case p_decision
    when 'include' then 'included'
    when 'exclude' then 'excluded'
    when 'needs_review' then 'needs_review'
    when 'acknowledge_near_duplicate' then item.status
  end;

  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpus_reviews (
    item_id, decision, notes, reviewer_id
  ) values (
    item.id, p_decision, coalesce(p_notes, ''), actor
  );

  update public.media_corpus_items
  set
    status = next_status,
    inclusion_reason = case
      when p_decision = 'include' then coalesce(p_inclusion_reason, inclusion_reason)
      else inclusion_reason
    end,
    exclusion_reason = case
      when p_decision = 'exclude' then coalesce(p_exclusion_reason, exclusion_reason)
      else exclusion_reason
    end,
    near_duplicate_acknowledged = case
      when p_decision = 'acknowledge_near_duplicate' then true
      else near_duplicate_acknowledged
    end,
    updated_by = actor,
    updated_at = now()
  where id = item.id
  returning * into item;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, item.id, actor, 'item_reviewed', prev, item.status,
    jsonb_build_object('decision', p_decision)
  );
  return item;
end;
$$;

revoke all on function public.media_review_corpus_item(uuid, text, text, text, text) from public;
grant execute on function public.media_review_corpus_item(uuid, text, text, text, text) to authenticated;

-- ── media_assign_corpus_split ────────────────────────────────────────────────
create or replace function public.media_assign_corpus_split(
  p_item_id uuid,
  p_split text
)
returns public.media_corpus_items
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid;
  item public.media_corpus_items;
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  conflict_split text;
begin
  -- Editors may assign while building; reviewers may adjust in review_ready.
  actor := public.media_require_auth();
  if not (
    public.media_has_role('editor'::public.media_role)
    or public.media_has_role('reviewer'::public.media_role)
    or public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    raise exception 'permission denied: assign corpus split'
      using errcode = '42501';
  end if;

  if p_split not in ('train', 'validation', 'test', 'holdout') then
    raise exception 'invalid dataset split' using errcode = '22023';
  end if;

  select * into item from public.media_corpus_items where id = p_item_id for update;
  if not found then
    raise exception 'corpus item not found' using errcode = 'P0002';
  end if;
  select * into ver from public.media_corpus_versions where id = item.version_id;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);
  if ver.status not in ('building', 'review_ready') then
    raise exception 'splits locked for this version status' using errcode = '22023';
  end if;

  -- Exact-duplicate group leakage prevention
  if item.duplicate_group_snapshot is not null
    and length(trim(item.duplicate_group_snapshot)) > 0
  then
    select i.dataset_split into conflict_split
    from public.media_corpus_items i
    where i.version_id = item.version_id
      and i.id <> item.id
      and i.duplicate_group_snapshot = item.duplicate_group_snapshot
      and i.dataset_split is not null
      and i.dataset_split is distinct from p_split
    limit 1;

    if conflict_split is not null then
      raise exception
        'exact duplicate group cannot span conflicting splits (% vs %)',
        conflict_split, p_split
        using errcode = '22023';
    end if;
  end if;

  perform public.media_set_mutation_flag('corpus_mutation');
  update public.media_corpus_items
  set dataset_split = p_split, updated_by = actor, updated_at = now()
  where id = item.id
  returning * into item;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, item.id, actor, 'split_assigned', null, null,
    jsonb_build_object('dataset_split', p_split)
  );
  return item;
end;
$$;

revoke all on function public.media_assign_corpus_split(uuid, text) from public;
grant execute on function public.media_assign_corpus_split(uuid, text) to authenticated;

-- ── Readiness helper ─────────────────────────────────────────────────────────
create or replace function public.media_corpus_version_readiness(p_version_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  total integer;
  included integer;
  missing_labels integer;
  missing_splits integer;
  near_unacked integer;
  errors jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
begin
  select * into ver from public.media_corpus_versions where id = p_version_id;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  if not public.media_is_workspace_member(corpus.workspace_id) then
    raise exception 'permission denied: not a workspace member'
      using errcode = '42501';
  end if;

  select count(*) into total from public.media_corpus_items where version_id = ver.id;
  select count(*) into included
  from public.media_corpus_items where version_id = ver.id and status = 'included';

  select count(*) into missing_labels
  from public.media_corpus_items i
  where i.version_id = ver.id
    and i.status = 'included'
    and not exists (
      select 1 from public.media_corpus_item_labels l
      where l.item_id = i.id and l.source = 'human_confirmed'
    );

  select count(*) into missing_splits
  from public.media_corpus_items i
  where i.version_id = ver.id
    and i.status = 'included'
    and i.dataset_split is null;

  select count(*) into near_unacked
  from public.media_corpus_items i
  where i.version_id = ver.id
    and i.status = 'included'
    and i.is_near_duplicate_snapshot
    and not i.near_duplicate_acknowledged;

  if total = 0 then
    errors := errors || jsonb_build_array(jsonb_build_object('code', 'no_items'));
  end if;
  if included = 0 then
    errors := errors || jsonb_build_array(jsonb_build_object('code', 'no_included_items'));
  end if;
  if missing_labels > 0 then
    errors := errors || jsonb_build_array(
      jsonb_build_object('code', 'missing_human_labels', 'count', missing_labels)
    );
  end if;
  if missing_splits > 0 then
    errors := errors || jsonb_build_array(
      jsonb_build_object('code', 'missing_splits', 'count', missing_splits)
    );
  end if;
  if near_unacked > 0 then
    errors := errors || jsonb_build_array(
      jsonb_build_object('code', 'near_duplicate_unacknowledged', 'count', near_unacked)
    );
  end if;

  if exists (
    select 1
    from public.media_corpus_items i
    where i.version_id = ver.id
      and i.is_near_duplicate_snapshot
      and i.status = 'included'
  ) then
    warnings := warnings || jsonb_build_array(
      jsonb_build_object('code', 'near_duplicates_present')
    );
  end if;

  return jsonb_build_object(
    'ready', jsonb_array_length(errors) = 0,
    'total_items', total,
    'included_items', included,
    'errors', errors,
    'warnings', warnings
  );
end;
$$;

revoke all on function public.media_corpus_version_readiness(uuid) from public;
grant execute on function public.media_corpus_version_readiness(uuid) to authenticated;

-- ── media_submit_corpus_version (admin+) ─────────────────────────────────────
create or replace function public.media_submit_corpus_version(p_version_id uuid)
returns public.media_corpus_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_approve();
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  prev text;
begin
  select * into ver from public.media_corpus_versions where id = p_version_id for update;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id for update;
  perform public.media_corpus_require_member(corpus.workspace_id);

  if not public.media_corpus_version_can_transition(ver.status, 'review_ready') then
    raise exception 'invalid version transition % → review_ready', ver.status
      using errcode = '22023';
  end if;

  prev := ver.status;
  perform public.media_set_mutation_flag('corpus_mutation');
  update public.media_corpus_versions
  set status = 'review_ready', updated_at = now()
  where id = ver.id
  returning * into ver;

  if public.media_corpus_can_transition(corpus.status, 'under_review') then
    update public.media_corpora
    set status = 'under_review', updated_by = actor, updated_at = now()
    where id = corpus.id;
  end if;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, null, actor, 'version_submitted', prev, 'review_ready',
    '{}'::jsonb
  );
  return ver;
end;
$$;

revoke all on function public.media_submit_corpus_version(uuid) from public;
grant execute on function public.media_submit_corpus_version(uuid) to authenticated;

-- ── media_approve_corpus_version (admin+) ────────────────────────────────────
create or replace function public.media_approve_corpus_version(p_version_id uuid)
returns public.media_corpus_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_can_approve();
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  readiness jsonb;
  prev text;
begin
  select * into ver from public.media_corpus_versions where id = p_version_id for update;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id for update;
  perform public.media_corpus_require_member(corpus.workspace_id);

  if not public.media_corpus_version_can_transition(ver.status, 'approved') then
    raise exception 'invalid version transition % → approved', ver.status
      using errcode = '22023';
  end if;

  readiness := public.media_corpus_version_readiness(ver.id);
  if (readiness->>'ready')::boolean is not true then
    raise exception 'version not ready for approval: %', readiness->'errors'
      using errcode = '22023';
  end if;

  -- Block privacy / archived snapshots on included items
  if exists (
    select 1 from public.media_corpus_items i
    where i.version_id = ver.id
      and i.status = 'included'
      and (
        i.privacy_status_snapshot is distinct from 'clear'
        or i.checksum_snapshot is null
        or length(trim(i.checksum_snapshot)) = 0
      )
  ) then
    raise exception 'included items fail eligibility policy'
      using errcode = '42501';
  end if;

  prev := ver.status;
  perform public.media_set_mutation_flag('corpus_mutation');
  update public.media_corpus_versions
  set status = 'approved', updated_at = now()
  where id = ver.id
  returning * into ver;

  if public.media_corpus_can_transition(corpus.status, 'approved')
    or corpus.status = 'under_review'
  then
    update public.media_corpora
    set status = 'approved', updated_by = actor, updated_at = now()
    where id = corpus.id;
  end if;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, null, actor, 'version_approved', prev, 'approved',
    '{}'::jsonb
  );
  return ver;
end;
$$;

revoke all on function public.media_approve_corpus_version(uuid) from public;
grant execute on function public.media_approve_corpus_version(uuid) to authenticated;

-- ── Manifest builder ─────────────────────────────────────────────────────────
create or replace function public.media_corpus_build_manifest(p_version_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  items jsonb;
  manifest jsonb;
  checksum text;
begin
  select * into ver from public.media_corpus_versions where id = p_version_id;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id;

  select coalesce(jsonb_agg(x.obj order by x.asset_external_id), '[]'::jsonb)
  into items
  from (
    select
      i.asset_external_id,
      jsonb_build_object(
        'assetExternalId', i.asset_external_id,
        'immutableAssetId', i.asset_external_id || '@' || i.asset_revision::text,
        'assetRevision', i.asset_revision,
        'analysisExternalId', i.analysis_external_id,
        'datasetSplit', i.dataset_split,
        'checksum', i.checksum_snapshot,
        'privacyStatus', i.privacy_status_snapshot,
        'isExactDuplicate', i.is_exact_duplicate_snapshot,
        'isNearDuplicate', i.is_near_duplicate_snapshot,
        'duplicateGroup', i.duplicate_group_snapshot,
        'nearDuplicateGroup', i.near_duplicate_group_snapshot,
        'nearDuplicateAcknowledged', i.near_duplicate_acknowledged,
        'confirmedLabels', coalesce((
          select jsonb_agg(
            jsonb_build_object('key', l.label_key, 'value', l.label_value)
            order by l.label_key
          )
          from public.media_corpus_item_labels l
          where l.item_id = i.id and l.source = 'human_confirmed'
        ), '[]'::jsonb),
        'aiSuggestedLabels', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'key', l.label_key,
              'value', l.label_value,
              'confidence', l.confidence
            )
            order by l.label_key
          )
          from public.media_corpus_item_labels l
          where l.item_id = i.id and l.source = 'ai_suggested'
        ), '[]'::jsonb),
        'provenance', i.provenance
      ) as obj
    from public.media_corpus_items i
    where i.version_id = ver.id
      and i.status = 'included'
  ) x;

  manifest := jsonb_build_object(
    'manifestSchemaVersion', ver.manifest_schema_version,
    'corpusId', corpus.external_id,
    'corpusUuid', corpus.id,
    'versionId', ver.id,
    'versionNumber', ver.version_number,
    'workspaceId', corpus.workspace_id,
    'intendedUse', corpus.intended_use,
    'releaseTimestamp', coalesce(ver.released_at, now()),
    'items', items
  );

  if public.media_corpus_json_has_signed_url(manifest) then
    raise exception 'manifest must not contain signed URLs or secrets'
      using errcode = '22023';
  end if;

  checksum := encode(
    digest(convert_to(manifest::text, 'UTF8'), 'sha256'),
    'hex'
  );
  manifest := manifest || jsonb_build_object('manifestChecksum', checksum);
  return manifest;
end;
$$;

revoke all on function public.media_corpus_build_manifest(uuid) from public;
grant execute on function public.media_corpus_build_manifest(uuid) to authenticated;

-- ── media_release_corpus_version (owner only) ────────────────────────────────
create or replace function public.media_release_corpus_version(p_version_id uuid)
returns public.media_corpus_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_owner();
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  readiness jsonb;
  manifest jsonb;
  prev text;
  other public.media_corpus_versions;
begin
  select * into ver from public.media_corpus_versions where id = p_version_id for update;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id for update;
  perform public.media_corpus_require_member(corpus.workspace_id);

  if not public.media_corpus_version_can_transition(ver.status, 'released') then
    raise exception 'invalid version transition % → released', ver.status
      using errcode = '22023';
  end if;

  readiness := public.media_corpus_version_readiness(ver.id);
  if (readiness->>'ready')::boolean is not true then
    raise exception 'version not ready for release: %', readiness->'errors'
      using errcode = '22023';
  end if;

  manifest := public.media_corpus_build_manifest(ver.id);
  prev := ver.status;

  perform public.media_set_mutation_flag('corpus_mutation');

  -- Supersede prior released versions
  for other in
    select * from public.media_corpus_versions
    where corpus_id = corpus.id
      and status = 'released'
      and id <> ver.id
    for update
  loop
    update public.media_corpus_versions
    set status = 'superseded', superseded_by = ver.id, updated_at = now()
    where id = other.id;
    perform public.media_corpus_append_event(
      corpus.id, other.id, null, actor, 'version_superseded',
      'released', 'superseded',
      jsonb_build_object('replacement_version_id', ver.id)
    );
  end loop;

  update public.media_corpus_versions
  set
    status = 'released',
    released_at = now(),
    released_by = actor,
    manifest_checksum = manifest->>'manifestChecksum',
    updated_at = now()
  where id = ver.id
  returning * into ver;

  insert into public.media_corpus_exports (
    version_id, format, status, manifest, manifest_checksum, created_by
  ) values (
    ver.id, 'json_manifest', 'ready', manifest,
    manifest->>'manifestChecksum', actor
  );

  update public.media_corpora
  set status = 'approved', updated_by = actor, updated_at = now()
  where id = corpus.id;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, null, actor, 'version_released', prev, 'released',
    jsonb_build_object('manifest_checksum', manifest->>'manifestChecksum')
  );
  perform public.media_audit_write(
    'corpus_version_released', 'media_corpus_version', ver.id::text, true,
    jsonb_build_object('corpus_id', corpus.external_id)
  );
  return ver;
end;
$$;

revoke all on function public.media_release_corpus_version(uuid) from public;
grant execute on function public.media_release_corpus_version(uuid) to authenticated;

-- ── media_cancel_corpus_version (owner) ──────────────────────────────────────
create or replace function public.media_cancel_corpus_version(p_version_id uuid)
returns public.media_corpus_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_owner();
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  prev text;
begin
  select * into ver from public.media_corpus_versions where id = p_version_id for update;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);

  if not public.media_corpus_version_can_transition(ver.status, 'cancelled') then
    raise exception 'invalid version transition % → cancelled', ver.status
      using errcode = '22023';
  end if;

  prev := ver.status;
  perform public.media_set_mutation_flag('corpus_mutation');
  update public.media_corpus_versions
  set status = 'cancelled', updated_at = now()
  where id = ver.id
  returning * into ver;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, null, actor, 'version_cancelled', prev, 'cancelled',
    '{}'::jsonb
  );
  return ver;
end;
$$;

revoke all on function public.media_cancel_corpus_version(uuid) from public;
grant execute on function public.media_cancel_corpus_version(uuid) to authenticated;

-- ── media_archive_corpus (owner) ─────────────────────────────────────────────
create or replace function public.media_archive_corpus(p_corpus_id uuid)
returns public.media_corpora
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_corpus_require_owner();
  corpus public.media_corpora;
  prev text;
begin
  select * into corpus from public.media_corpora where id = p_corpus_id for update;
  if not found then
    raise exception 'corpus not found' using errcode = 'P0002';
  end if;
  perform public.media_corpus_require_member(corpus.workspace_id);

  if not public.media_corpus_can_transition(corpus.status, 'archived') then
    raise exception 'invalid corpus transition % → archived', corpus.status
      using errcode = '22023';
  end if;

  prev := corpus.status;
  perform public.media_set_mutation_flag('corpus_mutation');
  update public.media_corpora
  set status = 'archived', archived_at = now(), updated_by = actor, updated_at = now()
  where id = corpus.id
  returning * into corpus;

  perform public.media_corpus_append_event(
    corpus.id, null, null, actor, 'corpus_archived', prev, 'archived',
    '{}'::jsonb
  );
  return corpus;
end;
$$;

revoke all on function public.media_archive_corpus(uuid) from public;
grant execute on function public.media_archive_corpus(uuid) to authenticated;

-- ── media_generate_corpus_export ─────────────────────────────────────────────
create or replace function public.media_generate_corpus_export(p_version_id uuid)
returns public.media_corpus_exports
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_require_auth();
  ver public.media_corpus_versions;
  corpus public.media_corpora;
  manifest jsonb;
  exp public.media_corpus_exports;
begin
  if not (
    public.media_has_role('administrator'::public.media_role)
    or public.media_has_role('owner'::public.media_role)
  ) then
    raise exception 'permission denied: generate corpus export'
      using errcode = '42501';
  end if;

  select * into ver from public.media_corpus_versions where id = p_version_id;
  if not found then
    raise exception 'corpus version not found' using errcode = 'P0002';
  end if;
  select * into corpus from public.media_corpora where id = ver.corpus_id;
  perform public.media_corpus_require_member(corpus.workspace_id);

  if ver.status <> 'released' then
    raise exception 'exports require a released version' using errcode = '22023';
  end if;

  manifest := public.media_corpus_build_manifest(ver.id);
  perform public.media_set_mutation_flag('corpus_mutation');
  insert into public.media_corpus_exports (
    version_id, format, status, manifest, manifest_checksum, created_by
  ) values (
    ver.id, 'json_manifest', 'ready', manifest,
    manifest->>'manifestChecksum', actor
  )
  returning * into exp;

  perform public.media_corpus_append_event(
    corpus.id, ver.id, null, actor, 'export_generated', null, null,
    jsonb_build_object('export_id', exp.id, 'manifest_checksum', exp.manifest_checksum)
  );
  return exp;
end;
$$;

revoke all on function public.media_generate_corpus_export(uuid) from public;
grant execute on function public.media_generate_corpus_export(uuid) to authenticated;
