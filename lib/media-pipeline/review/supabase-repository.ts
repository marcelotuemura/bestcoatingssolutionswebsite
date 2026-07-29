/**
 * Supabase/Postgres-backed inventory review repository (production default).
 * Uses the same publication pool + actor JWT pattern as gallery/publishers.
 */

import type { PoolClient } from 'pg';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { withPublicationActor } from '@/lib/media-intelligence/publishers/pg';
import type { InventoryReviewRepository } from '@/lib/media-pipeline/review/repository';
import { emptyReviewState } from '@/lib/media-pipeline/review/state';
import type {
  MediaReviewOverride,
  MediaReviewState,
  PrivacyChecklist,
} from '@/lib/media-pipeline/types';
import {
  mediaReviewOverrideSchema,
  privacyChecklistSchema,
} from '@/lib/media-pipeline/types';

type ReviewRow = {
  asset_id: string;
  project_slug: string;
  division: string | null;
  stage: string | null;
  category: string | null;
  asset_status: string | null;
  privacy_status: string;
  quality_status: string | null;
  publish_status: string;
  featured: boolean;
  hero_candidate: boolean;
  alt_text: string | null;
  caption: string | null;
  notes: string | null;
  privacy_checklist: PrivacyChecklist | Record<string, unknown>;
  reviewed_at: Date | string | null;
  reviewed_by: string | null;
  reviewed_by_user_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function iso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function rowToOverride(row: ReviewRow): MediaReviewOverride {
  const checklist = privacyChecklistSchema.parse(row.privacy_checklist ?? {});
  return mediaReviewOverrideSchema.parse({
    assetId: row.asset_id,
    division: row.division ?? undefined,
    stage: row.stage ?? undefined,
    category: row.category ?? undefined,
    status: row.asset_status ?? undefined,
    privacyStatus: row.privacy_status,
    qualityStatus: row.quality_status ?? undefined,
    publishStatus: row.publish_status,
    featured: row.featured,
    heroCandidate: row.hero_candidate,
    altText: row.alt_text,
    caption: row.caption,
    notes: row.notes,
    privacyChecklist: checklist,
    updatedAt: iso(row.updated_at)!,
    updatedBy: row.reviewed_by,
  });
}

async function selectAll(client: PoolClient): Promise<ReviewRow[]> {
  const result = await client.query<ReviewRow>(
    `select * from public.media_inventory_reviews order by asset_id asc`,
  );
  return result.rows;
}

export class SupabaseReviewRepository implements InventoryReviewRepository {
  readonly mode = 'supabase' as const;

  async getReviewState(): Promise<MediaReviewState> {
    // Read path still needs an actor for RLS — callers should prefer
    // getReviewStateForActor. This throws to avoid silent empty prod reads.
    throw new Error(
      'SupabaseReviewRepository.getReviewState requires an actor. Use getReviewStateForActor().',
    );
  }

  async getReviewStateForActor(
    actor: MediaTrustedActor,
  ): Promise<MediaReviewState> {
    return withPublicationActor(actor, async (client) => {
      const rows = await selectAll(client);
      const overrides = rows.map(rowToOverride);
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
    });
  }

  async getReviewForAsset(
    assetId: string,
    actor?: MediaTrustedActor,
  ): Promise<MediaReviewOverride | null> {
    if (!actor) {
      throw new Error('getReviewForAsset requires a trusted actor under RLS');
    }
    return withPublicationActor(actor, async (client) => {
      const result = await client.query<ReviewRow>(
        `select * from public.media_inventory_reviews where asset_id = $1`,
        [assetId],
      );
      const row = result.rows[0];
      return row ? rowToOverride(row) : null;
    });
  }

  async listReviews(
    actor?: MediaTrustedActor,
  ): Promise<readonly MediaReviewOverride[]> {
    if (!actor) {
      throw new Error('listReviews requires a trusted actor under RLS');
    }
    const state = await this.getReviewStateForActor(actor);
    return state.overrides;
  }

  async upsertReview(
    override: MediaReviewOverride,
    actor: MediaTrustedActor,
  ): Promise<MediaReviewOverride> {
    return withPublicationActor(actor, async (client, actorUuid) => {
      const checklist = privacyChecklistSchema.parse(
        override.privacyChecklist ?? {},
      );
      const result = await client.query<ReviewRow>(
        `insert into public.media_inventory_reviews (
          asset_id, project_slug, division, stage, category, asset_status,
          privacy_status, quality_status, publish_status, featured, hero_candidate,
          alt_text, caption, notes, privacy_checklist, reviewed_at, reviewed_by,
          reviewed_by_user_id, updated_at
        ) values (
          $1,$2,$3,$4,$5,$6,
          $7,$8,$9,$10,$11,
          $12,$13,$14,$15::jsonb,$16,$17,
          $18::uuid, now()
        )
        on conflict (asset_id) do update set
          project_slug = excluded.project_slug,
          division = excluded.division,
          stage = excluded.stage,
          category = excluded.category,
          asset_status = excluded.asset_status,
          privacy_status = excluded.privacy_status,
          quality_status = excluded.quality_status,
          publish_status = excluded.publish_status,
          featured = excluded.featured,
          hero_candidate = excluded.hero_candidate,
          alt_text = excluded.alt_text,
          caption = excluded.caption,
          notes = excluded.notes,
          privacy_checklist = excluded.privacy_checklist,
          reviewed_at = excluded.reviewed_at,
          reviewed_by = excluded.reviewed_by,
          reviewed_by_user_id = excluded.reviewed_by_user_id,
          updated_at = now()
        returning *`,
        [
          override.assetId,
          override.projectSlug ?? 'unknown',
          override.division ?? null,
          override.stage ?? null,
          override.category ?? null,
          override.status ?? null,
          override.privacyStatus ?? 'unchecked',
          override.qualityStatus ?? null,
          override.publishStatus ?? 'not-published',
          override.featured ?? false,
          override.heroCandidate ?? false,
          override.altText ?? null,
          override.caption ?? null,
          override.notes ?? null,
          JSON.stringify(checklist),
          checklist.reviewedAt,
          override.updatedBy ?? actor.id,
          actorUuid,
        ],
      );
      const row = result.rows[0];
      if (!row) throw new Error('Upsert returned no row');
      return rowToOverride(row);
    });
  }
}

/** Extended override used for DB writes. */
export type InventoryReviewUpsert = MediaReviewOverride & {
  readonly projectSlug: string;
};
