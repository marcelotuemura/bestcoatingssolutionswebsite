/**
 * Publication service façade.
 * Default runtime persists via PostgreSQL SECURITY DEFINER RPCs.
 * Memory path is opt-in for isolated unit tests only.
 */

import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import { recordAuditEvent } from '@/lib/media-intelligence/audit/audit';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import { getPublisherAdapter } from '@/lib/media-intelligence/publishers/registry';
import {
  actorCanPublicationAction,
  editorMayEditStatus,
} from '@/lib/media-intelligence/publishers/permissions';
import { resolvePublicationRepositoryMode } from '@/lib/media-intelligence/publishers/runtime';
import {
  dbApprovePublication,
  dbCancelPublication,
  dbCreatePublicationDraft,
  dbExecutePublication,
  dbGetPublicationJob,
  dbListPublicationEvents,
  dbListPublicationJobs,
  dbRecordPublicationResult,
  dbSchedulePublication,
  dbSubmitPublication,
  dbUpdatePublicationDraft,
} from '@/lib/media-intelligence/publishers/db-repository';
import {
  appendPublicationEvent,
  findJobByIdempotencyKey,
  getPublicationJob,
  listPublicationEvents,
  listPublicationJobs,
  newPublicationIds,
  savePublicationJob,
} from '@/lib/media-intelligence/publishers/store';
import type {
  Phase6PublishTarget,
  PublicationEvent,
  PublicationJob,
  PublicationJobStatus,
  PublicationPayload,
} from '@/lib/media-intelligence/publishers/types';
import {
  assertApprovalMatches,
  assertDerivativeEligible,
  canTransitionPublication,
  isPrivacyBlocked,
  parsePublicationPayload,
  sanitizeProviderMetadata,
} from '@/lib/media-intelligence/publishers/validation';

type Result<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string; readonly status: number };

function deny(error: string, status = 403): Result<never> {
  return { ok: false, error, status };
}

function pgError(error: unknown): Result<never> {
  const message = error instanceof Error ? error.message : String(error);
  const status = /permission denied|42501/i.test(message)
    ? 403
    : /not found|P0002/i.test(message)
      ? 404
      : 400;
  return deny(
    message.replace(/^ERROR:\s*/i, '').split('\n')[0] ?? message,
    status,
  );
}

async function auditPublication(
  action: string,
  actor: MediaTrustedActor,
  job: PublicationJob,
  success: boolean,
  metadata?: Record<string, unknown>,
) {
  await recordAuditEvent({
    action: 'approval_decision',
    actorId: actor.id,
    actorRole: actor.role,
    resourceType: 'publication_job',
    resourceId: job.id,
    success,
    metadata: sanitizeProviderMetadata({
      publicationAction: action,
      target: job.target,
      status: job.status,
      providerDeliveryStatus: job.providerDeliveryStatus,
      ...metadata,
    }),
  });
}

function isMemoryPublicationBackend(): boolean {
  return resolvePublicationRepositoryMode() === 'memory';
}

export async function listJobsForActor(
  actor: MediaTrustedActor,
): Promise<readonly PublicationJob[]> {
  if (isMemoryPublicationBackend()) return listPublicationJobs();
  return dbListPublicationJobs(actor);
}

export async function getJobWithEvents(
  actor: MediaTrustedActor,
  jobId: string,
): Promise<{
  readonly job: PublicationJob;
  readonly events: readonly PublicationEvent[];
} | null> {
  if (isMemoryPublicationBackend()) {
    const job = getPublicationJob(jobId);
    if (!job) return null;
    return { job, events: listPublicationEvents(jobId) };
  }
  const job = await dbGetPublicationJob(actor, jobId);
  if (!job) return null;
  const events = await dbListPublicationEvents(actor, jobId);
  return { job, events };
}

