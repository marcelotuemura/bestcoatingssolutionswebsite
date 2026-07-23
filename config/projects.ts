/**
 * Project / portfolio content model.
 *
 * Only projects with status `published` and ownerApprovalStatus `approved`
 * appear on production pages or in the sitemap. Test fixtures are never
 * public and never enter the sitemap.
 */

import {
  includeTestFixtures,
  isPubliclyPublishable,
  type CustomerConsentStatus,
  type OwnerApprovalStatus,
  type PublicationStatus,
} from '@/config/publication';
import type { MarineServiceSlug } from '@/config/marine-services';

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

export type ProjectImageRepairStage =
  'before' | 'during' | 'after' | 'detail' | 'overview';

export type ProjectImageOrientation = 'landscape' | 'portrait' | 'square';

export interface ProjectImage {
  readonly id: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption?: string;
  readonly credit?: string;
  readonly orientation?: ProjectImageOrientation;
  readonly repairStage: ProjectImageRepairStage;
  readonly displayOrder: number;
  readonly publicationApproved: boolean;
  readonly customerConsentStatus: CustomerConsentStatus;
  /** True when this is a labeled placeholder, not real BCS repair photography. */
  readonly placeholder: boolean;
}

export interface ProjectBeforeAfterPair {
  readonly id: string;
  readonly beforeImageId: string;
  readonly afterImageId: string;
  readonly caption?: string;
}

export interface ProjectLocalizedCopy {
  readonly title: string;
  readonly summary: string;
  readonly damageType?: string;
  readonly repairScope?: string;
  readonly processSummary?: string;
  readonly materialsSummary?: string;
  readonly finishSummary?: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
}

export interface ProjectRecord {
  readonly id: string;
  readonly slug: string;
  readonly status: PublicationStatus;
  readonly featured: boolean;
  readonly category: ProjectCategory;
  readonly relatedServiceSlugs: readonly MarineServiceSlug[];
  readonly vesselType?: string;
  readonly manufacturer?: string;
  readonly model?: string;
  readonly year?: number;
  /** General public location only — never private slip or exact address. */
  readonly generalLocation?: string;
  readonly completionDate?: string;
  readonly images: readonly ProjectImage[];
  readonly beforeAfterPairs: readonly ProjectBeforeAfterPair[];
  readonly testimonialId?: string;
  readonly ownerApprovalStatus: OwnerApprovalStatus;
  readonly isTestFixture?: boolean;
  readonly copy: {
    readonly en: ProjectLocalizedCopy;
    readonly es: ProjectLocalizedCopy;
  };
}

/** @deprecated Prefer ProjectRecord — kept for CaseStudyFramework demo typing. */
export interface ProjectImageSlot {
  readonly id: string;
  readonly role: 'hero' | 'before' | 'after' | 'detail' | 'result';
  readonly placeholder: true;
  readonly captionKey?: string;
}

/** @deprecated Prefer ProjectRecord. */
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
  readonly published: boolean;
  readonly placeholder: true;
}

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidProjectSlug(slug: string): boolean {
  return PROJECT_SLUG_PATTERN.test(slug) && slug.length <= 80;
}

/** Production catalogue — empty until owner-approved projects exist. */
export const projectCatalog: readonly ProjectRecord[] = [] as const;

/**
 * Explicit test-only fixture. Never published to production sitemap/schema.
 * Visible only when BCS_INCLUDE_TEST_FIXTURES=1 (Playwright / local QA).
 */
