/**
 * Gallery runtime backend selection.
 *
 * Default: PostgreSQL (required for app/UI/server actions).
 * Memory: only when MEDIA_GALLERY_REPOSITORY=memory (unit tests).
 */

import { isPublicationPostgresConfigured } from '@/lib/media-intelligence/publishers/pg';

export type GalleryRepositoryMode = 'postgres' | 'memory';

export function resolveGalleryRepositoryMode(): GalleryRepositoryMode {
  const explicit = process.env.MEDIA_GALLERY_REPOSITORY?.trim().toLowerCase();
  if (explicit === 'memory') {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.VERCEL_ENV === 'production'
    ) {
      throw new Error(
        'MEDIA_GALLERY_REPOSITORY=memory is forbidden in production.',
      );
    }
    return 'memory';
  }
  if (explicit === 'postgres' || explicit === 'pg' || explicit === 'supabase') {
    return 'postgres';
  }
  if (!isPublicationPostgresConfigured()) {
    throw new Error(
      'Gallery PostgreSQL is not configured. Set MEDIA_PUBLICATION_DATABASE_URL (or SUPABASE_DB_URL / DATABASE_URL). Unit tests may set MEDIA_GALLERY_REPOSITORY=memory.',
    );
  }
  return 'postgres';
}

export function isMemoryGalleryRepositoryEnabled(): boolean {
  try {
    return resolveGalleryRepositoryMode() === 'memory';
  } catch {
    return false;
  }
}
