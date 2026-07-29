/**
 * In-memory inventory review repository (unit tests).
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import type { InventoryReviewRepository } from '@/lib/media-pipeline/review/repository';
import { emptyReviewState } from '@/lib/media-pipeline/review/state';
import type {
  MediaReviewOverride,
  MediaReviewState,
} from '@/lib/media-pipeline/types';

const globalStore = globalThis as typeof globalThis & {
  __bcsInventoryReviewMemory?: Map<string, MediaReviewOverride>;
};

function store(): Map<string, MediaReviewOverride> {
  if (!globalStore.__bcsInventoryReviewMemory) {
    globalStore.__bcsInventoryReviewMemory = new Map();
  }
  return globalStore.__bcsInventoryReviewMemory;
}

export function clearMemoryInventoryReviewsForTests(): void {
  store().clear();
}

export class MemoryReviewRepository implements InventoryReviewRepository {
  readonly mode = 'memory' as const;

  async getReviewState(): Promise<MediaReviewState> {
    const overrides = [...store().values()].sort((a, b) =>
      a.assetId.localeCompare(b.assetId),
    );
    const updatedAt =
      overrides
        .map((o) => o.updatedAt)
        .sort()
        .at(-1) ?? new Date(0).toISOString();
    return {
      ...emptyReviewState(updatedAt),
      overrides,
      beforeAfterPairs: [],
    };
  }

  async getReviewForAsset(
    assetId: string,
  ): Promise<MediaReviewOverride | null> {
    return store().get(assetId) ?? null;
  }

  async listReviews(): Promise<readonly MediaReviewOverride[]> {
    return [...store().values()].sort((a, b) =>
      a.assetId.localeCompare(b.assetId),
    );
  }

  async upsertReview(
    override: MediaReviewOverride,
    _actor: MediaTrustedActor,
  ): Promise<MediaReviewOverride> {
    store().set(override.assetId, override);
    return override;
  }
}