export const projectTestFixture: ProjectRecord = {
  id: 'test-fixture-gelcoat-demo',
  slug: 'test-fixture-gelcoat-demo',
  status: 'published',
  featured: false,
  category: 'gelcoat',
  relatedServiceSlugs: ['gelcoat-repair', 'color-matching'],
  vesselType: 'Motor yacht (generic)',
  generalLocation: 'South Florida',
  completionDate: '2024-01-01',
  ownerApprovalStatus: 'approved',
  isTestFixture: true,
  images: [
    {
      id: 'tf-before',
      src: '/brand/marine-silhouette.svg',
      width: 1200,
      height: 800,
      alt: 'Test fixture before — labeled placeholder, not a BCS customer project',
      caption: 'Before (test fixture placeholder)',
      repairStage: 'before',
      displayOrder: 1,
      publicationApproved: true,
      customerConsentStatus: 'granted',
      placeholder: true,
      orientation: 'landscape',
    },
    {
      id: 'tf-after',
      src: '/brand/marine-silhouette.svg',
      width: 1200,
      height: 800,
      alt: 'Test fixture after — labeled placeholder, not a BCS customer project',
      caption: 'After (test fixture placeholder)',
      repairStage: 'after',
      displayOrder: 2,
      publicationApproved: true,
      customerConsentStatus: 'granted',
      placeholder: true,
      orientation: 'landscape',
    },
    {
      id: 'tf-during',
      src: '/brand/marine-silhouette.svg',
      width: 1200,
      height: 800,
      alt: 'Test fixture during repair — labeled placeholder',
      caption: 'During repair (test fixture placeholder)',
      repairStage: 'during',
      displayOrder: 3,
      publicationApproved: true,
      customerConsentStatus: 'granted',
      placeholder: true,
      orientation: 'landscape',
    },
  ],
  beforeAfterPairs: [
    {
      id: 'tf-pair-1',
      beforeImageId: 'tf-before',
      afterImageId: 'tf-after',
      caption: 'Test fixture before-and-after pair (not real BCS work)',
    },
  ],
  copy: {
    en: {
      title: 'TEST FIXTURE — Gelcoat demo (not a real BCS project)',
      summary:
        'This record exists only for automated tests. It is not customer work and must never appear as published BCS portfolio content.',
      damageType: 'Cosmetic gelcoat chips (fixture)',
      repairScope: 'Localized gelcoat restoration (fixture)',
      processSummary: 'Assess → prepare → restore → finish (fixture narrative)',
      materialsSummary: 'Fixture materials note — not a real materials list',
      finishSummary: 'Fixture finish note',
      metaTitle: 'Test Fixture Project | BCS',
      metaDescription:
        'Test-only portfolio fixture excluded from production sitemap and structured data.',
    },
    es: {
      title:
        'FIXTURE DE PRUEBA — Demostración de gelcoat (no es un proyecto real de BCS)',
      summary:
        'Este registro existe solo para pruebas automatizadas. No es trabajo de un cliente y nunca debe aparecer como portafolio publicado de BCS.',
      damageType: 'Astillas cosméticas de gelcoat (fixture)',
      repairScope: 'Restauración localizada de gelcoat (fixture)',
      processSummary:
        'Evaluar → preparar → restaurar → acabar (narrativa de fixture)',
      materialsSummary: 'Nota de materiales de fixture — no es una lista real',
      finishSummary: 'Nota de acabado de fixture',
      metaTitle: 'Proyecto fixture de prueba | BCS',
      metaDescription:
        'Fixture de portafolio solo para pruebas; excluido del sitemap y datos estructurados de producción.',
    },
  },
};

