'use server';

import { requireMediaPermission } from '@/lib/media-intelligence/auth/guards';
import {
  approvePublicationJob,
  cancelPublicationJob,
  createPublicationDraft,
  executePublicationJob,
  schedulePublicationJob,
  submitPublicationForApproval,
  updatePublicationDraft,
} from '@/lib/media-intelligence/publishers';
import {
  assertPhase6Target,
  type Phase6PublishTarget,
} from '@/lib/media-intelligence/publishers';

export async function createPublicationDraftAction(input: {
  readonly assetId: string;
  readonly target: string;
  readonly payload: unknown;
  readonly derivativeId?: string;
  readonly idempotencyKey: string;
  readonly scheduledFor?: string;
}): Promise<{ ok: boolean; error?: string; jobId?: string }> {
  const session = await requireMediaPermission('prepare_publish_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const target = assertPhase6Target(input.target);
  if (!target) return { ok: false, error: 'Unsupported publication target.' };
  const result = await createPublicationDraft({
    actor: session.actor,
    assetId: input.assetId,
    target,
    payload: input.payload,
    derivativeId: input.derivativeId,
    idempotencyKey: input.idempotencyKey,
    scheduledFor: input.scheduledFor,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, jobId: result.data.id };
}

export async function updatePublicationDraftAction(input: {
  readonly jobId: string;
  readonly payload?: unknown;
  readonly derivativeId?: string;
  readonly scheduledFor?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('prepare_publish_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await updatePublicationDraft({
    actor: session.actor,
    ...input,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function submitPublicationAction(input: {
  readonly jobId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('prepare_publish_draft');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await submitPublicationForApproval({
    actor: session.actor,
    jobId: input.jobId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function approvePublicationAction(input: {
  readonly jobId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('create_publication_approval');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await approvePublicationJob({
    actor: session.actor,
    jobId: input.jobId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function schedulePublicationAction(input: {
  readonly jobId: string;
  readonly scheduledFor: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('schedule');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await schedulePublicationJob({
    actor: session.actor,
    jobId: input.jobId,
    scheduledFor: input.scheduledFor,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function cancelPublicationAction(input: {
  readonly jobId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireMediaPermission('prepare_publish_draft');
  if (!session.ok) {
    const scheduleSession = await requireMediaPermission('schedule');
    if (!scheduleSession.ok) return { ok: false, error: session.error };
    const result = await cancelPublicationJob({
      actor: scheduleSession.actor,
      jobId: input.jobId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }
  const result = await cancelPublicationJob({
    actor: session.actor,
    jobId: input.jobId,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function executePublicationAction(input: {
  readonly jobId: string;
}): Promise<{ ok: boolean; error?: string; message?: string }> {
  const session = await requireMediaPermission('publish');
  if (!session.ok) return { ok: false, error: session.error };
  const result = await executePublicationJob({
    actor: session.actor,
    jobId: input.jobId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  const delivery = result.data.providerDeliveryStatus;
  return {
    ok: true,
    message:
      delivery === 'delivered'
        ? 'Externally published.'
        : 'Draft ready — provider not configured; nothing was posted externally.',
  };
}

export type { Phase6PublishTarget };
