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

/**
 * Curated related-service graph for internal linking (no dead-end pages).
 */
const relatedBySlug: Record<MarineServiceSlug, readonly MarineServiceSlug[]> = {
  'gelcoat-repair': [
    'color-matching',
    'yacht-cosmetic-repair',
    'paint-refinishing',
  ],
  'fiberglass-repair': [
    'structural-composite-repair',
    'gelcoat-repair',
    'hull-restoration',
  ],
  'paint-refinishing': [
    'color-matching',
    'hull-restoration',
    'yacht-cosmetic-repair',
  ],
  'hull-restoration': [
    'gelcoat-repair',
    'paint-refinishing',
    'fiberglass-repair',
  ],
  'yacht-cosmetic-repair': [
    'gelcoat-repair',
    'color-matching',
    'paint-refinishing',
  ],
  'structural-composite-repair': [
    'fiberglass-repair',
    'hull-restoration',
    'insurance-repair',
  ],
  'color-matching': [
    'gelcoat-repair',
    'paint-refinishing',
    'yacht-cosmetic-repair',
  ],
  'insurance-repair': [
    'gelcoat-repair',
    'fiberglass-repair',
    'structural-composite-repair',
  ],
};

export function getRelatedMarineServices(
  slug: MarineServiceSlug,
): readonly MarineServiceSlug[] {
  return relatedBySlug[slug] ?? [];
}
