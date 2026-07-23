/**
 * Optional Resend delivery via REST (no SDK dependency).
 * Only used when SUBMISSION_DELIVERY_ENABLED=true and RESEND_API_KEY is set.
 */

export interface ResendEmailInput {
  readonly subject: string;
  /** Already-sanitized plain text body — never include unnecessary PII dumps. */
  readonly text: string;
  readonly replyTo?: string;
}

export interface ResendDeliveryResult {
  readonly ok: boolean;
  readonly id?: string;
  readonly error?: string;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendResendEmail(
  input: ResendEmailInput,
): Promise<ResendDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to =
    process.env.BCS_SUBMISSION_TO_EMAIL?.trim() ||
    'info@bestcoatingssolutions.com';
  const from =
    process.env.BCS_SUBMISSION_FROM_EMAIL?.trim() ||
    'Best Coatings Solutions <onboarding@resend.dev>';

  if (!apiKey) {
    return { ok: false, error: 'resend-not-configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: input.subject,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ok: false, error: `resend-http-${response.status}` };
  }

  const json = (await response.json()) as { id?: string };
  return { ok: true, id: json.id };
}
