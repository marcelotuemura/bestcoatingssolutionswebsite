/**
 * Publication runtime backend selection.
 *
 * Default: PostgreSQL (required for app/UI/server actions).
 * Memory: only when MEDIA_PUBLICATION_REPOSITORY=memory (unit tests).
 */

import { isPublicationPostgresConfigured } from '@/lib/media-intelligence/publishers/pg';

export type PublicationRepositoryMode = 'postgres' | 'memory';

export function resolvePublicationRepositoryMode(): PublicationRepositoryMode {
  const explicit =
    process.env.MEDIA_PUBLICATION_REPOSITORY?.trim().toLowerCase();
  if (explicit === 'memory') {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.VERCEL_ENV === 'production'
    ) {
      throw new Error(
        'MEDIA_PUBLICATION_REPOSITORY=memory is forbidden in production.',
      );
    }
    return 'memory';
  }
  if (explicit === 'postgres' || explicit === 'pg' || explicit === 'supabase') {
    return 'postgres';
  }
  // Default runtime path is PostgreSQL.
  if (!isPublicationPostgresConfigured()) {
    throw new Error(
      'Publication PostgreSQL is not configured. Set MEDIA_PUBLICATION_DATABASE_URL (or SUPABASE_DB_URL / DATABASE_URL). Unit tests may set MEDIA_PUBLICATION_REPOSITORY=memory.',
    );
  }
  return 'postgres';
}

export function isMemoryPublicationRepositoryEnabled(): boolean {
  try {
    return resolvePublicationRepositoryMode() === 'memory';
  } catch {
    return false;
  }
}
