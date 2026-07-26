/**
 * Phase 3 marketing / division placeholder media.
 * Clearly temporary — never present as BCS project photography.
 */
export const marketingPlaceholders = {
  marineHero: {
    src: '/images/marine/hero-completed-hull.webp',
    temporary: false as const,
    note: 'Authentic BCS marine project photography — see config/marine-photography.ts.',
  },
  aviationHero: {
    src: '/brand/aviation-silhouette.svg',
    temporary: true as const,
    note: 'Decorative silhouette — aviation preview only.',
  },
  serviceHero: {
    src: '/brand/marine-silhouette.svg',
    temporary: true as const,
    note: 'Service page atmosphere — replace with approved photography.',
  },
  projectSlot: {
    temporary: true as const,
    note: 'Project image slot — awaiting owner-approved assets.',
  },
} as const;
