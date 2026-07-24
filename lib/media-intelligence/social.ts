import type {
  MediaAsset,
  MediaProject,
  SocialDraft,
} from '@/lib/media-intelligence/schemas';

const platforms = [
  'instagram',
  'facebook',
  'linkedin',
  'google_business',
  'x',
  'threads',
  'pinterest',
] as const;

export function generateSocialDrafts(
  project: MediaProject,
  assets: readonly MediaAsset[],
): readonly SocialDraft[] {
  const manufacturer = project.boat?.manufacturer ?? 'marine vessel';
  const repair =
    project.repairTypes[0]?.replace(/_/g, ' ') ?? 'cosmetic repair';
  const ordered = [
    ...project.beforeAssetIds,
    ...project.duringAssetIds,
    ...project.afterAssetIds,
  ].filter((id) => assets.some((asset) => asset.id === id));

  const caption = `Another ${manufacturer} ${repair} completed with care — before, during, and after. South Florida mobile marine craftsmanship by Best Coatings Solutions.`;
  const hashtags = [
    '#BestCoatingsSolutions',
    '#MarineRepair',
    '#Gelcoat',
    '#YachtCare',
    '#SouthFloridaBoating',
    '#BeforeAndAfter',
  ];

  return platforms.map((platform) => ({
    projectId: project.id,
    platform,
    caption:
      platform === 'linkedin'
        ? `${caption} Documentation only — estimate and insurance follow-up handled separately.`
        : caption,
    hashtags,
    imageAssetIds: ordered.length ? ordered : assets.map((a) => a.id),
    carouselOrder: ordered.length ? ordered : assets.map((a) => a.id),
    callToAction:
      'Request a marine estimate — Fort Lauderdale free-estimate policy applies.',
    seoKeywords: [manufacturer, repair, 'marine repair', 'South Florida'],
    requiresOwnerApproval: true,
  }));
}

export interface ContentCalendarHint {
  readonly kind:
    | 'weekly_post'
    | 'monthly_blog'
    | 'seasonal'
    | 'insurance_tip'
    | 'maintenance_tip'
    | 'customer_story'
    | 'before_after_campaign';
  readonly title: string;
  readonly rationale: string;
  readonly autoPublish: false;
}

export function recommendContentCalendar(): readonly ContentCalendarHint[] {
  return [
    {
      kind: 'weekly_post',
      title: 'Before/after gelcoat spotlight',
      rationale: 'Steady proof content for social + GBP.',
      autoPublish: false,
    },
    {
      kind: 'monthly_blog',
      title: 'Marine maintenance tip: oxidation vs damage',
      rationale: 'SEO evergreen education without inventing reviews.',
      autoPublish: false,
    },
    {
      kind: 'insurance_tip',
      title: 'What insurers look for in repair photos',
      rationale: 'Supports insurance repair positioning.',
      autoPublish: false,
    },
    {
      kind: 'before_after_campaign',
      title: 'Seasonal shine campaign',
      rationale: 'Pair approved after photos with soft CTA.',
      autoPublish: false,
    },
  ];
}
