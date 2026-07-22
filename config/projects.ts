/**
 * Project / case-study content model for future approved work.
 * Phase 3 ships the framework only — no fabricated projects.
 */

export type ProjectCategory =
  | 'gelcoat'
  | 'fiberglass'
  | 'paint'
  | 'hull'
  | 'yacht-cosmetic'
  | 'structural'
  | 'color-matching'
  | 'insurance'
  | 'other';

export interface ProjectImageSlot {
  readonly id: string;
  readonly role: 'hero' | 'before' | 'after' | 'detail' | 'result';
  /** Always true until a real approved asset is attached. */
  readonly placeholder: true;
  readonly captionKey?: string;
}

export interface ProjectCaseStudy {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly problem: string;
  readonly repair: string;
  readonly materials: readonly string[];
  readonly timeline: string;
  readonly images: readonly ProjectImageSlot[];
  readonly results: string;
  readonly ctaPath: string;
  /**
   * When false, UI must show placeholder labels and must not imply BCS completed
   * this work.
   */
  readonly published: boolean;
  readonly placeholder: true;
}

/**
 * Empty published catalogue — real projects land only after owner approval.
 * The placeholder entry demonstrates field architecture for future content.
 */
export const projectPlaceholders: readonly ProjectCaseStudy[] = [
  {
    id: 'placeholder-framework-gelcoat',
    slug: 'placeholder-gelcoat-framework',
    title: 'Future Project — gelcoat restoration framework (placeholder)',
    category: 'gelcoat',
    problem:
      'Problem field reserved. Describe the vessel condition that required work.',
    repair:
      'Repair field reserved. Describe preparation, materials, and finish steps.',
    materials: [
      'Materials list reserved',
      'Systems and products confirmed per job',
    ],
    timeline: 'Timeline reserved — confirm with a real approved project.',
    images: [
      { id: 'ph-hero', role: 'hero', placeholder: true },
      { id: 'ph-before', role: 'before', placeholder: true },
      { id: 'ph-after', role: 'after', placeholder: true },
      { id: 'ph-detail', role: 'detail', placeholder: true },
      { id: 'ph-result', role: 'result', placeholder: true },
    ],
    results:
      'Results field reserved. Capture measurable or photographic outcomes only with permission.',
    ctaPath: '/estimate-request',
    published: false,
    placeholder: true,
  },
] as const;

/** Published projects only — empty until owner-approved case studies exist. */
export function getPublishedProjects(): readonly ProjectCaseStudy[] {
  return projectPlaceholders.filter((project) => project.published);
}

export function getProjectFrameworkDemo(): ProjectCaseStudy {
  return projectPlaceholders[0]!;
}
