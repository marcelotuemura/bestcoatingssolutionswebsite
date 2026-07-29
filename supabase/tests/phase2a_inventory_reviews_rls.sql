-- Phase 2A inventory reviews — RLS smoke expectations
-- Full local assertions: phase2a_inventory_reviews_rls_local.sql
-- Run after 20260729030000_media_phase2a_inventory_reviews.sql
--
-- Anonymous / no JWT: zero rows
-- Authenticated without media_user_roles: media_is_staff()=false → zero rows
-- Authenticated viewer: select allowed (staff); insert/update denied
-- Authenticated reviewer/editor/admin/owner: select + insert/update allowed
-- No DELETE policy — reviews retained
-- Upsert on asset_id PK; updated_at via clock_timestamp() trigger

select to_regclass('public.media_inventory_reviews') as table_present;
