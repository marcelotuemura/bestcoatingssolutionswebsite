/**
 * Production launch readiness gates for the public marketing website.
 *
 * Live form delivery must stay off until delivery is explicitly enabled and
 * required provider credentials / legal approvals are in place.
 */

export interface LaunchGate {
  readonly id: string;
  readonly label: string;
  readonly ready: boolean;
  readonly blocker: boolean;
  readonly notes: string;
}

function envPresent(key: string): boolean {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
}

/** Hard switch — never treat forms as delivered unless explicitly enabled. */
export function isSubmissionDeliveryEnabled(): boolean {
  return process.env.SUBMISSION_DELIVERY_ENABLED === 'true';
}

/**
 * Demo/prepared mode remains active until delivery is enabled and
 * required env credentials for launch are present.
 */
export function isDemoSubmissionMode(): boolean {
  return !canEnablePublicFormDelivery();
}

export function getLaunchGates(): readonly LaunchGate[] {
  const deliveryEnabled = isSubmissionDeliveryEnabled();
  const resendReady = envPresent('RESEND_API_KEY');
  const turnstileReady =
    envPresent('NEXT_PUBLIC_TURNSTILE_SITE_KEY') &&
    envPresent('TURNSTILE_SECRET_KEY');
  const rateLimitReady =
    envPresent('UPSTASH_REDIS_REST_URL') &&
    envPresent('UPSTASH_REDIS_REST_TOKEN');
  const sentryReady =
    envPresent('SENTRY_DSN') || envPresent('NEXT_PUBLIC_SENTRY_DSN');
  const siteUrlReady = envPresent('NEXT_PUBLIC_SITE_URL');

  return [
    {
      id: 'site-url',
      label: 'Production site URL configured',
      ready: siteUrlReady,
      blocker: true,
      notes: 'Set NEXT_PUBLIC_SITE_URL to the canonical production origin.',
    },
    {
      id: 'delivery-flag',
      label: 'Submission delivery explicitly enabled',
      ready: deliveryEnabled,
      blocker: true,
      notes:
        'SUBMISSION_DELIVERY_ENABLED=true required. Default remains demo/prepared-only.',
    },
    {
      id: 'resend',
      label: 'Resend API key present',
      ready: resendReady,
      blocker: true,
      notes: 'Required before claiming BCS received a form submission.',
    },
    {
      id: 'turnstile',
      label: 'Cloudflare Turnstile keys present',
      ready: turnstileReady,
      blocker: true,
      notes: 'Bot protection required for public contact and estimate forms.',
    },
    {
      id: 'rate-limit',
      label: 'Upstash Redis rate-limit credentials present',
      ready: rateLimitReady,
      blocker: true,
      notes: 'Server-side rate limiting required before public form launch.',
    },
    {
      id: 'sentry',
      label: 'Sentry DSN present',
      ready: sentryReady,
      blocker: true,
      notes: 'Error monitoring required; never log full PII payloads.',
    },
    {
      id: 'legal-privacy-terms',
      label: 'Privacy & Terms legal approval',
      ready: false,
      blocker: true,
      notes:
        'Owner/counsel must approve Privacy and Terms before production (see LEGAL_REVIEW_CHECKLIST).',
    },
    {
      id: 'privacy-retention',
      label: 'Data retention policy finalized',
      ready: false,
      blocker: true,
      notes:
        'Retention for contact/estimate/photo data remains an owner/legal decision.',
    },
    {
      id: 'upload-pipeline',
      label: 'Secure estimate upload pipeline',
      ready: envPresent('BLOB_READ_WRITE_TOKEN'),
      blocker: false,
      notes:
        'Vercel Blob selected; malware scan + retention must be approved before relying on uploads in production. Delivery can proceed with metadata-only email when Blob is absent.',
    },
  ] as const;
}

export function getBlockingLaunchGates(): readonly LaunchGate[] {
  return getLaunchGates().filter((gate) => gate.blocker && !gate.ready);
}

export function canEnablePublicFormDelivery(): boolean {
  if (!isSubmissionDeliveryEnabled()) {
    return false;
  }
  const envBlockersClear = getLaunchGates()
    .filter((gate) =>
      [
        'delivery-flag',
        'resend',
        'turnstile',
        'rate-limit',
        'site-url',
      ].includes(gate.id),
    )
    .every((gate) => gate.ready);
  return envBlockersClear;
}

export function getProductionBlockers(): readonly string[] {
  return getBlockingLaunchGates().map((gate) => `${gate.label}: ${gate.notes}`);
}
