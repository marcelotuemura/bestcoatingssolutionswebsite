import type { AssetWorkflowStatus } from '@/lib/media-intelligence/schemas';

/**
 * Allowed transitions. Publication targets are explicit — never automatic.
 */
const transitions: Readonly<
  Record<AssetWorkflowStatus, readonly AssetWorkflowStatus[]>
> = {
  imported: ['analyzed', 'rejected', 'archived', 'hidden'],
  analyzed: ['optimized', 'pending_approval', 'rejected', 'archived', 'hidden'],
  optimized: ['pending_approval', 'rejected', 'archived', 'hidden'],
  pending_approval: ['approved', 'rejected', 'archived', 'hidden', 'optimized'],
  approved: [
    'scheduled',
    'published_website',
    'published_portfolio',
    'published_service_page',
    'published_blog',
    'published_gallery',
    'published_social',
    'published_google_business',
    'archived',
    'hidden',
    'pending_approval',
  ],
  rejected: ['pending_approval', 'archived', 'hidden', 'imported'],
  archived: ['pending_approval', 'hidden'],
  hidden: ['pending_approval', 'archived'],
  scheduled: [
    'published_website',
    'published_portfolio',
    'published_service_page',
    'published_blog',
    'published_gallery',
    'published_social',
    'published_google_business',
    'approved',
    'archived',
    'hidden',
  ],
  published_website: ['archived', 'hidden', 'approved'],
  published_portfolio: ['archived', 'hidden', 'approved'],
  published_service_page: ['archived', 'hidden', 'approved'],
  published_blog: ['archived', 'hidden', 'approved'],
  published_gallery: ['archived', 'hidden', 'approved'],
  published_social: ['archived', 'hidden', 'approved'],
  published_google_business: ['archived', 'hidden', 'approved'],
};

export function canTransition(
  from: AssetWorkflowStatus,
  to: AssetWorkflowStatus,
): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(
  from: AssetWorkflowStatus,
  to: AssetWorkflowStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid media workflow transition: ${from} → ${to}`);
  }
}

/** Statuses that imply a public surface — still require prior approval trail. */
export function isPublishedStatus(status: AssetWorkflowStatus): boolean {
  return status.startsWith('published_');
}

export function requiresOwnerConfirmationToDestroy(
  action: 'delete_original' | 'purge_derivatives' | 'hard_delete',
): true {
  void action;
  return true;
}
