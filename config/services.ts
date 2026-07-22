/**
 * Catalogue of services offered, grouped by division (Marine / Aviation).
 *
 * Content-as-data: pages, structured data and the future estimate form all read
 * from this list so the offering stays consistent everywhere and is trivial to
 * extend. Copywriting can be refined without touching component code.
 */
export type ServiceDivision = 'marine' | 'aviation';

export interface ServiceItem {
  readonly slug: string;
  readonly name: string;
  readonly division: ServiceDivision;
}

export const services: readonly ServiceItem[] = [
  {
    slug: 'fiberglass-repairs',
    name: 'Fiberglass Repairs',
    division: 'marine',
  },
  { slug: 'gelcoat-repairs', name: 'Gelcoat Repairs', division: 'marine' },
  { slug: 'marine-painting', name: 'Marine Painting', division: 'marine' },
  {
    slug: 'metallic-refinishing',
    name: 'Metallic Refinishing',
    division: 'marine',
  },
  { slug: 'ceramic-coatings', name: 'Ceramic Coatings', division: 'marine' },
  {
    slug: 'composite-repairs-marine',
    name: 'Composite Repairs',
    division: 'marine',
  },
  {
    slug: 'yacht-cosmetic-repairs',
    name: 'Yacht Cosmetic Repairs',
    division: 'marine',
  },
  {
    slug: 'aircraft-refinishing',
    name: 'Aircraft Refinishing',
    division: 'aviation',
  },
  {
    slug: 'composite-repairs-aviation',
    name: 'Composite Repairs',
    division: 'aviation',
  },
  {
    slug: 'spot-paint-repairs',
    name: 'Spot Paint Repairs',
    division: 'aviation',
  },
  {
    slug: 'metallic-restoration',
    name: 'Metallic Restoration',
    division: 'aviation',
  },
  {
    slug: 'ceramic-protection',
    name: 'Ceramic Protection',
    division: 'aviation',
  },
];

export const servicesByDivision = (
  division: ServiceDivision,
): readonly ServiceItem[] =>
  services.filter((service) => service.division === division);
