-- Phase 7 gallery corrections — use review_mutation flag for asset review RPC.
-- Fixes media_gallery_review_asset: reviewer role has no editor/admin/owner, so
-- the Phase 5 editor_metadata trigger path would deny the UPDATE.  We add a
-- dedicated review_mutation branch in both the trigger and the RPC.

-- ── 1. Extend media_enforce_assets_mutation to allow review_mutation ──────
create or replace function public.media_enforce_assets_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  flag text := public.media_mutation_flag();
begin
  if public.media_is_service_context() or public.media_is_owner_or_admin() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Editor metadata RPC: editors, admins, owners may write
  if tg_op = 'UPDATE' and flag = 'editor_metadata' then
    if public.media_has_role('editor'::public.media_role)
       or public.media_has_role('administrator'::public.media_role)
       or public.media_has_role('owner'::public.media_role) then
      return new;
    end if;
  end if;

  -- Review mutation: reviewers, admins, and owners may update review_status
  if tg_op = 'UPDATE' and flag = 'review_mutation' then
    if public.media_has_role('reviewer'::public.media_role)
       or public.media_has_role('administrator'::public.media_role)
       or public.media_has_role('owner'::public.media_role) then
      return new;
    end if;
  end if;

  raise exception 'permission denied for media_assets' using errcode = '42501';
end;
$$;

-- ── 2. Reissue media_gallery_review_asset using review_mutation flag ──────
create or replace function public.media_gallery_review_asset(
  p_asset_external_id text,
  p_decision text,
  p_notes text default ''
)
returns public.media_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := public.media_gallery_require_can_review();
  asset public.media_assets;
  next_status text;
begin
  if p_decision not in ('approve', 'reject', 'in_review') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;
  select * into asset from public.media_assets where external_id = p_asset_external_id for update;
  if not found then
    raise exception 'asset not found' using errcode = 'P0002';
  end if;
  perform public.media_gallery_require_member(asset.workspace_id);
  next_status := case p_decision
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    else 'in_review'
  end;
  perform public.media_set_mutation_flag('review_mutation');
  update public.media_assets
  set review_status = next_status, updated_at = now()
  where id = asset.id
  returning * into asset;
  perform public.media_gallery_append_event(
    asset.workspace_id, actor, 'asset_reviewed', asset.external_id, null,
    jsonb_build_object('decision', p_decision, 'notes', left(coalesce(p_notes, ''), 200))
  );
  return asset;
end;
$$;

revoke all on function public.media_gallery_review_asset(text, text, text) from public;
grant execute on function public.media_gallery_review_asset(text, text, text) to authenticated;
