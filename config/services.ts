/**
 * Catalogue of services — Marine public pages + Aviation (future catalog only).
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

export const services: readonly ServiceItem[] = [
  ...marineServices.map((service) => ({
    slug: service.slug,
    name: marineNames[service.slug] ?? service.slug,
    division: 'marine' as const,
  })),
  {
    slug: 'aircraft-refinishing',
    name: 'Aircraft Refinishing',
    division: 'aviation',
  },
  {
    slug: 'composite-repair-aviation',
    name: 'Composite Repair',
    division: 'aviation',
  },
  {
    slug: 'spot-paint-repair',
    name: 'Spot Paint Repair',
    division: 'aviation',
  },
  {
    slug: 'metallic-refinishing-aviation',
    name: 'Metallic Refinishing',
    division: 'aviation',
  },
  {
    slug: 'ceramic-protection-aviation',
    name: 'Ceramic Protection',
    division: 'aviation',
  },
  {
    slug: 'interior-component-refinishing',
    name: 'Interior Component Refinishing',
    division: 'aviation',
  },
  {
    slug: 'mobile-partner-facility-aviation',
    name: 'Mobile or Partner-Facility Service',
    division: 'aviation',
  },
];

export const servicesByDivision = (
  division: ServiceDivision,
): readonly ServiceItem[] =>
  services.filter((service) => service.division === division);
