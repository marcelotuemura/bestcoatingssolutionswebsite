-- Phase 5 — RLS policy verification helpers (run in SQL editor / pgTAP if available)
-- These statements document expected boundaries; CI uses TypeScript role-matrix tests.

-- Expect: anon sees zero rows
-- set role anon;
-- select count(*) from media_assets;  -- 0

-- Expect: authenticated without media_user_roles sees zero staff rows via media_is_staff()
-- select public.media_is_staff(); -- false when no roles

-- Expect: viewer cannot insert into media_user_roles
-- Expect: only owner can insert media_user_roles
-- Expect: storage.buckets.public = false for all media-* buckets
select id, name, public
from storage.buckets
where id like 'media-%';

comment on schema public is
  'Phase 5 DAMS: RLS enabled on all media_* tables; anon denied by default.';
