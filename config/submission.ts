/**
 * Public form submission messaging flags.
 * Delivery is handled by Server Actions + Resend (see docs/FORM_DELIVERY.md).
 */
export const submissionMessaging = {
  /** True only when FORM_DELIVERY_MODE=mock (test harness). */
  demoModeFlag: false,
  simulateFailureHeader: 'x-bcs-simulate-failure',
} as const;

export type SubmissionMessaging = typeof submissionMessaging;