export async function createPublicationDraft(input: {
  readonly actor: MediaTrustedActor;
  readonly assetId: string;
  readonly target: Phase6PublishTarget;
  readonly payload: unknown;
  readonly derivativeId?: string;
  readonly idempotencyKey: string;
  readonly scheduledFor?: string;
}): Promise<Result<PublicationJob>> {
  if (!actorCanPublicationAction(input.actor, 'create_draft')) {
    return deny('Permission denied: prepare_publish_draft');
  }

  const repo = getMediaIntelligenceRepository();
  const asset = repo.getAsset(input.assetId);
  if (!asset) return deny('Asset not found', 404);
  if (isPrivacyBlocked(asset)) {
    return deny('Privacy-blocked assets cannot be drafted for publication.');
  }
  const der = assertDerivativeEligible(asset, input.derivativeId);
  if (!der.ok) return deny(der.error, 400);

  const parsed = parsePublicationPayload(input.target, input.payload);
  if (!parsed.ok) return deny(parsed.error, 400);

  const adapter = getPublisherAdapter(input.target);
  const normalized = adapter.normalize({ asset, payload: parsed.payload });
  if (!normalized.ok) return deny(normalized.error, 400);

  if (!isMemoryPublicationBackend()) {
    try {
      const job = await dbCreatePublicationDraft({
        actor: input.actor,
        asset,
        target: input.target,
        payload: normalized.payload,
        idempotencyKey: input.idempotencyKey,
        derivativeId: input.derivativeId,
        scheduledFor: input.scheduledFor,
        destinationRef: normalized.destinationRef,
      });
      await auditPublication('draft_created', input.actor, job, true);
      return { ok: true, data: job };
    } catch (error) {
      return pgError(error);
    }
  }

  const existing = findJobByIdempotencyKey(input.idempotencyKey);
  if (existing) return { ok: true, data: existing };

  const ids = newPublicationIds();
  const now = new Date().toISOString();
  const job: PublicationJob = {
    id: ids.id,
    externalId: ids.externalId,
    assetId: asset.id,
    derivativeId: input.derivativeId,
    target: input.target,
    status: 'draft',
    providerDeliveryStatus: normalized.providerDeliveryStatus,
    payload: normalized.payload,
    scheduledFor: input.scheduledFor,
    idempotencyKey: input.idempotencyKey,
    destinationRef: normalized.destinationRef,
    providerMetadata: sanitizeProviderMetadata(normalized.providerMetadata),
    createdBy: input.actor.id,
    createdAt: now,
    updatedAt: now,
  };
  savePublicationJob(job);
  appendPublicationEvent({
    jobId: job.id,
    actorId: input.actor.id,
    action: 'draft_created',
    nextStatus: 'draft',
    target: job.target,
  });
  await auditPublication('draft_created', input.actor, job, true);
  return { ok: true, data: job };
}

export async function updatePublicationDraft(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
  readonly payload?: unknown;
  readonly derivativeId?: string;
  readonly scheduledFor?: string | null;
}): Promise<Result<PublicationJob>> {
  if (!actorCanPublicationAction(input.actor, 'update_draft')) {
    return deny('Permission denied: prepare_publish_draft');
  }

  if (!isMemoryPublicationBackend()) {
    try {
      let payload: PublicationPayload | undefined;
      if (input.payload !== undefined) {
        const current = await dbGetPublicationJob(input.actor, input.jobId);
        if (!current) return deny('Publication job not found', 404);
        const parsed = parsePublicationPayload(current.target, input.payload);
        if (!parsed.ok) return deny(parsed.error, 400);
        payload = parsed.payload;
      }
      const job = await dbUpdatePublicationDraft({
        actor: input.actor,
        jobId: input.jobId,
        payload,
        derivativeId: input.derivativeId,
        scheduledFor: input.scheduledFor,
      });
      await auditPublication('draft_updated', input.actor, job, true);
      return { ok: true, data: job };
    } catch (error) {
      return pgError(error);
    }
  }

  const job = getPublicationJob(input.jobId);
  if (!job) return deny('Publication job not found', 404);
  if (!editorMayEditStatus(job.status)) {
    return deny('Draft can only be updated in draft or awaiting_approval.');
  }
  const repo = getMediaIntelligenceRepository();
  const asset = repo.getAsset(job.assetId);
  if (!asset) return deny('Asset not found', 404);
  if (isPrivacyBlocked(asset)) {
    return deny('Privacy-blocked assets cannot be updated for publication.');
  }
  let payload: PublicationPayload = job.payload;
  if (input.payload !== undefined) {
    const parsed = parsePublicationPayload(job.target, input.payload);
    if (!parsed.ok) return deny(parsed.error, 400);
    const adapter = getPublisherAdapter(job.target);
    const normalized = adapter.normalize({ asset, payload: parsed.payload });
    if (!normalized.ok) return deny(normalized.error, 400);
    payload = normalized.payload;
  }
  const derivativeId =
    input.derivativeId !== undefined ? input.derivativeId : job.derivativeId;
  const der = assertDerivativeEligible(asset, derivativeId);
  if (!der.ok) return deny(der.error, 400);
  const previous = job.status;
  const updated: PublicationJob = {
    ...job,
    payload,
    derivativeId,
    scheduledFor:
      input.scheduledFor === null
        ? undefined
        : (input.scheduledFor ?? job.scheduledFor),
    updatedAt: new Date().toISOString(),
  };
  savePublicationJob(updated);
  appendPublicationEvent({
    jobId: job.id,
    actorId: input.actor.id,
    action: 'draft_updated',
    previousStatus: previous,
    nextStatus: updated.status,
    target: job.target,
  });
  await auditPublication('draft_updated', input.actor, updated, true);
  return { ok: true, data: updated };
}

