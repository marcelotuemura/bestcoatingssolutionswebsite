import type { SupabaseClient } from '@supabase/supabase-js';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';
import type { AnalysisRepository } from '@/lib/media-intelligence/vision/analysis-repository';
import { createSupabaseServiceClient } from '@/lib/media-intelligence/supabase/client';
import { assetVisionAnalysisSchema } from '@/lib/media-intelligence/vision/schema';

function rowToAnalysis(row: Record<string, unknown>): AssetVisionAnalysis {
  const parsed = assetVisionAnalysisSchema.parse({
    assetId: row.asset_external_id ?? row.assetId,
    analysisVersion: row.analysis_version,
    analyzedAt: row.analyzed_at,
    provider: row.provider,
    providerModel: row.provider_model ?? undefined,
    confidence: Number(row.confidence ?? 0),
    boat: row.boat ?? {},
    services: row.services ?? [],
    stage: {
      stage: row.stage ?? 'unknown',
      confidence: Number(row.stage_confidence ?? 0),
    },
    quality: row.quality ?? {
      sharpness: 0,
      exposure: 0,
      blur: 0,
      noise: 0,
      composition: 0,
      orientationScore: 0,
      duplicateConfidence: 0,
      marketingSuitability: 0,
      heroSuitability: 0,
      overall: 0,
      explanation: [],
    },
    privacy: row.privacy ?? {
      findings: [],
      requiresOwnerReview: false,
      neverAutoModifyOriginal: true,
      blockAutoPublish: true,
    },
    keywords: row.keywords ?? [],
    tags: row.tags ?? [],
    notes: row.notes ?? undefined,
  });
  return parsed;
}

/**
 * PostgreSQL AI analysis persistence.
 * Marks new rows current without deleting history.
 */
export class PostgresAnalysisRepository implements AnalysisRepository {
  readonly name = 'postgres-analysis-repository';

  constructor(
    private readonly clientFactory: () => SupabaseClient = createSupabaseServiceClient,
  ) {}

  private client(): SupabaseClient {
    return this.clientFactory();
  }

  private async resolveAssetUuid(
    externalId: string,
  ): Promise<string | undefined> {
    const { data } = await this.client()
      .from('media_assets')
      .select('id')
      .eq('external_id', externalId)
      .maybeSingle();
    return data?.id as string | undefined;
  }

  async getCurrent(assetId: string): Promise<AssetVisionAnalysis | undefined> {
    const uuid = await this.resolveAssetUuid(assetId);
    if (!uuid) return undefined;
    const { data, error } = await this.client()
      .from('media_ai_analyses')
      .select('*, media_assets!inner(external_id)')
      .eq('asset_id', uuid)
      .eq('is_current', true)
      .maybeSingle();
    if (error || !data) return undefined;
    return rowToAnalysis({
      ...data,
      asset_external_id: (data.media_assets as { external_id: string })
        .external_id,
      services: [],
      privacy: {
        findings: [],
        requiresOwnerReview: false,
        neverAutoModifyOriginal: true,
        blockAutoPublish: true,
      },
    });
  }

  async listHistory(assetId: string): Promise<readonly AssetVisionAnalysis[]> {
    const uuid = await this.resolveAssetUuid(assetId);
    if (!uuid) return [];
    const { data } = await this.client()
      .from('media_ai_analyses')
      .select('*, media_assets!inner(external_id)')
      .eq('asset_id', uuid)
      .order('analyzed_at', { ascending: false });
    return (data ?? []).map((row) =>
      rowToAnalysis({
        ...row,
        asset_external_id: (row.media_assets as { external_id: string })
          .external_id,
        services: [],
        privacy: {
          findings: [],
          requiresOwnerReview: false,
          neverAutoModifyOriginal: true,
          blockAutoPublish: true,
        },
      }),
    );
  }

  async listCurrent(): Promise<readonly AssetVisionAnalysis[]> {
    const { data } = await this.client()
      .from('media_ai_analyses')
      .select('*, media_assets!inner(external_id)')
      .eq('is_current', true);
    return (data ?? []).map((row) =>
      rowToAnalysis({
        ...row,
        asset_external_id: (row.media_assets as { external_id: string })
          .external_id,
        services: [],
        privacy: {
          findings: [],
          requiresOwnerReview: false,
          neverAutoModifyOriginal: true,
          blockAutoPublish: true,
        },
      }),
    );
  }

  async saveCurrent(analysis: AssetVisionAnalysis): Promise<void> {
    await this.saveBatch([analysis]);
  }

  async saveBatch(analyses: readonly AssetVisionAnalysis[]): Promise<void> {
    const client = this.client();
    for (const analysis of analyses) {
      const uuid = await this.resolveAssetUuid(analysis.assetId);
      if (!uuid) continue;

      await client
        .from('media_ai_analyses')
        .update({ is_current: false })
        .eq('asset_id', uuid)
        .eq('is_current', true);

      const { data: inserted, error } = await client
        .from('media_ai_analyses')
        .insert({
          asset_id: uuid,
          analysis_version: analysis.analysisVersion,
          analyzed_at: analysis.analyzedAt,
          provider: analysis.provider,
          provider_model: analysis.providerModel,
          confidence: analysis.confidence,
          stage: analysis.stage.stage,
          stage_confidence: analysis.stage.confidence,
          quality: analysis.quality,
          boat: analysis.boat,
          keywords: analysis.keywords,
          tags: analysis.tags,
          notes: analysis.notes,
          is_current: true,
        })
        .select('id')
        .single();
      if (error) throw new Error(error.message);

      if (inserted?.id && analysis.services.length) {
        await client.from('media_ai_detections').insert(
          analysis.services.map((s) => ({
            analysis_id: inserted.id,
            detection_kind: 'service',
            label: s.category,
            confidence: s.confidence,
            payload: s,
          })),
        );
      }

      if (inserted?.id && analysis.privacy.findings.length) {
        await client.from('media_privacy_flags').insert(
          analysis.privacy.findings.map((f) => ({
            asset_id: uuid,
            analysis_id: inserted.id,
            risk: f.risk,
            confidence: f.confidence,
            requires_owner_review: true,
            suggestion: f.suggestion,
            notes: f.notes,
          })),
        );
      }
    }
  }
}
