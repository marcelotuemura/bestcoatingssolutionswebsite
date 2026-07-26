/**
 * Authentic Marine division photography from `public/images/marine`.
 * Source albums: owner-uploaded Chris Craft / Gold Axopar project photos.
 *
 * Rules:
 * - No stock, AI, or external URLs
 * - No invented vessel/customer/project claims in alt text
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
    src: '/images/marine/hero-completed-hull.webp',
    width: 1920,
    height: 1080,
    alt: 'Completed marine hull refinishing on a powerboat with a glossy dark hull, red accent stripe, and white lower hull, shown on stands in a work enclosure',
    temporary: false as const,
  },
  gallery: [
    {
      src: '/images/marine/gallery-01-hull-gloss-stern.webp',
      width: 1920,
      height: 1080,
      alt: 'Close view of a glossy dark hull and red accent stripe near the stern after marine refinishing',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-02-hull-gloss-profile.webp',
      width: 1920,
      height: 1080,
      alt: 'Side profile of a refinished powerboat hull reflecting workshop lights on a high-gloss finish',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-03-hull-damage-detail.webp',
      width: 1920,
      height: 1080,
      alt: 'Close-up of hull surface damage on a dark hull with a red accent stripe before refinishing work',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-04-completed-bow.webp',
      width: 1920,
      height: 1080,
      alt: 'Bow and side of a motorboat with a high-gloss completed hull finish in a boatyard',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-05-completed-side.webp',
      width: 1920,
      height: 1080,
      alt: 'Side view of a motorboat hull with a smooth completed refinishing coat in a dry-dock setting',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-06-masking-bow.webp',
      width: 1200,
      height: 1600,
      alt: 'Boat bow masked with protective paper and tape inside a marine work tent during preparation',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-07-masking-stern.webp',
      width: 1600,
      height: 1200,
      alt: 'Powerboat fully masked under plastic sheeting inside a controlled marine refinishing enclosure',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-08-gloss-application.webp',
      width: 1600,
      height: 1200,
      alt: 'Dark hull with a fresh high-gloss coating and protective masking during marine refinishing',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-09-work-area.webp',
      width: 1600,
      height: 1200,
      alt: 'Marine refinishing work area with a vessel under preparation in a temporary enclosure',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-10-catamaran-masking.webp',
      width: 1600,
      height: 1200,
      alt: 'Catamaran hulls masked with tape and paper inside a clean marine coating enclosure',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-11-white-hull-finish.webp',
      width: 1600,
      height: 1200,
      alt: 'White powerboat with a clean hull finish inside a marine work tent',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-12-hull-workmanship.webp',
      width: 1600,
      height: 1200,
      alt: 'Hull surface workmanship detail during a Best Coatings Solutions marine refinishing project',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-13-finish-detail.webp',
      width: 1600,
      height: 1200,
      alt: 'Detail of a marine hull finish prepared during a refinishing project',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-14-workshop-finish.webp',
      width: 1600,
      height: 1200,
      alt: 'Completed hull finish photographed in a marine workshop setting',
      temporary: false as const,
    },
  ] satisfies readonly MarinePhoto[],
  /**
   * No source filenames include before/after markers, so no BA pairs are published.
   */
  beforeAfterPairs: [] as const,
} as const;
