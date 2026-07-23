/**
 * Owner decisions still required before production content/launch completeness.
 * Architecture may ship with empty-safe states; these items remain unresolved.
 */

export interface OwnerDecisionItem {
  readonly id: string;
  readonly area: string;
  readonly decision: string;
  readonly status: 'unresolved' | 'resolved';
  readonly blocksProductionLaunch: boolean;
}

export const unresolvedOwnerDecisions: readonly OwnerDecisionItem[] = [
  {
    id: 'founding-year',
    area: 'About',
    decision: 'Whether to publish founding year / experience wording',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'team-bios',
    area: 'About',
    decision: 'Owner and team biography publication',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'licenses-certs',
    area: 'About',
    decision: 'Documented licenses/certifications (if any) for publication',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'first-projects',
    area: 'Portfolio',
    decision: 'First owner-approved projects + customer consent for photos',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'testimonials',
    area: 'Testimonials',
    decision: 'Approved quotes + written publication consent',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'warranty-terms',
    area: 'Workmanship',
    decision: 'Actual warranty terms, coverage period, and exclusions',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'service-area-expansion',
    area: 'Service area',
    decision: 'Additional cities/counties/marinas/travel radius publication',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'physical-address',
    area: 'NAP / local SEO',
    decision: 'Whether a physical mailing/shop address must be published',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'estimate-policy-confirm',
    area: 'Operations',
    decision:
      'Confirm free-estimate Fort Lauderdale policy still matches operations',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'submission-inbox',
    area: 'Forms',
    decision: 'Confirm destination inbox and from-address for Resend delivery',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'upload-enablement',
    area: 'Estimate photos',
    decision: 'Whether production estimate photo uploads are enabled at launch',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'brand-assets',
    area: 'Brand',
    decision: 'Final logo and approved photography replacing placeholders',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
] as const;

export function getUnresolvedOwnerDecisions(): readonly OwnerDecisionItem[] {
  return unresolvedOwnerDecisions.filter(
    (item) => item.status === 'unresolved',
  );
}

export function getLaunchBlockingOwnerDecisions(): readonly OwnerDecisionItem[] {
  return getUnresolvedOwnerDecisions().filter(
    (item) => item.blocksProductionLaunch,
  );
}
