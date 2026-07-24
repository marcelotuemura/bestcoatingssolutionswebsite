import type { AssetWorkflowStatus } from '@/lib/media-intelligence/schemas';
import { canTransition } from '@/lib/media-intelligence/workflow';

export type PublishTarget =
  | 'website'
  | 'portfolio'
  | 'service_page'
  | 'blog'
  | 'gallery'
  | 'social'
  | 'google_business';

const targetStatus: Record<PublishTarget, AssetWorkflowStatus> = {
  website: 'published_website',
  portfolio: 'published_portfolio',
  service_page: 'published_service_page',
  blog: 'published_blog',
  gallery: 'published_gallery',
  social: 'published_social',
  google_business: 'published_google_business',
};

/**
 * Publishing is never automatic. Callers must pass ownerApproved=true.
 */
export function planPublication(input: {
  readonly currentStatus: AssetWorkflowStatus;
  readonly target: PublishTarget;
  readonly ownerApproved: boolean;
  readonly privacyBlocked?: boolean;
}): {
  readonly ok: boolean;
  readonly nextStatus?: AssetWorkflowStatus;
  readonly reason?: string;
} {
  if (!input.ownerApproved) {
    return { ok: false, reason: 'Owner approval required before publishing.' };
  }
  if (input.privacyBlocked) {
    return {
      ok: false,
      reason: 'Privacy risks must be resolved before publishing.',
    };
  }
  if (
    input.currentStatus !== 'approved' &&
    input.currentStatus !== 'scheduled'
  ) {
    return {
      ok: false,
      reason: 'Asset must be approved (or scheduled) before publish targets.',
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
