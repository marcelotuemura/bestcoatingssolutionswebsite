/**
 * Catalogue of services — Marine public pages + Aviation (cosmetic/refinishing only).
 */
import type { DivisionId } from '@/config/divisions';
import { marineServices } from '@/config/marine-services';

export type ServiceDivision = DivisionId;

export interface ServiceItem {
  readonly slug: string;
  readonly name: string;
  readonly division: ServiceDivision;
}

/** Display names (EN) for structured data / fallbacks; UI uses localized content. */
const marineNames: Record<string, string> = {
  'gelcoat-repair': 'Gelcoat Repair',
  'fiberglass-repair': 'Fiberglass Repair',
  'paint-refinishing': 'Paint & Refinishing',
  'hull-restoration': 'Hull Restoration',
  'yacht-cosmetic-repair': 'Yacht Cosmetic Repair',
  'structural-composite-repair': 'Structural Composite Repair',
  'color-matching': 'Color Matching',
  'insurance-repair': 'Insurance Repair',
};

/**
 * Owner-approved aviation categories (cosmetic / refinishing only).
 * Do not add structural, FAA, mechanical, avionics, or flight-critical items.
 */
export const aviationServiceCatalog: readonly ServiceItem[] = [
  {
    slug: 'aircraft-cosmetic-refinishing',
    name: 'Aircraft Cosmetic Refinishing',
    division: 'aviation',
  },
  {
    slug: 'exterior-paint-restoration',
    name: 'Exterior Paint Restoration',
    division: 'aviation',
  },
  {
    slug: 'composite-surface-refinishing',
    name: 'Composite Surface Refinishing',
    division: 'aviation',
  },
  {
    slug: 'paint-correction-aviation',
    name: 'Paint Correction',
    division: 'aviation',
  },
  {
    slug: 'color-matching-aviation',
    name: 'Color Matching',
    division: 'aviation',
  },
  {
    slug: 'surface-preparation-aviation',
    name: 'Surface Preparation',
    division: 'aviation',
  },
  {
    slug: 'finish-restoration-aviation',
    name: 'Finish Restoration',
    division: 'aviation',
  },
  {
    slug: 'cosmetic-exterior-repairs',
    name: 'Cosmetic Exterior Repairs',
    division: 'aviation',
  },
] as const;

export const services: readonly ServiceItem[] = [
  ...marineServices.map((service) => ({
    slug: service.slug,
    name: marineNames[service.slug] ?? service.slug,
    division: 'marine' as const,
  })),
  ...aviationServiceCatalog,
];

export const servicesByDivision = (
  division: ServiceDivision,
): readonly ServiceItem[] =>
  services.filter((service) => service.division === division);
