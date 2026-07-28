/**
 * Homepage placeholder media inventory.
 * These are NOT real BCS projects — UI must label them as placeholders.
 */
export const homePlaceholders = {
  featuredProject: {
    id: 'placeholder-featured-marine-gelcoat',
    placeholder: true as const,
    division: 'marine' as const,
    slug: 'placeholder-gelcoat-restoration',
  },
  beforeAfter: {
    id: 'placeholder-before-after-hull',
    placeholder: true as const,
    division: 'marine' as const,
  },
  logo: {
    src: '/brand/bcs-logo-official.webp',
    temporary: false as const,
    note: 'Preferred production asset — see config/brand-logo.ts and public/brand/README.md. Temporary letterform SVG is scaffolding only.',
  },
  marineVisual: {
    src: '/brand/marine-silhouette.svg',
    temporary: true as const,
    note: 'Decorative silhouette — not BCS project photography.',
  },
  aviationVisual: {
    src: '/brand/aviation-silhouette.svg',
    temporary: true as const,
    note: 'Decorative silhouette — aviation preview only.',
  },
} as const;
