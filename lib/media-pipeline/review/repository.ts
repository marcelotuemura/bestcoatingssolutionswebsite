/**
 * Inventory review repository — production = Supabase/Postgres; file = local/test only.
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import type {
  MediaReviewOverride,
  MediaReviewState,
} from '@/lib/media-pipeline/types';

export type InventoryReviewRepositoryMode = 'supabase' | 'file' | 'memory';

export interface InventoryReviewRepository {
  readonly mode: InventoryReviewRepositoryMode;
  getReviewState(): Promise<MediaReviewState>;
  getReviewForAsset(assetId: string): Promise<MediaReviewOverride | null>;
  listReviews(): Promise<readonly MediaReviewOverride[]>;
  upsertReview(
    override: MediaReviewOverride,
    actor: MediaTrustedActor,
  ): Promise<MediaReviewOverride>;
}

export type ResolveReviewRepositoryOptions = {
  readonly repoRoot?: string;
  /** Force mode (tests). */
  readonly mode?: InventoryReviewRepositoryMode;
};
