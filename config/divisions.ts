/**
 * Division configuration — Marine and Aviation as peer offerings.
 *
 * Aviation is publicly visible and credible. Marine remains the primary
 * commercial focus (full public estimate path). Aviation inquiries go through
 * Contact — not regulated-maintenance claims.
 */
export type DivisionId = 'marine' | 'aviation';

/** Operational readiness for a division on the public site. */
export type DivisionStatus = 'active' | 'preview' | 'coming-soon';

export interface DivisionConfig {
  readonly id: DivisionId;
  readonly status: DivisionStatus;
  /** When false, omit from primary conversion paths (rare). */
  readonly listed: boolean;
  /** Public estimate-request form accepts this division. */
  readonly acceptsPublicEstimates: boolean;
}

export const divisions: Record<DivisionId, DivisionConfig> = {
  marine: {
    id: 'marine',
    status: 'active',
    listed: true,
    acceptsPublicEstimates: true,
  },
  aviation: {
    id: 'aviation',
    status: 'active',
    listed: true,
    /** Inquiries via Contact; keep estimate form marine-primary for now. */
    acceptsPublicEstimates: false,
  },
} as const;

export function isDivisionPubliclyActive(id: DivisionId): boolean {
  return divisions[id].status === 'active';
}

export function getDivisionStatusLabel(
  status: DivisionStatus,
): 'Active' | 'Preview' | 'Coming soon' {
  switch (status) {
    case 'active':
      return 'Active';
    case 'preview':
      return 'Preview';
    case 'coming-soon':
      return 'Coming soon';
  }
}
