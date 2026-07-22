import {
  motionDistances,
  motionDurations,
  motionEasing,
} from '@/animations/tokens';

/**
 * Framer Motion variant presets — import only from homepage client islands.
 * Always pair with reduced-motion fallbacks (static opacity 1 / y 0).
 */
export const fadeInUp = {
  hidden: { opacity: 0, y: motionDistances.sectionY },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDurations.base,
      ease: motionEasing.out,
    },
  },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionDurations.base,
      ease: motionEasing.out,
    },
  },
} as const;

export const staggerChildren = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
} as const;

/** Instant variants when prefers-reduced-motion is set. */
export const reducedMotionFade = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
} as const;
