/**
 * Motion tokens for the homepage (Phase 2) and shared reduced-motion policy.
 * Do not improvise durations — extend this module.
 */
export const motionDurations = {
  instant: 0,
  fast: 0.2,
  base: 0.35,
  slow: 0.55,
  hero: 1.4,
  logo: 1.6,
} as const;

export const motionEasing = {
  /** Premium ease-out for entrances. */
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  linear: [0, 0, 1, 1] as const,
} as const;

export const motionDistances = {
  sectionY: 20,
  subtleY: 8,
  parallaxMax: 8,
} as const;

export type MotionDurationKey = keyof typeof motionDurations;