export async function submitPublicationForApproval(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
}): Promise<Result<PublicationJob>> {
  if (!actorCanPublicationAction(input.actor, 'submit_for_approval')) {
    return deny('Permission denied: prepare_publish_draft');
  }
  if (!isMemoryPublicationBackend()) {
    try {
      const job = await dbSubmitPublication(input.actor, input.jobId);
      await auditPublication('submitted', input.actor, job, true);
      return { ok: true, data: job };
    } catch (error) {
      return pgError(error);
    }
  }
  return transitionJobMemory(
    input.actor,
    input.jobId,
    'awaiting_approval',
    'submitted',
  );
}

export async function approvePublicationJob(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
  readonly approvalId?: string;
}): Promise<Result<PublicationJob>> {
  if (!actorCanPublicationAction(input.actor, 'approve')) {
    return deny('Permission denied: create_publication_approval');
  }

  if (!isMemoryPublicationBackend()) {
    try {
      const job = await dbApprovePublication(input.actor, input.jobId);
      await auditPublication('approved', input.actor, job, true);
      return { ok: true, data: job };
    } catch (error) {
      return pgError(error);
    }
  }

  const job = getPublicationJob(input.jobId);
  if (!job) return deny('Publication job not found', 404);
  const repo = getMediaIntelligenceRepository();
  let asset = repo.getAsset(job.assetId);
  if (!asset) return deny('Asset not found', 404);
  if (isPrivacyBlocked(asset)) {
    return deny('Privacy-blocked assets cannot be approved for publication.');
  }
  if (asset.status !== 'approved' && asset.status !== 'scheduled') {
    if (!actorHasPermission(input.actor, 'approve_workflow')) {
      return deny(
        'Asset workflow must be approved before publication approval.',
        400,
      );
    }
    try {
      if (asset.status === 'pending_approval') {
        asset = repo.transitionAsset(
          asset.id,
          'approved',
          input.actor.id,
          'Phase 6 publication approval',
        );
      } else {
        return deny(
          `Asset workflow status ${asset.status} cannot receive publication approval.`,
          400,
        );
      }
    } catch (error) {
      return deny(
        error instanceof Error ? error.message : 'Workflow approval failed',
        400,
      );
    }
  }

  let approval = input.approvalId
    ? repo
        .listApprovalsForAsset(job.assetId)
        .find((a) => a.id === input.approvalId)
    : repo
        .listApprovalsForAsset(job.assetId)
        .find((a) => a.target === job.target && !a.revokedAt);

  if (!approval) {
    try {
      approval = repo.createPublicationApproval({
        assetId: job.assetId,
        target: job.target,
        approvedBy: input.actor.id,
        note: `Phase 6 publication job ${job.externalId}`,
      });
    } catch (error) {
      return deny(
        error instanceof Error ? error.message : 'Failed to create approval',
        400,
      );
    }
  }

  const match = assertApprovalMatches({
    approval,
    assetId: job.assetId,
    target: job.target,
  });
  if (!match.ok) return deny(match.error);
  if (!canTransitionPublication(job.status, 'approved')) {
    return deny(`Cannot approve from status ${job.status}`, 400);
  }
  const updated: PublicationJob = {
    ...job,
    status: 'approved',
    approvalId: match.approval.id,
    approvalVersion: match.approval.approvalVersion,
    reviewedBy: input.actor.id,
    updatedAt: new Date().toISOString(),
  };
  savePublicationJob(updated);
  appendPublicationEvent({
    jobId: job.id,
    actorId: input.actor.id,
    action: 'approved',
    previousStatus: job.status,
    nextStatus: 'approved',
    target: job.target,
    metadata: { approvalId: match.approval.id },
  });
  await auditPublication('approved', input.actor, updated, true);
  return { ok: true, data: updated };
}

