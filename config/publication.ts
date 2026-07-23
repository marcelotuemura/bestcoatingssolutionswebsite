/**
 * Shared publication-status vocabulary for portfolio, resources, and testimonials.
 * Only explicitly published + owner-approved records may appear on production pages.
 */

export const publicationStatuses = [
  'draft',
  'owner-review',
  'approved',
  'published',
  'future',
  'coming-soon',
  'archived',
] as const;

export type PublicationStatus = (typeof publicationStatuses)[number];

export const ownerApprovalStatuses = [
  'pending',
  'approved',
  'rejected',
] as const;

export type OwnerApprovalStatus = (typeof ownerApprovalStatuses)[number];

export const customerConsentStatuses = [
  'not-required',
  'pending',
  'granted',
  'denied',
] as const;

export type CustomerConsentStatus = (typeof customerConsentStatuses)[number];

/** True when a record may appear on public production pages and in the sitemap. */
export function isPubliclyPublishable(input: {
  readonly status: PublicationStatus;
  readonly ownerApprovalStatus: OwnerApprovalStatus;
  readonly isTestFixture?: boolean;
}): boolean {
  if (input.isTestFixture) {
    return false;
  }
  return (
    input.status === 'published' && input.ownerApprovalStatus === 'approved'
  );
}

/** Whether test-only fixtures may be resolved (unit/e2e), never the sitemap. */
export function includeTestFixtures(): boolean {
  return process.env.BCS_INCLUDE_TEST_FIXTURES === '1';
}
