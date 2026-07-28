/**
 * Authentic Marine division photography from `public/images/marine`.
 * Source album: owner-uploaded Formula project photos in
 * `data/pictures/formula/Formula/`.
 *
 * Rules:
 * - No stock, AI, or external URLs
 * - No invented vessel/customer/project claims in alt text
 * - Brand names only when legible in the frame
 * - Filenames do not encode before/after — no invented BA pairs
 */

export type MarinePhoto = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly temporary: false;
};

export const marinePhotography = {
  hero: {
    src: '/images/marine/hero-formula-330cbr-stern.webp',
    width: 1920,
    height: 1440,
    alt: 'Stern of a Formula 330 CBR powerboat with a high-gloss blue hull finish after marine refinishing',
    temporary: false as const,
  },
  gallery: [
    {
      src: '/images/marine/gallery-01-bow-mirror-gloss.webp',
      width: 1440,
      height: 1080,
      alt: 'Bow of a powerboat with a mirror-gloss blue and white hull finish in a dry-dock setting',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-02-bow-gloss-detail.webp',
      width: 1440,
      height: 1080,
      alt: 'Close view of a high-gloss bow finish reflecting sky and yard light after refinishing',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-03-stern-branded.webp',
      width: 1920,
      height: 1440,
      alt: 'Formula 330 CBR stern and swim platform showing a glossy blue graphics finish',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-04-hull-forklift-gloss.webp',
      width: 1920,
      height: 1440,
      alt: 'Completed powerboat hull with a glossy refinishing coat while supported in a yard forklift',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-05-bow-drydock.webp',
      width: 1920,
      height: 1440,
      alt: 'Bow and side of a refinished powerboat with a smooth gloss finish in dry dock',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-06-masking-graphics.webp',
      width: 1440,
      height: 1080,
      alt: 'Hull graphics masked with protective tape during marine refinishing preparation',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-07-masking-side.webp',
      width: 1440,
      height: 1080,
      alt: 'Blue powerboat hull side masked with plastic sheeting inside a marine work enclosure',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-08-masking-portholes.webp',
      width: 1440,
      height: 1080,
      alt: 'Hull portholes and fittings taped and masked during marine surface preparation',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-09-masking-navy.webp',
      width: 1920,
      height: 1440,
      alt: 'Navy hull under protective masking paper inside a controlled marine coating enclosure',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-10-masking-midhull.webp',
      width: 1920,
      height: 1440,
      alt: 'Mid-hull section of a blue powerboat fully masked for refinishing work',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-11-masking-overspray.webp',
      width: 1920,
      height: 1440,
      alt: 'Protective plastic showing overspray while a hull is masked during marine coating work',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-12-masking-stern-quarter.webp',
      width: 1920,
      height: 1440,
      alt: 'Stern-quarter view of a powerboat under plastic and tape masking during refinishing',
      temporary: false as const,
    },
  ] satisfies readonly MarinePhoto[],
  /**
   * No source filenames include before/after markers, so no BA pairs are published.
   */
  beforeAfterPairs: [] as const,
} as const;
