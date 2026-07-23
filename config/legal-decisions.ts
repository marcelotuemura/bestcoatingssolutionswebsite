/**
 * Legal decisions still required before production launch.
 * Website legal pages are architecture — not certified legal advice.
 */

export interface LegalDecisionItem {
  readonly id: string;
  readonly decision: string;
  readonly status: 'unresolved' | 'resolved';
  readonly blocksProductionLaunch: boolean;
}

export const unresolvedLegalDecisions: readonly LegalDecisionItem[] = [
  {
    id: 'privacy-approval',
    decision: 'Owner/counsel approval of Privacy Policy final copy',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'terms-approval',
    decision: 'Owner/counsel approval of Terms of Use final copy',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'governing-law',
    decision: 'Governing law and venue',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'liability',
    decision: 'Limitation of liability language',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'warranty-disclaimer',
    decision:
      'Warranty disclaimer final wording (site + workmanship alignment)',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'retention',
    decision: 'Data retention periods for contact/estimate/photo data',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'privacy-regimes',
    decision:
      'Whether formal privacy regimes apply (do not claim GDPR/CCPA without confirmation)',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'mailing-address',
    decision: 'Whether a physical mailing address must be published',
    status: 'unresolved',
    blocksProductionLaunch: false,
  },
  {
    id: 'children-privacy',
    decision: 'Children’s privacy age threshold confirmation',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'processors',
    decision:
      'Third-party processor list once Resend/Turnstile/Analytics/Sentry/Blob are live',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
  {
    id: 'consent-retention',
    decision: 'Consent record retention for form acknowledgments',
    status: 'unresolved',
    blocksProductionLaunch: true,
  },
] as const;

export function getUnresolvedLegalDecisions(): readonly LegalDecisionItem[] {
  return unresolvedLegalDecisions.filter(
    (item) => item.status === 'unresolved',
  );
}

export function getLaunchBlockingLegalDecisions(): readonly LegalDecisionItem[] {
  return getUnresolvedLegalDecisions().filter(
    (item) => item.blocksProductionLaunch,
  );
}
