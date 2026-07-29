/**
 * Runtime selection for inventory review persistence.
 * Production never silently falls back to JSON files.
 */

import { isPublicationPostgresConfigured } from '@/lib/media-intelligence/publishers/pg';
import type { InventoryReviewRepositoryMode } from '@/lib/media-pipeline/review/repository';

function isProductionLike(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.MEDIA_SUPABASE_ENV === 'production' ||
    process.env.MEDIA_SUPABASE_ENV === 'staging'
  );
}

/**
 * MEDIA_INVENTORY_REVIEW_REPOSITORY=
 *   supabase | postgres | pg  → Postgres/Supabase (default when DB URL set)
 *   memory                    → in-process (unit tests)
 *   file                      → data/media-review-state.json (local only)
 */
export function resolveInventoryReviewRepositoryMode(): InventoryReviewRepositoryMode {
  const explicit =
    process.env.MEDIA_INVENTORY_REVIEW_REPOSITORY?.trim().toLowerCase() ?? '';

  if (explicit === 'memory') {
    if (isProductionLike() && process.env.VERCEL_ENV === 'production') {
      throw new Error(
        'MEDIA_INVENTORY_REVIEW_REPOSITORY=memory is forbidden in production.',
      );
    }
    return 'memory';
  }

  if (explicit === 'file') {
    if (isProductionLike()) {
      throw new Error(
        'MEDIA_INVENTORY_REVIEW_REPOSITORY=file is forbidden in production/staging. Use Supabase/Postgres.',
      );
    }
    return 'file';
  }

  if (explicit === 'supabase' || explicit === 'postgres' || explicit === 'pg') {
    if (!isPublicationPostgresConfigured()) {
      throw new Error(
        'Inventory review Supabase/Postgres selected but DATABASE_URL / MEDIA_PUBLICATION_DATABASE_URL / SUPABASE_DB_URL is not set.',
      );
    }
    return 'supabase';
  }

  if (explicit) {
    throw new Error(
      `Invalid MEDIA_INVENTORY_REVIEW_REPOSITORY=${explicit}. Use supabase|file|memory.`,
    );
  }

  // Default: Supabase/Postgres when configured; otherwise fail closed in prod-like,
  // allow memory only in vitest/node test.
  if (isPublicationPostgresConfigured()) {
    return 'supabase';
  }

  if (isProductionLike()) {
    throw new Error(
      'Inventory review persistence requires Postgres/Supabase in production. Set MEDIA_PUBLICATION_DATABASE_URL (or SUPABASE_DB_URL / DATABASE_URL).',
    );
  }

  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') {
    return 'memory';
  }

  throw new Error(
    'Inventory review repository is not configured. Set MEDIA_INVENTORY_REVIEW_REPOSITORY=file for local JSON, or configure Postgres and use supabase.',
  );
}
