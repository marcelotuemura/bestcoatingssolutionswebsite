/**
 * Temporary submission messaging until a production delivery provider is wired.
 * Forms use Server Actions (`process-submission.ts`). Demo/prepared remains the
 * default until `canEnablePublicFormDelivery()` passes launch env gates.
 */
export const submissionMessaging = {
  /**
   * PRODUCTION BLOCKER: Real email delivery is gated.
   * Never claim BCS received a message until SUBMISSION_DELIVERY_ENABLED=true
   * and required credentials (Resend, Turnstile, Upstash, site URL) are live.
   */
  demoSuccessNotice:
    'Your request has been prepared successfully. Direct delivery will be enabled before production launch.',
  deliveredSuccessNotice:
    'Your request was sent to Best Coatings Solutions. We will follow up using the contact details you provided.',
  /**
   * Static docs flag — runtime mode uses `isDemoSubmissionMode()` / launch gates.
   */
  demoModeFlag: true,
  simulateFailureHeader: 'x-bcs-simulate-failure',
} as const;

export type SubmissionMessaging = typeof submissionMessaging;