export async function schedulePublicationJob(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
  readonly scheduledFor: string;
}): Promise<Result<PublicationJob>> {
  if (!actorCanPublicationAction(input.actor, 'schedule')) {
    return deny('Permission denied: schedule');
  }
  const when = Date.parse(input.scheduledFor);
  if (Number.isNaN(when) || when < Date.now() - 60_000) {
    return deny('scheduledFor must be a valid future timestamp', 400);
  }

  if (!isMemoryPublicationBackend()) {
    try {
      const job = await dbSchedulePublication(
        input.actor,
        input.jobId,
        new Date(when).toISOString(),
      );
      await auditPublication('scheduled', input.actor, job, true);
      return { ok: true, data: job };
    } catch (error) {
      return pgError(error);
    }
  }

  const job = getPublicationJob(input.jobId);
  if (!job) return deny('Publication job not found', 404);
  const repo = getMediaIntelligenceRepository();
  const asset = repo.getAsset(job.assetId);
  if (!asset) return deny('Asset not found', 404);
  if (isPrivacyBlocked(asset)) {
    return deny('Privacy-blocked assets cannot be scheduled.');
  }
  const approvals = repo.listApprovalsForAsset(job.assetId);
  const match = assertApprovalMatches({
    approval: approvals.find((a) => a.id === job.approvalId),
    assetId: job.assetId,
    target: job.target,
    expectedVersion: job.approvalVersion,
  });
  if (!match.ok) return deny(match.error);
  if (!canTransitionPublication(job.status, 'scheduled')) {
    return deny(`Cannot schedule from status ${job.status}`, 400);
  }
  const updated: PublicationJob = {
    ...job,
    status: 'scheduled',
    scheduledFor: new Date(when).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  savePublicationJob(updated);
  appendPublicationEvent({
    jobId: job.id,
    actorId: input.actor.id,
    action: 'scheduled',
    previousStatus: job.status,
    nextStatus: 'scheduled',
    target: job.target,
    metadata: { scheduledFor: updated.scheduledFor },
  });
  await auditPublication('scheduled', input.actor, updated, true);
  return { ok: true, data: updated };
}

export async function cancelPublicationJob(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
}): Promise<Result<PublicationJob>> {
  if (!isMemoryPublicationBackend()) {
    try {
      const job = await dbCancelPublication(input.actor, input.jobId);
      await auditPublication('cancelled', input.actor, job, true);
      return { ok: true, data: job };
    } catch (error) {
      return pgError(error);
    }
  }

  if (!actorCanPublicationAction(input.actor, 'cancel')) {
    if (
      actorCanPublicationAction(input.actor, 'create_draft') &&
      getPublicationJob(input.jobId) &&
      editorMayEditStatus(getPublicationJob(input.jobId)!.status)
    ) {
      // ok
    } else {
      return deny('Permission denied: cancel publication');
    }
  }
  return transitionJobMemory(
    input.actor,
    input.jobId,
    'cancelled',
    'cancelled',
  );
}

