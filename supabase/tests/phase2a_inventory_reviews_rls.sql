-- Phase 2A inventory reviews — RLS smoke expectations
-- Run after 20260729030000_media_phase2a_inventory_reviews.sql
--
-- Anonymous / no JWT: zero rows
-- select count(*) from public.media_inventory_reviews; -- expect 0 under anon
--
-- Authenticated without media_user_roles: media_is_staff()=false → zero rows
-- Authenticated reviewer/editor/admin/owner: select allowed; insert/update allowed
-- Viewer: select allowed (staff); insert/update denied by write policies

select to_regclass('public.media_inventory_reviews') as table_present;
