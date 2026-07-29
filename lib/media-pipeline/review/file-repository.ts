/**
 * File-backed inventory review repository — local development / fixtures ONLY.
 * Forbidden in production (enforced by resolveInventoryReviewRepositoryMode).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { MEDIA_REVIEW_STATE_PATH } from '@/lib/media-pipeline/constants';
import type { InventoryReviewRepository } from '@/lib/media-pipeline/review/repository';
import {
  emptyReviewState,
  upsertReviewOverride,
} from '@/lib/media-pipeline/review/state';
import type {
  MediaReviewOverride,
  MediaReviewState,
} from '@/lib/media-pipeline/types';
import { mediaReviewStateSchema } from '@/lib/media-pipeline/types';

function assertNotProductionFilesystem(): void {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.MEDIA_SUPABASE_ENV === 'production' ||
    process.env.MEDIA_SUPABASE_ENV === 'staging'
  ) {
    throw new Error(
      'FileReviewRepository cannot persist inventory reviews in production/staging',
    );
  }
}

export class FileReviewRepository implements InventoryReviewRepository {
  readonly mode = 'file' as const;
  private readonly repoRoot: string;
  private readonly relativePath: string;

  constructor(
    repoRoot: string,
    relativePath: string = MEDIA_REVIEW_STATE_PATH,
  ) {
    this.repoRoot = repoRoot;
    this.relativePath = relativePath;
  }

  private fullPath(): string {
    return path.join(this.repoRoot, this.relativePath);
  }

  async getReviewState(): Promise<MediaReviewState> {
    try {
      const raw = await fs.readFile(this.fullPath(), 'utf8');
      return mediaReviewStateSchema.parse(JSON.parse(raw));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') return emptyReviewState();
      throw err;
    }
  }

  async getReviewForAsset(
    assetId: string,
  ): Promise<MediaReviewOverride | null> {
    const state = await this.getReviewState();
    return state.overrides.find((o) => o.assetId === assetId) ?? null;
  }

  async listReviews(): Promise<readonly MediaReviewOverride[]> {
    const state = await this.getReviewState();
    return state.overrides;
  }

  async upsertReview(
    override: MediaReviewOverride,
    _actor: MediaTrustedActor,
  ): Promise<MediaReviewOverride> {
    assertNotProductionFilesystem();
    const state = await this.getReviewState();
    const next = upsertReviewOverride(state, override);
    const full = this.fullPath();
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    return override;
  }
}
