import 'server-only';
import { Resend } from 'resend';
import { getFormDeliveryEnv } from '@/lib/submissions/delivery-env';

export interface OutboundEmail {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
  readonly replyTo?: string;
}

export interface MailSendResult {
  readonly ok: boolean;
  readonly id?: string;
  readonly errorCode?: 'config' | 'provider' | 'unknown';
}

export type MailTransport = (email: OutboundEmail) => Promise<MailSendResult>;

let testTransport: MailTransport | null = null;

/** Test-only override — never call from production UI code. */
export function __setMailTransportForTests(
  transport: MailTransport | null,
): void {
  testTransport = transport;
}

async function resendTransport(email: OutboundEmail): Promise<MailSendResult> {
  const env = getFormDeliveryEnv();
  if (!env.resendApiKey || !env.fromEmail || !env.toEmail) {
    return { ok: false, errorCode: 'config' };
  }

  try {
    const resend = new Resend(env.resendApiKey);
    const { data, error } = await resend.emails.send({
      from: env.fromEmail,
      to: [env.toEmail],
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: email.replyTo,
    });

    if (error) {
      return { ok: false, errorCode: 'provider' };
    }
    return { ok: true, id: data?.id };
  } catch {
    return { ok: false, errorCode: 'provider' };
  }
}

async function mockTransport(email: OutboundEmail): Promise<MailSendResult> {
  void email;
  return { ok: true, id: `mock-${Date.now().toString(36)}` };
}

export async function sendInternalNotification(
  email: OutboundEmail,
): Promise<MailSendResult> {
  if (testTransport) {
    return testTransport(email);
  }

  const env = getFormDeliveryEnv();
  if (env.mode === 'mock') {
    return mockTransport(email);
  }
  if (!env.configured) {
    return { ok: false, errorCode: 'config' };
  }
  return resendTransport(email);
}
