/**
 * Craftsmanship pillars for the homepage craft section — process, not slogans.
 */
export const trustPillars = [
  'attention-to-detail',
  'professional-finish',
  'marine-specialists',
  'mobile-service',
  'fair-pricing',
  'multilingual-team',
] as const;

export type TrustPillarId = (typeof trustPillars)[number];
