/**
 * Public form delivery configuration (non-secret).
 * Secrets live in environment variables — see docs/FORM_DELIVERY.md.
 */

export const formDeliveryConfig = {
  /**
   * FORM_DELIVERY_MODE:
   * - unset / `live` — Resend required (production path)
   * - `mock` — test/e2e harness only; never use in real Production
   */
  modeEnv: 'FORM_DELIVERY_MODE',
  rateLimit: {
    /** Max successful/attempted submissions per identity per window. */
    maxAttempts: 8,
    windowMs: 15 * 60 * 1000,
  },
  /** Honeypot field name — must remain empty for humans. */
  honeypotField: 'companyUrl',
} as const;
