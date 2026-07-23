/**
 * Temporary submission messaging until a production delivery provider is wired.
 * Replace adapters and flip SUBMISSION_DELIVERY_ENABLED only after launch gates clear.
 */
export const submissionMessaging = {
  /**
   * PRODUCTION BLOCKER: Real email delivery is gated.
   * Mock adapters only simulate success — never claim BCS received a message
   * until SUBMISSION_DELIVERY_ENABLED=true and Resend credentials are live.
   */
  demoSuccessNotice:
    'Your request has been prepared successfully. Direct delivery will be enabled before production launch.',
  deliveredSuccessNotice:
    'Your request was sent to Best Coatings Solutions. We will follow up using the contact details you provided.',
  /**
   * Demo mode remains the default public behavior until launch gates pass.
   * Runtime delivery still requires SUBMISSION_DELIVERY_ENABLED=true.
   */
  demoModeFlag: true,
  simulateFailureHeader: 'x-bcs-simulate-failure',
} as const;

export type SubmissionMessaging = typeof submissionMessaging;
