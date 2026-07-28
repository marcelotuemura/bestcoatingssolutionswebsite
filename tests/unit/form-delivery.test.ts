import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createContactSchema } from '@/lib/forms/contact-schema';
import { createFullEstimateSchema } from '@/lib/forms/estimate-schema';
import { escapeHtml } from '@/lib/submissions/escape-html';
import {
  buildContactNotification,
  buildEstimateNotification,
} from '@/lib/submissions/build-notification';
import {
  __resetFormRateLimitForTests,
  checkFormRateLimit,
} from '@/lib/submissions/form-rate-limit';
import {
  __setMailTransportForTests,
  type OutboundEmail,
} from '@/lib/submissions/mailer';
import {
  processContactSubmission,
  processEstimateSubmission,
} from '@/lib/submissions/process-submission';
import { getDictionarySync } from '@/i18n/get-dictionary';

vi.mock('next/headers', () => ({
  headers: async () =>
    new Headers({
      'x-forwarded-for': '203.0.113.10',
    }),
}));

const messages = getDictionarySync('en').conversion.validation;

const validContact = {
  name: 'Alex Rivera',
  email: 'alex@example.com',
  phone: '305-747-8352',
  inquiryType: 'marine-service' as const,
  message: 'Need gelcoat help on a 40ft yacht.',
  preferredContactMethod: 'email' as const,
  consent: true,
  companyUrl: '',
};

const validEstimate = {
  fullName: 'Alex Rivera',
  email: 'alex@example.com',
  phone: '305-555-1212',
  preferredContactMethod: 'either' as const,
  manufacturer: 'Maker',
  model: 'X',
  year: 2020,
  lengthFeet: 35,
  vesselName: '',
  hin: '',
  currentLocation: 'Miami',
  marinaName: '',
  services: ['gelcoat-repair'] as const,
  damageDescription:
    'Crack along the starboard gelcoat near the swim platform.',
  affectedArea: 'small' as const,
  damageOccurred: '',
  operability: 'fully-operational' as const,
  insuranceRelated: 'no' as const,
  urgency: 'flexible' as const,
  acknowledgeNotQuote: true,
  acknowledgeInspection: true,
  acknowledgeNoAppointment: true,
  companyUrl: '',
};

describe('form delivery validation', () => {
  it('rejects missing required fields and invalid email', () => {
    const schema = createContactSchema(messages);
    expect(schema.safeParse({}).success).toBe(false);
    expect(
      schema.safeParse({ ...validContact, email: 'not-an-email' }).success,
    ).toBe(false);
  });

  it('rejects oversized message input', () => {
    const schema = createContactSchema(messages);
    expect(
      schema.safeParse({
        ...validContact,
        message: 'x'.repeat(4001),
      }).success,
    ).toBe(false);
  });

  it('accepts a full estimate payload', () => {
    expect(
      createFullEstimateSchema(messages).safeParse(validEstimate).success,
    ).toBe(true);
  });
});

describe('form delivery processor', () => {
  const sent: OutboundEmail[] = [];

  beforeEach(() => {
    sent.length = 0;
    __resetFormRateLimitForTests();
    process.env.FORM_DELIVERY_MODE = 'live';
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.CONTACT_FROM_EMAIL = 'BCS <forms@example.com>';
    process.env.CONTACT_TO_EMAIL = 'inbox@example.com';
    __setMailTransportForTests(async (email) => {
      sent.push(email);
      return { ok: true, id: 'test-id' };
    });
  });

  afterEach(() => {
    __setMailTransportForTests(null);
    delete process.env.FORM_DELIVERY_MODE;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_FROM_EMAIL;
    delete process.env.CONTACT_TO_EMAIL;
  });

  it('delivers a successful contact notification with reply-to', async () => {
    const result = await processContactSubmission({
      payload: validContact,
      sourcePath: '/en/contact',
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('delivered');
    expect(result.messageKey).toBe('success');
    expect(sent).toHaveLength(1);
    expect(sent[0]?.replyTo).toBe('alex@example.com');
    expect(sent[0]?.subject).toContain('Alex Rivera');
    expect(sent[0]?.text).toContain('/en/contact');
  });

  it('rejects honeypot submissions', async () => {
    const result = await processContactSubmission({
      payload: { ...validContact, companyUrl: 'https://spam.example' },
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('honeypot');
    expect(sent).toHaveLength(0);
  });

  it('rejects invalid payloads server-side', async () => {
    const result = await processContactSubmission({
      payload: { ...validContact, email: 'bad' },
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('validation');
    expect(sent).toHaveLength(0);
  });

  it('returns config error when environment variables are missing', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_FROM_EMAIL;
    delete process.env.CONTACT_TO_EMAIL;
    process.env.FORM_DELIVERY_MODE = 'live';

    const result = await processContactSubmission({ payload: validContact });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('config');
    expect(result.messageKey).toBe('configError');
  });

  it('handles provider failure safely', async () => {
    __setMailTransportForTests(async () => ({
      ok: false,
      errorCode: 'provider',
    }));
    const result = await processEstimateSubmission({
      payload: validEstimate,
      attachments: [{ name: 'hull.jpg', size: 1200, type: 'image/jpeg' }],
      sourcePath: '/en/estimate-request',
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('provider');
    expect(result.messageKey).toBe('failure');
  });

  it('delivers estimate notifications and notes local-only photos', async () => {
    const result = await processEstimateSubmission({
      payload: validEstimate,
      attachments: [{ name: 'hull.jpg', size: 1200, type: 'image/jpeg' }],
      sourcePath: '/en/estimate-request',
    });
    expect(result.ok).toBe(true);
    expect(sent[0]?.subject).toMatch(/estimate request/i);
    expect(sent[0]?.text).toMatch(/not uploaded/i);
    expect(sent[0]?.text).toContain('hull.jpg');
  });

  it('rejects executable attachment names', async () => {
    const result = await processEstimateSubmission({
      payload: validEstimate,
      attachments: [
        { name: 'payload.exe', size: 10, type: 'application/octet-stream' },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('validation');
  });

  it('rate limits repeated submissions', () => {
    for (let i = 0; i < 8; i += 1) {
      expect(checkFormRateLimit('contact:203.0.113.10').allowed).toBe(true);
    }
    expect(checkFormRateLimit('contact:203.0.113.10').allowed).toBe(false);
  });
});

describe('notification escaping', () => {
  it('escapes HTML in user-provided content', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
    const built = buildContactNotification({
      payload: {
        ...validContact,
        name: '<b>Alex</b>',
        message: 'Hello <img src=x onerror=alert(1)>',
      },
      sourcePath: '/en/contact',
      submittedAt: '2026-07-26T00:00:00.000Z',
    });
    expect(built.html).not.toContain('<script>');
    expect(built.html).toContain('&lt;b&gt;Alex&lt;/b&gt;');
    const estimate = buildEstimateNotification({
      payload: validEstimate,
      attachments: [],
      sourcePath: '/en/estimate-request',
      submittedAt: '2026-07-26T00:00:00.000Z',
    });
    expect(estimate.subject).toContain('Alex Rivera');
  });
});
