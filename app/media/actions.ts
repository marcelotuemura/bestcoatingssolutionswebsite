'use server';

import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import type { AssetWorkflowStatus } from '@/lib/media-intelligence/schemas';
import { planPublication } from '@/lib/media-intelligence/publishers/website';
import { isMediaIntelligenceEnabled } from '@/config/media-intelligence';

function guardEnabled() {
  if (!isMediaIntelligenceEnabled()) {
    return { ok: false as const, error: 'Media Intelligence is disabled.' };
  }
  return null;
}

export async function transitionMediaAssetAction(input: {
  readonly assetId: string;
  readonly to: AssetWorkflowStatus;
  readonly actor?: string;
  readonly note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const disabled = guardEnabled();
  if (disabled) return disabled;

  try {
    const repo = getMediaIntelligenceRepository();
    const asset = repo.getAsset(input.assetId);
    if (!asset) return { ok: false, error: 'Asset not found.' };

    if (input.to.startsWith('published_')) {
      const target = input.to.replace('published_', '') as
        | 'website'
        | 'portfolio'
        | 'service_page'
        | 'blog'
        | 'gallery'
        | 'social'
        | 'google_business';
      const mapped =
        target === 'google_business'
          ? 'google_business'
          : target === 'service_page'
            ? 'service_page'
            : (target as
                'website' | 'portfolio' | 'blog' | 'gallery' | 'social');
      const plan = planPublication({
        currentStatus: asset.status,
        target: mapped,
        ownerApproved: true,
        privacyBlocked: asset.privacyRisks.length > 0,
      });
      if (!plan.ok || !plan.nextStatus) {
        return { ok: false, error: plan.reason ?? 'Publish blocked.' };
      }
      // Ensure approved first if still pending
      if (asset.status === 'pending_approval') {
        return {
          ok: false,
          error: 'Approve the asset before publishing to any channel.',
        };
      }
    }

    repo.transitionAsset(
      input.assetId,
      input.to,
      input.actor ?? 'owner',
      input.note,
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Transition failed',
    };
  }
}

export async function importMediaFilesAction(input: {
  readonly files: readonly {
    readonly filename: string;
    readonly mimeType: string;
    readonly bytes: number;
  }[];
}): Promise<{ ok: boolean; imported?: number; error?: string }> {
  const disabled = guardEnabled();
  if (disabled) return disabled;

  try {
    const repo = getMediaIntelligenceRepository();
    let imported = 0;
    for (const file of input.files) {
      await repo.importAndAnalyze({
        filename: file.filename,
        mimeType: file.mimeType,
        bytes: file.bytes,
        width: 2400,
        height: 1800,
      });
      imported += 1;
    }
    repo.rebuildProjectsFromAssets();
    return { ok: true, imported };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Import failed',
    };
  }
}

export async function rebuildProjectsAction(): Promise<{
  ok: boolean;
  count?: number;
  error?: string;
}> {
  const disabled = guardEnabled();
  if (disabled) return disabled;
  const projects = getMediaIntelligenceRepository().rebuildProjectsFromAssets();
  return { ok: true, count: projects.length };
}
