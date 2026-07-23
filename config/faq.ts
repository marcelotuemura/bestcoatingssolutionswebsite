/**
 * Central FAQ category registry.
 * Answers live in localized content modules — this file owns ids and routing.
 */

export const faqCategoryIds = [
  'estimates',
  'inspections',
  'gelcoat-repair',
  'fiberglass-repair',
  'paint-refinishing',
  'structural-composite-repair',
  'color-matching',
  'insurance-related-repairs',
  'vessel-preparation',
  'vessel-access',
  'damage-photography',
  'scheduling',
  'workmanship',
  'service-area',
] as const;

export type FaqCategoryId = (typeof faqCategoryIds)[number];

export interface FaqCategoryDefinition {
  readonly id: FaqCategoryId;
  readonly relatedServiceSlugs: readonly string[];
}

export const faqCategories: readonly FaqCategoryDefinition[] = [
  { id: 'estimates', relatedServiceSlugs: [] },
  { id: 'inspections', relatedServiceSlugs: [] },
  {
    id: 'gelcoat-repair',
    relatedServiceSlugs: ['gelcoat-repair', 'color-matching'],
  },
  {
    id: 'fiberglass-repair',
    relatedServiceSlugs: ['fiberglass-repair', 'structural-composite-repair'],
  },
  {
    id: 'paint-refinishing',
    relatedServiceSlugs: ['paint-refinishing', 'hull-restoration'],
  },
  {
    id: 'structural-composite-repair',
    relatedServiceSlugs: ['structural-composite-repair', 'fiberglass-repair'],
  },
  {
    id: 'color-matching',
    relatedServiceSlugs: ['color-matching', 'gelcoat-repair'],
  },
  {
    id: 'insurance-related-repairs',
    relatedServiceSlugs: ['insurance-repair'],
  },
  { id: 'vessel-preparation', relatedServiceSlugs: [] },
  { id: 'vessel-access', relatedServiceSlugs: [] },
  { id: 'damage-photography', relatedServiceSlugs: [] },
  { id: 'scheduling', relatedServiceSlugs: [] },
  { id: 'workmanship', relatedServiceSlugs: [] },
  { id: 'service-area', relatedServiceSlugs: [] },
] as const;

export function isFaqCategoryId(value: string): value is FaqCategoryId {
  return (faqCategoryIds as readonly string[]).includes(value);
}
