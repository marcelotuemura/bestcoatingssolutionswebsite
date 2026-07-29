/**
 * Authentic Marine division photography from `public/images/marine`.
 * Source albums (owner uploads archived under `data/pictures/`):
 * - `formula/Formula/` — Formula 330 CBR refinishing (hero + gallery 01–12)
 * - `axopar-ceramic-coating/` — Axopar hull gloss (gallery 13)
 * - `bow-rider/` — bow repair / masking / finish (gallery 14–17)
 * - `hardtop-fiberglass-repair/` — hardtop process + gloss (gallery 18–22)
 *
 * Rules:
 * - No stock, AI, or external URLs
 * - No invented vessel/customer/project claims in alt text
 * - Brand names only when legible in the frame
 * - No invented before/after pairs (matched framing + resolution required)
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
    {
      src: '/images/marine/gallery-13-axopar-hull-gloss.webp',
      width: 1920,
      height: 1080,
      alt: 'Axopar hull side with raised lettering and a high-gloss grey finish in a marine workshop',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-14-bow-rider-damage.webp',
      width: 1600,
      height: 1200,
      alt: 'White bow rider with cracked fiberglass and detached rub rail at the bow tip before repair',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-15-bow-rider-fairing.webp',
      width: 1600,
      height: 1200,
      alt: 'Bow tip mid-repair with fairing compound patches and a loose rub rail in a boatyard',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-16-bow-rider-masking.webp',
      width: 1600,
      height: 1200,
      alt: 'Bow tip masked with blue tape and plastic sheeting during marine coating preparation',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-17-bow-rider-finished.webp',
      width: 1600,
      height: 900,
      alt: 'Finished white bow rider cockpit and bow deck with clean gelcoat and seating',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-18-hardtop-mirror-gloss.webp',
      width: 1440,
      height: 1920,
      alt: 'Hardtop surface with a mirror-gloss white finish reflecting overhead workshop lights',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-19-hardtop-core-repair.webp',
      width: 865,
      height: 1440,
      alt: 'Fiberglass core cutout beside a replacement panel during hardtop structural repair',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-20-hardtop-lamination.webp',
      width: 1200,
      height: 1600,
      alt: 'Hardtop panel under resin lamination with masking paper and a curing weight in place',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-21-hardtop-panel-prep.webp',
      width: 900,
      height: 1600,
      alt: 'Long hardtop panel masked with yellow tape during surface preparation for refinishing',
      temporary: false as const,
    },
    {
      src: '/images/marine/gallery-22-hardtop-bodywork.webp',
      width: 1200,
      height: 1600,
      alt: 'Sanded fairing patch on a white fiberglass hardtop surface during bodywork',
      temporary: false as const,
    },
  ] satisfies readonly MarinePhoto[],
  /**
   * Owner labeled some Axopar and bow-rider frames before/after, but framing,
   * setting, and/or resolution do not meet the matched-pair protocol — keep empty.
   */
  beforeAfterPairs: [] as const,
} as const;
