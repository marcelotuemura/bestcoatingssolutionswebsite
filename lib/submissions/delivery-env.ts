import 'server-only';

export type FormDeliveryMode = 'live' | 'mock';

export interface FormDeliveryEnv {
  readonly mode: FormDeliveryMode;
  readonly resendApiKey: string | null;
  readonly fromEmail: string | null;
  readonly toEmail: string | null;
  readonly siteUrl: string;
  readonly configured: boolean;
}

function readMode(): FormDeliveryMode {
  const raw = (process.env.FORM_DELIVERY_MODE ?? '').trim().toLowerCase();
  if (raw === 'mock') return 'mock';
  return 'live';
}

/**
 * Resolve server-only delivery settings.
 * Never import this module from client components.
 */
export function getFormDeliveryEnv(): FormDeliveryEnv {
  const mode = readMode();
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() || null;
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || null;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    'https://bestcoatingssolutions.com';

  const configured =
    mode === 'mock' || Boolean(resendApiKey && fromEmail && toEmail);

  return {
    mode,
    resendApiKey,
    fromEmail,
    toEmail,
    siteUrl,
    configured,
  };
}
