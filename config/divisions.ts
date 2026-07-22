/**
 * Division configuration — Marine and Aviation as peer offerings.
 *
 * Aviation must not be presented as currently operational until the owner
 * confirms readiness. Status drives badges and copy; change one field to flip.
 */
export type DivisionId = 'marine' | 'aviation';

/** Operational readiness for a division on the public site. */
export type DivisionStatus = 'active' | 'preview' | 'coming-soon';

export interface DivisionConfig {
  readonly id: DivisionId;
  readonly status: DivisionStatus;
  /** When false, omit from primary conversion paths (rare). */
  readonly listed: boolean;
}

export const divisions: Record<DivisionId, DivisionConfig> = {
  marine: {
    id: 'marine',
    status: 'active',
    listed: true,
  },
  aviation: {
    id: 'aviation',
    /**
     * Default until owner confirms aviation operations are active.
     * Switch to `preview` or `active` when approved.
     */
    status: 'coming-soon',
    listed: true,
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
