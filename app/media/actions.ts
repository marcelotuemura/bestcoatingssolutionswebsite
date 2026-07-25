'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  evaluateMediaAccessGate,
  mediaIntelligenceConfig,
} from '@/config/media-intelligence';
import { requireMediaPermission } from '@/lib/media-intelligence/auth/guards';
import { checkMediaLoginRateLimit } from '@/lib/media-intelligence/auth/login-rate-limit';
import {
  clearMediaSessionCookie,
  issueOwnerSessionToken,
  setMediaSessionCookie,
  verifyAccessSecret,
} from '@/lib/media-intelligence/auth/session';
import {
  planPublication,
  publishTargetFromStatus,
  type PublishTarget,
} from '@/lib/media-intelligence/publishers/website';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import type { AssetWorkflowStatus } from '@/lib/media-intelligence/schemas';

function mapPublishStatus(to: AssetWorkflowStatus): PublishTarget | null {
  return publishTargetFromStatus(to);
}

function permissionForTransition(
  to: AssetWorkflowStatus,
):
  | 'approve_workflow'
  | 'reject'
  | 'archive'
  | 'hide'
  | 'schedule'
  | 'publish'
  | 'import_metadata' {
  if (to === 'approved' || to === 'pending_approval' || to === 'optimized') {
    return 'approve_workflow';
  }
  if (to === 'rejected') return 'reject';
  if (to === 'archived') return 'archive';
  if (to === 'hidden') return 'hide';
  if (to === 'scheduled') return 'schedule';
  if (to.startsWith('published_')) return 'publish';
  return 'approve_workflow';
}

export async function mediaLoginAction(input: {
  readonly accessSecret: string;
}): Promise<{ ok: boolean; error?: string }> {
  const gate = evaluateMediaAccessGate();
  if (!gate.ok) {
    return { ok: false, error: gate.reason };
  }
  if (gate.mode === 'local-bypass') {
    return { ok: true };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    'unknown';
  const rate = checkMediaLoginRateLimit(`media-login:${ip}`);
  if (!rate.allowed) {
    return {
      ok: false,
      error: 'Too many login attempts. Please wait and try again.',
    };
  }

  try {
    if (!verifyAccessSecret(input.accessSecret)) {
      return { ok: false, error: 'Invalid access credentials.' };
    }
  } catch {
    return { ok: false, error: 'Access secrets are not configured.' };
  }

  const token = issueOwnerSessionToken();
  await setMediaSessionCookie(token);
  return { ok: true };
}

export async function mediaLogoutAction(): Promise<void> {
  await clearMediaSessionCookie();
  redirect(mediaIntelligenceConfig.loginPath);
}

/**
 * Workflow / publication transitions.
 * Actor identity is NEVER accepted from the client.
 */
export async function transitionMediaAssetAction(input: {
  readonly assetId: string;
  readonly to: AssetWorkflowStatus;
  readonly note?: string;
}): Promise<{ ok: boolean; error?: string; status?: number }> {
  const permission = permissionForTransition(input.to);
  const auth = await requireMediaPermission(permission);
  if (!auth.ok) {
    return { ok: false, error: auth.error, status: auth.status };
  }

  try {
    const repo = getMediaIntelligenceRepository();
    const asset = repo.getAsset(input.assetId);
    if (!asset) return { ok: false, error: 'Asset not found.', status: 404 };

    const publishTarget = mapPublishStatus(input.to);
    if (publishTarget) {
      const approval = repo.getApproval(input.assetId, publishTarget);
      const plan = planPublication({
        currentStatus: asset.status,
        target: publishTarget,
        approval,
        privacyBlocked: asset.privacyRisks.length > 0,
      });
      if (!plan.ok || !plan.nextStatus) {
        return {
          ok: false,
          error: plan.reason ?? 'Publish blocked.',
          status: 403,
        };
      }
    }

    repo.transitionAsset(
      input.assetId,
      input.to,
      `${auth.actor.source}:${auth.actor.id}`,
      input.note,
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Transition failed',
      status: 400,
    };
  }
}

/**
 * Creates a target-specific MediaApproval record (not a hard-coded boolean).
 */
export async function createPublicationApprovalAction(input: {
  readonly assetId: string;
  readonly target: PublishTarget;
  readonly note?: string;
}): Promise<{ ok: boolean; error?: string; status?: number }> {
  const auth = await requireMediaPermission('create_publication_approval');
  if (!auth.ok) {
    return { ok: false, error: auth.error, status: auth.status };
  }

  try {
    const repo = getMediaIntelligenceRepository();
    repo.createPublicationApproval({
      assetId: input.assetId,
      target: input.target,
      approvedBy: `${auth.actor.source}:${auth.actor.id}`,
      note: input.note,
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Approval failed',
      status: 400,
    };
  }
}

/**
 * Foundation simulation only — metadata records, no binary upload/storage.
 */
export async function importMediaMetadataAction(input: {
  readonly files: readonly {
    readonly filename: string;
    readonly mimeType: string;
    readonly bytes: number;
  }[];
}): Promise<{
  ok: boolean;
  created?: number;
  mode?: 'metadata-only-simulation';
  error?: string;
  status?: number;
}> {
  const auth = await requireMediaPermission('import_metadata');
  if (!auth.ok) {
    return { ok: false, error: auth.error, status: auth.status };
  }

  try {
    const repo = getMediaIntelligenceRepository();
    let created = 0;
    for (const file of input.files) {
      await repo.importAndAnalyze({
        filename: file.filename,
        mimeType: file.mimeType,
        bytes: file.bytes,
        // Simulated dimensions — no binary was received or stored.
        width: 2400,
        height: 1800,
        notes:
          'FOUNDATION METADATA SIMULATION — no original binary uploaded or stored.',
        isDemoSeed: true,
      });
      created += 1;
    }
    repo.rebuildProjectsFromAssets();
    return { ok: true, created, mode: 'metadata-only-simulation' };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Import failed',
      status: 400,
    };
  }
}

/** @deprecated Use importMediaMetadataAction — kept name alias removed intentionally. */

export async function rebuildProjectsAction(): Promise<{
  ok: boolean;
  count?: number;
  error?: string;
  status?: number;
}> {
  const auth = await requireMediaPermission('rebuild_projects');
  if (!auth.ok) {
    return { ok: false, error: auth.error, status: auth.status };
  }
  const projects = getMediaIntelligenceRepository().rebuildProjectsFromAssets();
  return { ok: true, count: projects.length };
}
