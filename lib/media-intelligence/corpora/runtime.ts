/**
 * Corpus runtime backend selection.
 * Default: PostgreSQL. Memory: MEDIA_CORPUS_REPOSITORY=memory (unit tests only).
 */

import { isPublicationPostgresConfigured } from '@/lib/media-intelligence/publishers/pg';

export type CorpusRepositoryMode = 'postgres' | 'memory';

export function resolveCorpusRepositoryMode(): CorpusRepositoryMode {
  const explicit = process.env.MEDIA_CORPUS_REPOSITORY?.trim().toLowerCase();
  if (explicit === 'memory') {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.VERCEL_ENV === 'production'
    ) {
      throw new Error(
        'MEDIA_CORPUS_REPOSITORY=memory is forbidden in production.',
      );
    }
    return 'memory';
  }
  if (explicit === 'postgres' || explicit === 'pg' || explicit === 'supabase') {
    return 'postgres';
  }
  if (!isPublicationPostgresConfigured()) {
    throw new Error(
      'Corpus PostgreSQL is not configured. Set MEDIA_PUBLICATION_DATABASE_URL (or SUPABASE_DB_URL / DATABASE_URL). Unit tests may set MEDIA_CORPUS_REPOSITORY=memory.',
    );
  }
  return 'postgres';
}

export function isMemoryCorpusRepositoryEnabled(): boolean {
  try {
    return resolveCorpusRepositoryMode() === 'memory';
  } catch {
    return false;
  }
}
