import type {
  AssetWorkflowStatus,
  MediaApproval,
  PublishTarget,
} from '@/lib/media-intelligence/schemas';
import { canTransition } from '@/lib/media-intelligence/workflow';

export type { PublishTarget };

const targetStatus: Record<PublishTarget, AssetWorkflowStatus> = {
  website: 'published_website',
  portfolio: 'published_portfolio',
  service_page: 'published_service_page',
  blog: 'published_blog',
  gallery: 'published_gallery',
  social: 'published_social',
  google_business: 'published_google_business',
};

export function publishTargetFromStatus(
  status: AssetWorkflowStatus,
): PublishTarget | null {
  if (!status.startsWith('published_')) return null;
  return status.replace('published_', '') as PublishTarget;
}

/**
 * Publishing is never automatic.
 * Requires a stored MediaApproval record for the exact asset + target.
 * Workflow status `approved` alone is never sufficient.
 */
export function planPublication(input: {
  readonly currentStatus: AssetWorkflowStatus;
  readonly target: PublishTarget;
  readonly approval: MediaApproval | undefined;
  readonly privacyBlocked?: boolean;
}): {
  readonly ok: boolean;
  readonly nextStatus?: AssetWorkflowStatus;
  readonly reason?: string;
} {
  if (input.privacyBlocked) {
    return {
      ok: false,
      reason: 'Privacy risks must be resolved before publishing.',
    };
  }

  const approval = input.approval;
  if (!approval || approval.revokedAt || approval.target !== input.target) {
    return {
      ok: false,
      reason:
        'Target-specific owner approval record required before publication.',
    };
  }

  if (
    input.currentStatus !== 'approved' &&
    input.currentStatus !== 'scheduled'
  ) {
    return {
      ok: false,
      reason:
        'Asset workflow must be approved or scheduled before publish targets.',
    };
  }

  const next = targetStatus[input.target];
  if (!canTransition(input.currentStatus, next)) {
    return {
      ok: false,
      reason: `Cannot publish to ${input.target} from ${input.currentStatus}.`,
    };
  }
  return { ok: true, nextStatus: next };
}
