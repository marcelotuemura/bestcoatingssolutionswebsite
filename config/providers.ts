/**
 * Selected production providers for the public marketing website launch.
 *
 * These are architecture decisions for Phase 6 readiness. Live credentials are
 * not required in this repo. Delivery remains gated until env flags + secrets
 * are configured in Vercel and owner/legal blockers are cleared.
 *
 * Explicitly NOT selected for this launch (see FUTURE.md):
 * Supabase, Stripe, Twilio SMS, Google Maps SDK, CRM platforms, portal auth.
 */

export type ProviderStatus =
  'selected' | 'wired-optional' | 'pending-credentials' | 'deferred';

export interface ProviderSelection {
  readonly id: string;
  readonly category:
    | 'hosting'
    | 'email'
    | 'bot-protection'
    | 'rate-limiting'
    | 'analytics'
    | 'error-monitoring'
    | 'uploads'
    | 'deferred';
  readonly name: string;
  readonly status: ProviderStatus;
  readonly rationale: string;
  readonly envKeys: readonly string[];
  readonly launchRequired: boolean;
}

export const providerSelections: readonly ProviderSelection[] = [
  {
    id: 'vercel-hosting',
    category: 'hosting',
    name: 'Vercel',
    status: 'selected',
    rationale:
      'First-class Next.js App Router hosting, preview deployments, and documented CD path.',
    envKeys: ['NEXT_PUBLIC_SITE_URL'],
    launchRequired: true,
  },
  {
    id: 'resend-email',
    category: 'email',
    name: 'Resend',
    status: 'pending-credentials',
    rationale:
      'Lightweight transactional email adapter for contact/estimate notifications to BCS inbox. Env seam already reserved. No CRM duplicate.',
    envKeys: [
      'RESEND_API_KEY',
      'BCS_SUBMISSION_TO_EMAIL',
      'BCS_SUBMISSION_FROM_EMAIL',
    ],
    launchRequired: true,
  },
  {
    id: 'cloudflare-turnstile',
    category: 'bot-protection',
    name: 'Cloudflare Turnstile',
    status: 'pending-credentials',
    rationale:
      'Privacy-friendly bot protection for public forms without heavy reCAPTCHA friction.',
    envKeys: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'],
    launchRequired: true,
  },
  {
    id: 'upstash-rate-limit',
    category: 'rate-limiting',
    name: 'Upstash Redis',
    status: 'pending-credentials',
    rationale:
      'Server-side rate limiting for form submission endpoints on Vercel.',
    envKeys: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    launchRequired: true,
  },
  {
    id: 'vercel-analytics',
    category: 'analytics',
    name: 'Vercel Analytics',
    status: 'wired-optional',
    rationale:
      'Already mounted in locale layout. Lightweight page analytics without a tag manager. Do not send form field contents.',
    envKeys: [],
    launchRequired: false,
  },
  {
    id: 'sentry-monitoring',
    category: 'error-monitoring',
    name: 'Sentry',
    status: 'pending-credentials',
    rationale:
      'Error monitoring without logging full PII payloads. Optional until DSN is configured.',
    envKeys: ['SENTRY_DSN', 'NEXT_PUBLIC_SENTRY_DSN'],
    launchRequired: true,
  },
  {
    id: 'vercel-blob-uploads',
    category: 'uploads',
    name: 'Vercel Blob',
    status: 'pending-credentials',
    rationale:
      'Secure estimate photo storage with retention controls. Not enabled until upload pipeline + malware scan policy are approved.',
    envKeys: ['BLOB_READ_WRITE_TOKEN'],
    launchRequired: false,
  },
  {
    id: 'supabase',
    category: 'deferred',
    name: 'Supabase',
    status: 'deferred',
    rationale: 'Deferred — portal/auth/database are out of Phase 6 scope.',
    envKeys: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ],
    launchRequired: false,
  },
  {
    id: 'stripe',
    category: 'deferred',
    name: 'Stripe',
    status: 'deferred',
    rationale:
      'Deferred — payments and portal checkout are out of Phase 6 scope.',
    envKeys: [
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ],
    launchRequired: false,
  },
] as const;

export function getLaunchRequiredProviders(): readonly ProviderSelection[] {
  return providerSelections.filter((provider) => provider.launchRequired);
}

export function getSelectedProviders(): readonly ProviderSelection[] {
  return providerSelections.filter(
    (provider) =>
      provider.status === 'selected' ||
      provider.status === 'wired-optional' ||
      provider.status === 'pending-credentials',
  );
}

export function getDeferredProviders(): readonly ProviderSelection[] {
  return providerSelections.filter(
    (provider) => provider.status === 'deferred',
  );
}
