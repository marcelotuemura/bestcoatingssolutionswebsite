/**
 * Trust pillars for the Why BCS section — real capabilities, never fake reviews.
 */
export const trustPillars = [
  'mobile-service',
  'professional-finish',
  'marine-specialists',
  'aircraft-specialists',
  'modern-equipment',
  'fair-pricing',
  'fast-response',
  'attention-to-detail',
  'multilingual-team',
] as const;

export type TrustPillarId = (typeof trustPillars)[number];
