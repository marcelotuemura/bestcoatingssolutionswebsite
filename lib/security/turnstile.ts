/**
 * Cloudflare Turnstile verification seam.
 * When secrets are absent, verification is skipped only in demo mode.
 */

import { isDemoSubmissionMode } from '@/config/launch';

export interface TurnstileVerificationResult {
  readonly ok: boolean;
  readonly skipped: boolean;
  readonly errorCodes?: readonly string[];
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() &&
    process.env.TURNSTILE_SECRET_KEY?.trim(),
  );
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileVerificationResult> {
  if (!isTurnstileConfigured()) {
    if (isDemoSubmissionMode()) {
      return { ok: true, skipped: true };
    }
    return {
      ok: false,
      skipped: false,
      errorCodes: ['turnstile-not-configured'],
    };
  }

  if (!token || token.trim().length === 0) {
    return { ok: false, skipped: false, errorCodes: ['missing-token'] };
  }

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
  });
  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return { ok: false, skipped: false, errorCodes: ['verify-http-error'] };
  }

  const json = (await response.json()) as {
    success?: boolean;
    'error-codes'?: string[];
  };

  return {
    ok: Boolean(json.success),
    skipped: false,
    errorCodes: json['error-codes'],
  };
}
