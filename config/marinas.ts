/**
 * Future marina directory model — unpublished until approved real data exists.
 * Do not imply partnership, authorization, preferred-vendor status, or endorsement.
 */

import type { OwnerApprovalStatus } from '@/config/publication';

export type MarinaDirectoryStatus =
  'draft' | 'owner-review' | 'approved' | 'published' | 'archived';

export type MarinaRelationshipType =
  'none' | 'service-location' | 'reference-only' | 'other';

export interface MarinaDirectoryEntry {
  readonly id: string;
  readonly name: string;
  readonly city?: string;
  readonly status: MarinaDirectoryStatus;
  readonly publicDirectoryListing: boolean;
  readonly relationshipType: MarinaRelationshipType;
  readonly serviceAvailability?: string;
  readonly ownerApprovalStatus: OwnerApprovalStatus;
  readonly logoApprovalStatus: OwnerApprovalStatus;
  readonly logoSrc?: string;
}

/** Empty until owner-approved marina references exist. */
export const marinaDirectory: readonly MarinaDirectoryEntry[] = [] as const;

export function getPublishedMarinaDirectory(): readonly MarinaDirectoryEntry[] {
  return marinaDirectory.filter(
    (entry) =>
      entry.status === 'published' &&
      entry.ownerApprovalStatus === 'approved' &&
      entry.publicDirectoryListing,
  );
}

export function shouldShowMarinaDirectory(): boolean {
  return getPublishedMarinaDirectory().length > 0;
}
