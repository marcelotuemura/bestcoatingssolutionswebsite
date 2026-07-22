/**
 * Marine service catalogue for Phase 3 public pages.
 * Aviation has no public service catalog while status is coming-soon.
 */
import type { MarineServiceContentKey } from '@/content/marine-services-en';

export const marineServices = [
  { slug: 'gelcoat-repair', contentKey: 'gelcoatRepair' },
  { slug: 'fiberglass-repair', contentKey: 'fiberglassRepair' },
  { slug: 'paint-refinishing', contentKey: 'paintRefinishing' },
  { slug: 'hull-restoration', contentKey: 'hullRestoration' },
  { slug: 'yacht-cosmetic-repair', contentKey: 'yachtCosmeticRepair' },
  {
    slug: 'structural-composite-repair',
    contentKey: 'structuralCompositeRepair',
  },
  { slug: 'color-matching', contentKey: 'colorMatching' },
  { slug: 'insurance-repair', contentKey: 'insuranceRepair' },
] as const satisfies readonly {
  readonly slug: string;
  readonly contentKey: MarineServiceContentKey;
}[];

export type MarineServiceSlug = (typeof marineServices)[number]['slug'];

export interface MarineServiceDefinition {
  readonly slug: MarineServiceSlug;
  readonly contentKey: MarineServiceContentKey;
}

export function getMarineServiceBySlug(
  slug: string,
): (typeof marineServices)[number] | undefined {
  return marineServices.find((service) => service.slug === slug);
}

export function isMarineServiceSlug(slug: string): slug is MarineServiceSlug {
  return marineServices.some((service) => service.slug === slug);
}
