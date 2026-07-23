import { describe, expect, it } from 'vitest';
import { createContactSchema } from '@/lib/forms/contact-schema';
import {
  createEstimateConsentSchema,
  createEstimateCustomerSchema,
  createEstimateServiceSchema,
  createEstimateVesselSchema,
  createFullEstimateSchema,
  validateEstimateFiles,
} from '@/lib/forms/estimate-schema';
import {
  mockContactAdapter,
  mockEstimateAdapter,
} from '@/lib/submissions/mock-adapters';
import { getDictionarySync } from '@/i18n/get-dictionary';
import { estimateServiceOptions } from '@/config/form-options';

const messages = getDictionarySync('en').conversion.validation;
const messagesEs = getDictionarySync('es').conversion.validation;

describe('contact schema', () => {
  const schema = createContactSchema(messages);

  it('accepts a valid contact payload', () => {
    const result = schema.safeParse({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      phone: '305-747-8352',
      inquiryType: 'marine-service',
      message: 'Need gelcoat help on a 40ft yacht.',
      preferredContactMethod: 'email',
      consent: true,
    });
    expect(result.success).toBe(true);
  });

  it('requires fields and validates email/phone', () => {
    expect(schema.safeParse({}).success).toBe(false);
    expect(
      schema.safeParse({
        name: 'A',
        email: 'bad',
        phone: 'abc',
        inquiryType: 'general',
        message: 'short',
        preferredContactMethod: 'phone',
        consent: false,
      }).success,
    ).toBe(false);
  });

  it('requires consent true', () => {
    const result = schema.safeParse({
      name: 'Alex',
      email: 'alex@example.com',
      phone: '3057478352',
      inquiryType: 'general',
      message: 'Long enough message.',
      preferredContactMethod: 'either',
      consent: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('estimate schemas', () => {
  it('validates customer, vessel, services, consent', () => {
    expect(
      createEstimateCustomerSchema(messages).safeParse({
        fullName: 'Alex',
        email: 'alex@example.com',
        phone: '305-555-1212',
        preferredContactMethod: 'phone',
      }).success,
    ).toBe(true);

    expect(
      createEstimateVesselSchema(messages).safeParse({
        manufacturer: 'Maker',
        model: 'X',
        year: 2018,
        lengthFeet: 42,
        vesselName: '',
        hin: '',
        currentLocation: 'Fort Lauderdale',
        marinaName: '',
      }).success,
    ).toBe(true);

    expect(
      createEstimateVesselSchema(messages).safeParse({
        manufacturer: 'Maker',
        model: 'X',
        year: 1800,
        lengthFeet: -1,
        currentLocation: 'FL',
      }).success,
    ).toBe(false);

    expect(
      createEstimateServiceSchema(messages).safeParse({ services: [] }).success,
    ).toBe(false);
    expect(
      createEstimateServiceSchema(messages).safeParse({
        services: ['gelcoat-repair'],
      }).success,
    ).toBe(true);

    expect(
      createEstimateConsentSchema(messages).safeParse({
        acknowledgeNotQuote: true,
        acknowledgeInspection: true,
        acknowledgeNoAppointment: true,
      }).success,
    ).toBe(true);
  });

  it('allows optional HIN empty and rejects aviation services', () => {
    const full = createFullEstimateSchema(messages);
    const base = {
      fullName: 'Alex',
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
    };
    expect(full.safeParse(base).success).toBe(true);
    expect(estimateServiceOptions).not.toContain('aircraft-refinishing');
  });

  it('validates file count, size, and type', () => {
    const ok = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    expect(
      validateEstimateFiles([ok], {
        maxFiles: messages.maxFiles,
        maxSize: messages.maxSize,
        type: messages.fileType,
      }),
    ).toBeNull();

    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });
    expect(
      validateEstimateFiles([big], {
        maxFiles: messages.maxFiles,
        maxSize: messages.maxSize,
        type: messages.fileType,
      }),
    ).toBe(messages.maxSize);

    const bad = new File([new Uint8Array(10)], 'a.gif', { type: 'image/gif' });
    expect(
      validateEstimateFiles([bad], {
        maxFiles: messages.maxFiles,
        maxSize: messages.maxSize,
        type: messages.fileType,
      }),
    ).toBe(messages.fileType);

    const many = Array.from(
      { length: 9 },
      (_, i) =>
        new File([new Uint8Array(10)], `${i}.jpg`, { type: 'image/jpeg' }),
    );
    expect(
      validateEstimateFiles(many, {
        maxFiles: messages.maxFiles,
        maxSize: messages.maxSize,
        type: messages.fileType,
      }),
    ).toBe(messages.maxFiles);
  });
});

describe('submission adapters', () => {
  it('simulates success and failure without persistence', async () => {
    const ok = await mockContactAdapter.submit({
      payload: { name: 'Alex' },
      simulateFailure: false,
    });
    expect(ok.ok).toBe(true);
    expect(ok.status).toBe('prepared');
    expect(ok.messageKey).toBe('demoSuccess');

    const fail = await mockEstimateAdapter.submit({
      payload: {},
      attachments: [],
      simulateFailure: true,
    });
    expect(fail.ok).toBe(false);
    expect(fail.errorCode).toBe('simulated');
  });
});

describe('localized validation messages', () => {
  it('provides EN and ES validation strings', () => {
    expect(messages.required.length).toBeGreaterThan(0);
    expect(messagesEs.required.length).toBeGreaterThan(0);
    expect(messages.email).not.toEqual(messagesEs.email);
  });
});
