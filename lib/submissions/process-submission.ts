import 'server-only';
import { headers } from 'next/headers';
import { formDeliveryConfig } from '@/config/form-delivery';
import { createContactSchema } from '@/lib/forms/contact-schema';
import { createFullEstimateSchema } from '@/lib/forms/estimate-schema';
import {
  buildContactNotification,
  buildEstimateNotification,
} from '@/lib/submissions/build-notification';
import { getFormDeliveryEnv } from '@/lib/submissions/delivery-env';
import { checkFormRateLimit } from '@/lib/submissions/form-rate-limit';
import { sendInternalNotification } from '@/lib/submissions/mailer';
import type {
  EstimateAttachmentMeta,
  SubmissionResult,
} from '@/lib/submissions/types';

const serverMessages = {
  required: 'Required',
  email: 'Invalid email',
  phone: 'Invalid phone',
  messageMin: 'Message too short',
  descriptionMin: 'Description too short',
  consent: 'Consent required',
  year: 'Invalid year',
  length: 'Invalid length',
  servicesMin: 'Select a service',
} as const;

function createReferenceId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function resolveRateLimitIdentity(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
    const realIp = h.get('x-real-ip')?.trim();
    return forwarded || realIp || 'unknown';
  } catch {
    // Outside a request context (unit tests) — fall back to a stable bucket.
    return 'unknown';
  }
}

function honeypotFilled(payload: Record<string, unknown>): boolean {
  const value = payload[formDeliveryConfig.honeypotField];
  return typeof value === 'string' && value.trim().length > 0;
}

function failure(
  errorCode: NonNullable<SubmissionResult['errorCode']>,
  messageKey: SubmissionResult['messageKey'] = 'failure',
): SubmissionResult {
  return {
    ok: false,
    status: 'failed',
    messageKey,
    errorCode,
  };
}

export async function processContactSubmission(input: {
  readonly payload: Record<string, unknown>;
  readonly simulateFailure?: boolean;
  readonly sourcePath?: string;
}): Promise<SubmissionResult> {
  if (input.simulateFailure) {
    return failure('simulated');
  }
  if (honeypotFilled(input.payload)) {
    return failure('honeypot');
  }

  const identity = await resolveRateLimitIdentity();
  const limit = checkFormRateLimit(`contact:${identity}`);
  if (!limit.allowed) {
    return failure('rate_limited', 'rateLimited');
  }

  const parsed = createContactSchema(serverMessages).safeParse(input.payload);
  if (!parsed.success) {
    return failure('validation');
  }

  const env = getFormDeliveryEnv();
  if (!env.configured) {
    return failure('config', 'configError');
  }

  const submittedAt = new Date().toISOString();
  const sourcePath = input.sourcePath?.trim() || '/contact';
  const notification = buildContactNotification({
    payload: parsed.data as unknown as Record<string, unknown>,
    sourcePath,
    submittedAt,
  });

  const sent = await sendInternalNotification(notification);
  if (!sent.ok) {
    return failure(
      sent.errorCode ?? 'provider',
      sent.errorCode === 'config' ? 'configError' : 'failure',
    );
  }

  return {
    ok: true,
    status: 'delivered',
    referenceId: createReferenceId('contact'),
    messageKey: 'success',
  };
}

export async function processEstimateSubmission(input: {
  readonly payload: Record<string, unknown>;
  readonly attachments: readonly EstimateAttachmentMeta[];
  readonly simulateFailure?: boolean;
  readonly sourcePath?: string;
}): Promise<SubmissionResult> {
  if (input.simulateFailure) {
    return failure('simulated');
  }
  if (honeypotFilled(input.payload)) {
    return failure('honeypot');
  }

  const identity = await resolveRateLimitIdentity();
  const limit = checkFormRateLimit(`estimate:${identity}`);
  if (!limit.allowed) {
    return failure('rate_limited', 'rateLimited');
  }

  const parsed = createFullEstimateSchema(serverMessages).safeParse(
    input.payload,
  );
  if (!parsed.success) {
    return failure('validation');
  }

  // Attachments are metadata-only; reject suspicious executable types defensively.
  for (const file of input.attachments) {
    const lower = file.name.toLowerCase();
    if (
      lower.endsWith('.exe') ||
      lower.endsWith('.js') ||
      lower.endsWith('.html') ||
      lower.endsWith('.htm') ||
      lower.endsWith('.bat') ||
      lower.endsWith('.cmd') ||
      lower.endsWith('.sh')
    ) {
      return failure('validation');
    }
  }

  const env = getFormDeliveryEnv();
  if (!env.configured) {
    return failure('config', 'configError');
  }

  const submittedAt = new Date().toISOString();
  const sourcePath = input.sourcePath?.trim() || '/estimate-request';
  const notification = buildEstimateNotification({
    payload: parsed.data as unknown as Record<string, unknown>,
    attachments: input.attachments,
    sourcePath,
    submittedAt,
  });

  const sent = await sendInternalNotification(notification);
  if (!sent.ok) {
    return failure(
      sent.errorCode ?? 'provider',
      sent.errorCode === 'config' ? 'configError' : 'failure',
    );
  }

  return {
    ok: true,
    status: 'delivered',
    referenceId: createReferenceId('estimate'),
    messageKey: 'success',
  };
}
