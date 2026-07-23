/**
 * Educational resources / blog-ready static content model types.
 * Catalogue and accessors live in content/resources.ts.
 */

import type {
  OwnerApprovalStatus,
  PublicationStatus,
} from '@/config/publication';
import type { MarineServiceSlug } from '@/config/marine-services';

export type ResourceCategory =
  | 'estimates'
  | 'photography'
  | 'damage-assessment'
  | 'gelcoat'
  | 'color-matching'
  | 'inspections'
  | 'scope'
  | 'preparation'
  | 'general';

export interface ResourceSection {
  readonly id: string;
  readonly heading: string;
  readonly body: readonly string[];
}

export interface ResourceLocalizedCopy {
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly ResourceSection[];
  readonly metaTitle: string;
  readonly metaDescription: string;
}

export interface ResourceRecord {
  readonly id: string;
  readonly slug: string;
  readonly status: PublicationStatus;
  readonly category: ResourceCategory;
  readonly tags: readonly string[];
  readonly publishedAt?: string;
  readonly updatedAt?: string;
  /** Organizational author — do not fabricate personal credentials. */
  readonly authorDisplayName: string;
  readonly reviewerDisplayName?: string;
  readonly relatedServiceSlugs: readonly MarineServiceSlug[];
  readonly relatedResourceSlugs: readonly string[];
  readonly ownerApprovalStatus: OwnerApprovalStatus;
  readonly isTestFixture?: boolean;
  readonly copy: {
    readonly en: ResourceLocalizedCopy;
    readonly es: ResourceLocalizedCopy;
  };
}

const RESOURCE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidResourceSlug(slug: string): boolean {
  return RESOURCE_SLUG_PATTERN.test(slug) && slug.length <= 100;
}
