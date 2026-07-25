-- Phase 5 — Private Supabase Storage buckets (never public)
-- Object keys are collision-safe relative paths only (no absolute FS paths).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media-originals', 'media-originals', false, 524288000, null),
  ('media-thumbnails', 'media-thumbnails', false, 52428800, array['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('media-previews', 'media-previews', false, 104857600, array['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('media-webp', 'media-webp', false, 104857600, array['image/webp']::text[]),
  ('media-avif', 'media-avif', false, 104857600, array['image/avif']::text[]),
  ('media-video-posters', 'media-video-posters', false, 52428800, array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set public = excluded.public;

-- Authenticated staff may read; only owner/admin may write originals/derivatives.
drop policy if exists media_storage_select on storage.objects;
create policy media_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id in (
      'media-originals',
      'media-thumbnails',
      'media-previews',
      'media-webp',
      'media-avif',
      'media-video-posters'
    )
    and public.media_is_staff()
  );

drop policy if exists media_storage_insert on storage.objects;
create policy media_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id in (
      'media-originals',
      'media-thumbnails',
      'media-previews',
      'media-webp',
      'media-avif',
      'media-video-posters'
    )
    and (
      public.media_has_role('owner')
      or public.media_has_role('administrator')
    )
  );

-- Originals are immutable by application policy — no update/delete for authenticated.
drop policy if exists media_storage_no_update_originals on storage.objects;
create policy media_storage_no_update_originals on storage.objects
  for update to authenticated
  using (
    bucket_id <> 'media-originals'
    and (
      public.media_has_role('owner')
      or public.media_has_role('administrator')
    )
  )
  with check (
    bucket_id <> 'media-originals'
    and (
      public.media_has_role('owner')
      or public.media_has_role('administrator')
    )
  );

drop policy if exists media_storage_no_delete_originals on storage.objects;
create policy media_storage_no_delete_originals on storage.objects
  for delete to authenticated
  using (
    bucket_id <> 'media-originals'
    and public.media_has_role('owner')
  );
