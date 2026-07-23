/**
 * Typed placeholders for About-page owner facts.
 * Unapproved facts must not render on the production page.
 */

import type { OwnerApprovalStatus } from '@/config/publication';

export interface AboutOwnerFactPlaceholder {
  readonly id: string;
  readonly label: string;
  readonly ownerApprovalStatus: OwnerApprovalStatus;
  /** Only render when approved and value is set. */
  readonly value?: string;
}

/**
 * Reserved slots for future owner-approved company facts.
 * None are approved for public display yet.
 */
export const aboutOwnerFactPlaceholders: readonly AboutOwnerFactPlaceholder[] =
  [
    {
      id: 'founding-year',
      label: 'Founding year',
      ownerApprovalStatus: 'pending',
    },
    {
      id: 'years-experience',
      label: 'Years of experience wording',
      ownerApprovalStatus: 'pending',
    },
    {
      id: 'team-size',
      label: 'Team size',
      ownerApprovalStatus: 'pending',
    },
    {
      id: 'licenses',
      label: 'Documented licenses',
      ownerApprovalStatus: 'pending',
    },
    {
      id: 'certifications',
      label: 'Documented certifications',
      ownerApprovalStatus: 'pending',
    },
    {
      id: 'owner-biography',
      label: 'Owner biography',
      ownerApprovalStatus: 'pending',
    },
    {
      id: 'mission',
      label: 'Approved mission statement',
      ownerApprovalStatus: 'pending',
    },
  ] as const;

export function getApprovedAboutFacts(): readonly AboutOwnerFactPlaceholder[] {
  return aboutOwnerFactPlaceholders.filter(
    (fact) =>
      fact.ownerApprovalStatus === 'approved' &&
      typeof fact.value === 'string' &&
      fact.value.trim().length > 0,
  );
}

export const companyValueIds = [
  'careful-inspection',
  'clear-communication',
  'appropriate-repair-planning',
  'surface-preparation',
  'finish-attention',
  'respect-for-vessel',
  'honest-scope',
  'professional-documentation',
] as const;

export type CompanyValueId = (typeof companyValueIds)[number];