export async function executePublicationJob(input: {
  readonly actor: MediaTrustedActor;
  readonly jobId: string;
}): Promise<Result<PublicationJob>> {
  if (!actorCanPublicationAction(input.actor, 'execute_publish')) {
    return deny('Permission denied: publish (owner only)');
  }

  if (!isMemoryPublicationBackend()) {
    try {
      const publishing = await dbExecutePublication(input.actor, input.jobId);
      const repo = getMediaIntelligenceRepository();
      const asset = repo.getAsset(publishing.assetId);
      if (!asset) return deny('Asset not found', 404);

      const adapter = getPublisherAdapter(publishing.target);
      const result = await adapter.execute({
        asset,
        payload: publishing.payload,
        jobId: publishing.id,
      });

      if (!result.ok) {
        const failed = await dbRecordPublicationResult({
          actor: input.actor,
          jobId: publishing.id,
          externallyDelivered: false,
          providerDeliveryStatus: 'failed',
          failureDetail: result.error,
        });
        await auditPublication('publish_failed', input.actor, failed, false);
        return deny(result.error, 400);
      }

      const recorded = await dbRecordPublicationResult({
        actor: input.actor,
        jobId: publishing.id,
        externallyDelivered: result.externallyDelivered,
        providerDeliveryStatus: result.providerDeliveryStatus,
        providerMetadata: sanitizeProviderMetadata(result.providerMetadata),
      });
      await auditPublication(
        result.externallyDelivered
          ? 'publish_succeeded'
          : 'publish_blocked_provider_not_configured',
        input.actor,
        recorded,
        true,
        { message: result.message },
      );
      return { ok: true, data: recorded };
    } catch (error) {
      return pgError(error);
    }
  }

  const job = getPublicationJob(input.jobId);
  if (!job) return deny('Publication job not found', 404);
  const repo = getMediaIntelligenceRepository();
  const asset = repo.getAsset(job.assetId);
  if (!asset) return deny('Asset not found', 404);
  if (isPrivacyBlocked(asset)) {
    return deny('Privacy-blocked assets cannot be published.');
  }
  const approvals = repo.listApprovalsForAsset(job.assetId);
  const match = assertApprovalMatches({
    approval: approvals.find((a) => a.id === job.approvalId),
    assetId: job.assetId,
    target: job.target,
    expectedVersion: job.approvalVersion,
  });
  if (!match.ok) return deny(match.error);
  if (
    !canTransitionPublication(job.status, 'publishing') &&
    job.status !== 'failed'
  ) {
    return deny(`Cannot execute publish from status ${job.status}`, 400);
  }

  const publishing: PublicationJob = {
    ...job,
    status: 'publishing',
    updatedAt: new Date().toISOString(),
  };
  savePublicationJob(publishing);
  appendPublicationEvent({
    jobId: job.id,
    actorId: input.actor.id,
    action: 'publish_attempted',
    previousStatus: job.status,
    nextStatus: 'publishing',
    target: job.target,
  });

  const adapter = getPublisherAdapter(job.target);
  const result = await adapter.execute({
    asset,
    payload: job.payload,
    jobId: job.id,
  });

  if (!result.ok) {
    const failed: PublicationJob = {
      ...publishing,
      status: 'failed',
      providerDeliveryStatus: 'failed',
      failureDetail: result.error,
      updatedAt: new Date().toISOString(),
    };
    savePublicationJob(failed);
    appendPublicationEvent({
      jobId: job.id,
      actorId: input.actor.id,
      action: 'publish_failed',
      previousStatus: 'publishing',
      nextStatus: 'failed',
      target: job.target,
      metadata: { error: result.error },
    });
    await auditPublication('publish_failed', input.actor, failed, false);
    return deny(result.error, 400);
  }

  if (!result.externallyDelivered) {
    const draftReady: PublicationJob = {
      ...publishing,
      status: 'approved',
      providerDeliveryStatus: result.providerDeliveryStatus,
      providerMetadata: sanitizeProviderMetadata(result.providerMetadata),
      failureDetail: undefined,
      publishedBy: undefined,
      updatedAt: new Date().toISOString(),
    };
    savePublicationJob(draftReady);
    appendPublicationEvent({
      jobId: job.id,
      actorId: input.actor.id,
      action: 'publish_blocked_provider_not_configured',
      previousStatus: 'publishing',
      nextStatus: 'approved',
      target: job.target,
      metadata: { message: result.message },
    });
    await auditPublication(
      'publish_blocked_provider_not_configured',
      input.actor,
      draftReady,
      true,
      { message: result.message },
    );
    return { ok: true, data: draftReady };
  }

  const published: PublicationJob = {
    ...publishing,
    status: 'published',
    providerDeliveryStatus: 'delivered',
    providerMetadata: sanitizeProviderMetadata(result.providerMetadata),
    publishedBy: input.actor.id,
    updatedAt: new Date().toISOString(),
  };
  savePublicationJob(published);
  appendPublicationEvent({
    jobId: job.id,
    actorId: input.actor.id,
    action: 'publish_succeeded',
    previousStatus: 'publishing',
    nextStatus: 'published',
    target: job.target,
  });
  await auditPublication('publish_succeeded', input.actor, published, true);
  return { ok: true, data: published };
}

async function transitionJobMemory(
  actor: MediaTrustedActor,
  jobId: string,
  to: PublicationJobStatus,
  action: string,
): Promise<Result<PublicationJob>> {
  const job = getPublicationJob(jobId);
  if (!job) return deny('Publication job not found', 404);
  if (!canTransitionPublication(job.status, to)) {
    return deny(`Invalid transition ${job.status} → ${to}`, 400);
  }
  const repo = getMediaIntelligenceRepository();
  const asset = repo.getAsset(job.assetId);
  if (!asset) return deny('Asset not found', 404);
  if (isPrivacyBlocked(asset) && to !== 'cancelled') {
    return deny('Privacy-blocked assets cannot progress publication.');
  }
  const updated: PublicationJob = {
    ...job,
    status: to,
    updatedAt: new Date().toISOString(),
  };
  savePublicationJob(updated);
  appendPublicationEvent({
    jobId: job.id,
    actorId: actor.id,
    action,
    previousStatus: job.status,
    nextStatus: to,
    target: job.target,
  });
  await auditPublication(action, actor, updated, true);
  return { ok: true, data: updated };
}