/** Draft / future samples kept for schema tests — never public. */
export const projectStatusSamples: readonly ProjectRecord[] = [
  {
    id: 'sample-draft',
    slug: 'sample-draft-project',
    status: 'draft',
    featured: false,
    category: 'paint',
    relatedServiceSlugs: ['paint-refinishing'],
    ownerApprovalStatus: 'pending',
    images: [],
    beforeAfterPairs: [],
    copy: {
      en: {
        title: 'Draft sample',
        summary: 'Draft — not public',
        metaTitle: 'Draft',
        metaDescription: 'Draft project excluded from sitemap.',
      },
      es: {
        title: 'Muestra borrador',
        summary: 'Borrador — no público',
        metaTitle: 'Borrador',
        metaDescription: 'Proyecto borrador excluido del sitemap.',
      },
    },
  },
  {
    id: 'sample-future',
    slug: 'sample-future-project',
    status: 'future',
    featured: false,
    category: 'hull',
    relatedServiceSlugs: ['hull-restoration'],
    ownerApprovalStatus: 'pending',
    images: [],
    beforeAfterPairs: [],
    copy: {
      en: {
        title: 'Future sample',
        summary: 'Future — not public',
        metaTitle: 'Future',
        metaDescription: 'Future project excluded from sitemap.',
      },
      es: {
        title: 'Muestra futura',
        summary: 'Futuro — no público',
        metaTitle: 'Futuro',
        metaDescription: 'Proyecto futuro excluido del sitemap.',
      },
    },
  },
  {
    id: 'sample-owner-review',
    slug: 'sample-owner-review-project',
    status: 'owner-review',
    featured: false,
    category: 'fiberglass',
    relatedServiceSlugs: ['fiberglass-repair'],
    ownerApprovalStatus: 'pending',
    images: [],
    beforeAfterPairs: [],
    copy: {
      en: {
        title: 'Owner-review sample',
        summary: 'Owner review — not public',
        metaTitle: 'Owner review',
        metaDescription: 'Owner-review project excluded from sitemap.',
      },
      es: {
        title: 'Muestra en revisión del propietario',
        summary: 'Revisión del propietario — no público',
        metaTitle: 'Revisión',
        metaDescription: 'Proyecto en revisión excluido del sitemap.',
      },
    },
  },
] as const;

export function getAllProjectRecords(): readonly ProjectRecord[] {
  return [...projectCatalog, ...projectStatusSamples, projectTestFixture];
}

/** Published + owner-approved production projects (excludes fixtures). */
export function getPublishedProjects(): readonly ProjectRecord[] {
  return projectCatalog.filter(isPubliclyPublishable);
}

/** Projects visible in the UI (production published, plus fixtures when flagged). */
export function getVisibleProjects(): readonly ProjectRecord[] {
  const published = getPublishedProjects();
  if (includeTestFixtures()) {
    return [...published, projectTestFixture];
  }
  return published;
}

export function getFeaturedProjects(): readonly ProjectRecord[] {
  return getVisibleProjects().filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): ProjectRecord | undefined {
  if (!isValidProjectSlug(slug)) {
    return undefined;
  }
  const published = projectCatalog.find(
    (project) => project.slug === slug && isPubliclyPublishable(project),
  );
  if (published) {
    return published;
  }
  if (includeTestFixtures() && projectTestFixture.slug === slug) {
    return projectTestFixture;
  }
  return undefined;
}

export function getRelatedProjects(
  project: ProjectRecord,
  limit = 3,
): readonly ProjectRecord[] {
  return getVisibleProjects()
    .filter(
      (candidate) =>
        candidate.id !== project.id &&
        (candidate.category === project.category ||
          candidate.relatedServiceSlugs.some((slug) =>
            project.relatedServiceSlugs.includes(slug),
          )),
    )
    .slice(0, limit);
}

export function getProjectImageById(
  project: ProjectRecord,
  imageId: string,
): ProjectImage | undefined {
  return project.images.find((image) => image.id === imageId);
}

export function getApprovedProjectImages(
  project: ProjectRecord,
  stage?: ProjectImageRepairStage,
): readonly ProjectImage[] {
  return project.images
    .filter(
      (image) =>
        image.publicationApproved &&
        image.customerConsentStatus !== 'denied' &&
        (stage === undefined || image.repairStage === stage),
    )
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Sitemap entries — production published only; never fixtures or drafts. */
export function getSitemapProjects(): readonly ProjectRecord[] {
  return getPublishedProjects();
}

/**
 * Framework demo for the empty-state architecture illustration.
 * Not a published project and not customer work.
 */
export function getProjectFrameworkDemo(): ProjectCaseStudy {
  return {
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
  };
}

/** @deprecated Alias — empty until approved projects exist. */
export const projectPlaceholders: readonly ProjectCaseStudy[] = [
  getProjectFrameworkDemo(),
];
