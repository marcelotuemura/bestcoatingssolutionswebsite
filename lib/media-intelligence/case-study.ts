import type {
  CaseStudyDraft,
  MediaAsset,
  MediaProject,
} from '@/lib/media-intelligence/schemas';

/** Owner approval always required before publication. */
export function generateCaseStudyDraft(
  project: MediaProject,
  assets: readonly MediaAsset[],
): CaseStudyDraft {
  const manufacturer =
    project.boat?.manufacturer ?? assets[0]?.manufacturer ?? 'Marine vessel';
  const repairs = project.repairTypes.filter((r) => r !== 'unknown');
  const damages = project.damageTypes.filter((d) => d !== 'unknown');
  const repairLabel = repairs.length
    ? repairs.map((r) => r.replace(/_/g, ' ')).join(', ')
    : 'cosmetic restoration';
  const damageLabel = damages.length
    ? damages.map((d) => d.replace(/_/g, ' ')).join(', ')
    : 'surface damage';

  const title = `${manufacturer} ${repairLabel} restoration`;
  const summary = `Documented ${repairLabel} on a ${manufacturer} vessel, covering ${damageLabel} through finish.`;

  return {
    projectId: project.id,
    title,
    summary,
    damage: `Observed ${damageLabel} requiring professional assessment and controlled repair.`,
    repairProcess:
      'Assess → protect surrounding surfaces → prepare → restore → color-match / finish → client review.',
    materials: repairs.includes('gelcoat')
      ? ['Marine gelcoat', 'Catalyst', 'Masking', 'Finishing compounds']
      : ['Marine composites', 'Fairing compounds', 'Finishing materials'],
    techniques: repairs.map((r) => r.replace(/_/g, ' ')),
    estimatedLabor: 'To be confirmed with operations — draft only.',
    challenges:
      'Color continuity, access constraints, and finish uniformity under marina conditions.',
    finalResult:
      'Restored surface ready for presentation after owner-approved photography.',
    seoTitle: `${title} | Best Coatings Solutions`,
    metaDescription: summary.slice(0, 155),
    keywords: [
      manufacturer,
      ...repairs,
      ...damages,
      'marine repair',
      'South Florida',
      'Best Coatings Solutions',
    ],
    altTexts: assets.map(
      (asset) =>
        `${manufacturer} ${asset.imageType} photo — ${repairLabel} documentation`,
    ),
    captions: assets.map((asset) =>
      `${asset.imageType} stage: ${manufacturer} ${repairLabel}`.trim(),
    ),
    blogArticleDraft: `# ${title}\n\n${summary}\n\n## Damage\n\nObserved ${damageLabel}.\n\n## Process\n\nAssess, protect, restore, finish, review.\n\n## Result\n\nOwner-approved documentation only — draft pending publication approval.`,
    insuranceSummary: `Repair documentation draft for ${damageLabel} treated with ${repairLabel}. Not a claim determination.`,
    requiresOwnerApproval: true,
  };
}
