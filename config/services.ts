/**
 * Catalogue of services offered, grouped by division (Marine / Aviation).
 *
 * Content-as-data: pages, structured data and estimate forms read from here.
 * Aligns with launch brief; extend summaries without touching components.
 */
import type { DivisionId } from '@/config/divisions';

export type ServiceDivision = DivisionId;

export interface ServiceItem {
  readonly slug: string;
  readonly name: string;
  readonly division: ServiceDivision;
  /** Optional short English summary for structured content later. */
  readonly summaryKey?: string;
}

export const services: readonly ServiceItem[] = [
  {
    slug: 'fiberglass-repair',
    name: 'Fiberglass Repair',
    division: 'marine',
  },
  {
    slug: 'composite-repair-marine',
    name: 'Composite Repair',
    division: 'marine',
  },
  {
    slug: 'gelcoat-repair-refinishing',
    name: 'Gelcoat Repair and Refinishing',
    division: 'marine',
  },
  {
    slug: 'marine-paint',
    name: 'Marine Paint',
    division: 'marine',
  },
  {
    slug: 'metallic-refinishing-marine',
    name: 'Metallic Refinishing',
    division: 'marine',
  },
  {
    slug: 'ceramic-coating-marine',
    name: 'Ceramic Coating',
    division: 'marine',
  },
  {
    slug: 'cosmetic-structural-repairs',
    name: 'Cosmetic and Small Structural Repairs',
    division: 'marine',
  },
  {
    slug: 'mobile-yacht-boat-service',
    name: 'Mobile Yacht and Boat Service',
    division: 'marine',
  },
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
