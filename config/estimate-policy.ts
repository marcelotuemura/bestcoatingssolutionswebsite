/**
 * Estimate policy — single source for forms, CTAs, and FAQ copy.
 *
 * Never display prices. Never claim all estimates are free.
 */
export const estimatePolicy = {
  /** Free estimates are available only in this area. */
  freeEstimateArea: 'Fort Lauderdale',
  freeEstimateSummary:
    'Free estimates are available only in the Fort Lauderdale area.',
  otherLocationsSummary:
    'Other locations may require review or travel arrangements.',
  /** Combined notice for forms and estimate CTAs. */
  publicNotice:
    'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
  /** Hard guardrail for implementers and tests. */
  neverClaimAllEstimatesFree: true,
  neverDisplayPrices: true,
} as const;

export type EstimatePolicy = typeof estimatePolicy;
