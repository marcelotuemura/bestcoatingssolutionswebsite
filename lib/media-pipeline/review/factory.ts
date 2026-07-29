/**
 * Factory for inventory review repositories.
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { FileReviewRepository } from '@/lib/media-pipeline/review/file-repository';
import { MemoryReviewRepository } from '@/lib/media-pipeline/review/memory-repository';
import type { InventoryReviewRepository } from '@/lib/media-pipeline/review/repository';
import { resolveInventoryReviewRepositoryMode } from '@/lib/media-pipeline/review/runtime';
import { SupabaseReviewRepository } from '@/lib/media-pipeline/review/supabase-repository';
import type {
  MediaReviewOverride,
  MediaReviewState,
} from '@/lib/media-pipeline/types';

let cached: InventoryReviewRepository | null = null;
let cachedMode: string | null = null;

export function getInventoryReviewRepository(
  repoRoot = process.cwd(),
): InventoryReviewRepository {
  const mode = resolveInventoryReviewRepositoryMode();
  if (cached && cachedMode === mode && cached.mode === mode) {
    return cached;
  }
  cachedMode = mode;
  switch (mode) {
    case 'supabase':
      cached = new SupabaseReviewRepository();
      break;
    case 'file':
      cached = new FileReviewRepository(repoRoot);
      break;
    case 'memory':
      cached = new MemoryReviewRepository();
      break;
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unhandled review repository mode: ${_exhaustive}`);
    }
  }
  return cached;
}

export function __resetInventoryReviewRepositoryForTests(): void {
  cached = null;
  cachedMode = null;
}

/** Actor-aware load — required for Supabase RLS. */
export async function loadReviewState(
  actor: MediaTrustedActor,
  repoRoot = process.cwd(),
): Promise<MediaReviewState> {
  const repo = getInventoryReviewRepository(repoRoot);
  if (repo instanceof SupabaseReviewRepository) {
    return repo.getReviewStateForActor(actor);
  }
  return repo.getReviewState();
}

export async function persistReviewOverride(
  override: MediaReviewOverride & { readonly projectSlug: string },
  actor: MediaTrustedActor,
  repoRoot = process.cwd(),
): Promise<MediaReviewOverride> {
  const repo = getInventoryReviewRepository(repoRoot);
  return repo.upsertReview(override, actor);
}
