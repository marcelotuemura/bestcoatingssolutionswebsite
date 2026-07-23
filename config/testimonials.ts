/**
 * Testimonial model — empty-safe.
 *
 * Do not fabricate quotes. Without approved testimonials, UI must not show
 * cards, star ratings, Review schema, or AggregateRating schema.
 */

import {
  isPubliclyPublishable,
  type CustomerConsentStatus,
  type OwnerApprovalStatus,
  type PublicationStatus,
} from '@/config/publication';
import type { MarineServiceSlug } from '@/config/marine-services';

export type TestimonialCustomerType =
  'vessel-owner' | 'captain' | 'manager' | 'broker' | 'other';

export type TestimonialSource =
  'written' | 'email' | 'form' | 'in-person' | 'other';

export interface TestimonialLocalizedCopy {
  readonly quote: string;
  readonly customerDisplayName: string;
}

export interface TestimonialRecord {
  readonly id: string;
  readonly status: PublicationStatus;
  readonly customerType?: TestimonialCustomerType;
  readonly vesselType?: string;
  readonly serviceSlug?: MarineServiceSlug;
  readonly city?: string;
  /** Only render when present and verified — never invent. */
  readonly rating?: number;
  readonly date?: string;
  readonly source?: TestimonialSource;
  readonly ownerApprovalStatus: OwnerApprovalStatus;
  readonly publicationConsentStatus: CustomerConsentStatus;
  readonly isTestFixture?: boolean;
  readonly copy: {
    readonly en: TestimonialLocalizedCopy;
    readonly es: TestimonialLocalizedCopy;
  };
}

/** Production catalogue — empty until owner-approved testimonials exist. */
export const testimonialCatalog: readonly TestimonialRecord[] = [] as const;

export function getPublishedTestimonials(): readonly TestimonialRecord[] {
  return testimonialCatalog.filter(
    (item) =>
      isPubliclyPublishable(item) &&
      item.publicationConsentStatus === 'granted',
  );
}

export function getFeaturedTestimonials(): readonly TestimonialRecord[] {
  return getPublishedTestimonials();
}

export function getTestimonialById(id: string): TestimonialRecord | undefined {
  return getPublishedTestimonials().find((item) => item.id === id);
}

export function hasApprovedTestimonials(): boolean {
  return getPublishedTestimonials().length > 0;
}

/** Never emit Review / AggregateRating JSON-LD without qualifying data. */
export function shouldEmitReviewStructuredData(): boolean {
  return hasApprovedTestimonials();
}

export function averageApprovedRating(): number | undefined {
  const rated = getPublishedTestimonials().filter(
    (item) =>
      typeof item.rating === 'number' && item.rating >= 1 && item.rating <= 5,
  );
  if (rated.length === 0) {
    return undefined;
  }
  const sum = rated.reduce((acc, item) => acc + (item.rating ?? 0), 0);
  return sum / rated.length;
}
