/**
 * Temporary submission messaging until a production delivery provider is wired.
 * Replace these strings (and adapters) before public launch.
 */
export const submissionMessaging = {
  /**
   * PRODUCTION BLOCKER: Real email/CRM delivery is not configured.
   * Mock adapters only simulate success — never claim BCS received a message.
   */
  demoSuccessNotice:
    'Your request has been prepared successfully. Direct delivery will be enabled before production launch.',
  demoModeFlag: true,
  simulateFailureHeader: 'x-bcs-simulate-failure',
} as const;

export type SubmissionMessaging = typeof submissionMessaging;
