import type {
  MediaApproval,
  MediaAsset,
} from '@/lib/media-intelligence/schemas';
import type {
  Phase6PublishTarget,
  PublicationJob,
  PublicationJobStatus,
  PublicationPayload,
} from '@/lib/media-intelligence/publishers/types';
import {
  phase6PublishTargetSchema,
  publicationPayloadSchema,
} from '@/lib/media-intelligence/publishers/types';

const ALLOWED_TRANSITIONS: Record<
  PublicationJobStatus,
  readonly PublicationJobStatus[]
> = {
  // Owners may approve directly from draft (skips queue) or via awaiting_approval.
  draft: ['awaiting_approval', 'approved', 'cancelled'],
  awaiting_approval: ['approved', 'draft', 'cancelled'],
  approved: ['scheduled', 'publishing', 'cancelled'],
  scheduled: ['publishing', 'approved', 'cancelled'],
  publishing: ['published', 'failed'],
  published: [],
  failed: ['publishing', 'cancelled'],
  cancelled: [],
};

export function canTransitionPublication(
  from: PublicationJobStatus,
  to: PublicationJobStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertPhase6Target(target: string): Phase6PublishTarget | null {
  const parsed = phase6PublishTargetSchema.safeParse(target);
  return parsed.success ? parsed.data : null;
}

export function parsePublicationPayload(
  target: Phase6PublishTarget,
  raw: unknown,
):
  | { readonly ok: true; readonly payload: PublicationPayload }
  | { readonly ok: false; readonly error: string } {
  const parsed = publicationPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid payload',
    };
  }
  if (
    parsed.data.kind !== target &&
    !(target === 'google_business' && parsed.data.kind === 'google_business')
  ) {
    // kind must match target (google_business target uses kind google_business)
    if (
      (target === 'website' && parsed.data.kind !== 'website') ||
      (target === 'social' && parsed.data.kind !== 'social') ||
      (target === 'google_business' && parsed.data.kind !== 'google_business')
    ) {
      return {
        ok: false,
        error: 'Payload kind does not match publication target.',
      };
    }
  }
  return { ok: true, payload: parsed.data };
}

export function isPrivacyBlocked(asset: MediaAsset): boolean {
  return asset.privacyRisks.length > 0;
}

export function assertApprovalMatches(input: {
  readonly approval: MediaApproval | undefined;
  readonly assetId: string;
  readonly target: Phase6PublishTarget;
  readonly expectedVersion?: number;
}):
  | { readonly ok: true; readonly approval: MediaApproval }
  | { readonly ok: false; readonly error: string } {
  const approval = input.approval;
  if (!approval || approval.revokedAt) {
    return {
      ok: false,
      error: 'Target-specific MediaApproval required before this action.',
    };
  }
  if (approval.assetId !== input.assetId || approval.target !== input.target) {
    return {
      ok: false,
      error: 'Approval does not match asset and publication target.',
    };
  }
  if (
    input.expectedVersion != null &&
    approval.approvalVersion !== input.expectedVersion
  ) {
    return {
      ok: false,
      error: 'Approval version does not match the job approval version.',
    };
  }
  return { ok: true, approval };
}

/** Only non-original derivatives may be referenced for public-facing drafts. */
export function assertDerivativeEligible(
  asset: MediaAsset,
  derivativeId: string | undefined,
): { readonly ok: true } | { readonly ok: false; readonly error: string } {
  if (!derivativeId) {
    // Website/social may omit explicit derivative when adapter selects preview.
    return { ok: true };
  }
  const derivative = asset.derivatives.find((d) => d.id === derivativeId);
  if (!derivative) {
    return { ok: false, error: 'Approved derivative not found on asset.' };
  }
  if (
    derivative.storageKey.startsWith('originals/') ||
    derivative.storageKey === asset.originalStorageKey
  ) {
    return {
      ok: false,
      error: 'Original files cannot be used as publication derivatives.',
    };
  }
  return { ok: true };
}

export function assertNoPersistedSignedUrl(value: string): boolean {
  return !/[?&]token=/.test(value) && !/X-Amz-Signature/i.test(value);
}

export function sanitizeProviderMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (/secret|token|signed|password|key/i.test(key)) {
      out[key] = '[redacted]';
      continue;
    }
    if (typeof value === 'string' && !assertNoPersistedSignedUrl(value)) {
      out[key] = '[redacted-url]';
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function jobDisplayLabel(job: PublicationJob): string {
  if (
    job.status === 'published' &&
    job.providerDeliveryStatus === 'delivered'
  ) {
    return 'Externally published';
  }
  if (job.providerDeliveryStatus === 'draft_ready') {
    return 'Draft ready (provider not configured)';
  }
  if (job.providerDeliveryStatus === 'not_configured') {
    return 'Provider not configured';
  }
  return job.status.replace(/_/g, ' ');
}
