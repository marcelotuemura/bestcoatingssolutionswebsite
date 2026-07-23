import { z } from 'zod';
import { estimateUploadPolicy } from '@/config/estimate-upload';
import {
  affectedAreaOptions,
  estimateServiceOptions,
  preferredContactMethods,
  urgencyOptions,
  vesselOperabilityOptions,
} from '@/config/form-options';

const currentYear = new Date().getFullYear();

export function createEstimateCustomerSchema(messages: {
  readonly required: string;
  readonly email: string;
  readonly phone: string;
}) {
  return z.object({
    fullName: z.string().trim().min(1, messages.required).max(120),
    email: z.string().trim().email(messages.email).max(200),
    phone: z
      .string()
      .trim()
      .min(7, messages.phone)
      .max(40)
      .regex(/^[\d\s()+.-]+$/, messages.phone),
    preferredContactMethod: z.enum(preferredContactMethods, {
      errorMap: () => ({ message: messages.required }),
    }),
  });
}

export function createEstimateVesselSchema(messages: {
  readonly required: string;
  readonly year: string;
  readonly length: string;
}) {
  return z.object({
    manufacturer: z.string().trim().min(1, messages.required).max(120),
    model: z.string().trim().min(1, messages.required).max(120),
    year: z.coerce
      .number({ invalid_type_error: messages.year })
      .int(messages.year)
      .min(1950, messages.year)
      .max(currentYear + 1, messages.year),
    lengthFeet: z.coerce
      .number({ invalid_type_error: messages.length })
      .positive(messages.length)
      .max(500, messages.length),
    vesselName: z.string().trim().max(120).optional().or(z.literal('')),
    hin: z.string().trim().max(30).optional().or(z.literal('')),
    currentLocation: z.string().trim().min(1, messages.required).max(200),
    marinaName: z.string().trim().max(160).optional().or(z.literal('')),
  });
}

export function createEstimateServiceSchema(messages: {
  readonly servicesMin: string;
}) {
  const serviceEnum = z.enum(
    estimateServiceOptions as unknown as [string, ...string[]],
  );
  return z.object({
    services: z.array(serviceEnum).min(1, messages.servicesMin),
  });
}

export function createEstimateDamageSchema(messages: {
  readonly required: string;
  readonly descriptionMin: string;
}) {
  return z.object({
    damageDescription: z
      .string()
      .trim()
      .min(20, messages.descriptionMin)
      .max(5000),
    affectedArea: z.enum(affectedAreaOptions, {
      errorMap: () => ({ message: messages.required }),
    }),
    damageOccurred: z.string().trim().max(120).optional().or(z.literal('')),
    operability: z.enum(vesselOperabilityOptions, {
      errorMap: () => ({ message: messages.required }),
    }),
    insuranceRelated: z.enum(['yes', 'no', 'unsure'], {
      errorMap: () => ({ message: messages.required }),
    }),
    urgency: z.enum(urgencyOptions, {
      errorMap: () => ({ message: messages.required }),
    }),
  });
}

export function createEstimateConsentSchema(messages: {
  readonly consent: string;
}) {
  const requiredConsent = z.boolean().refine((value) => value === true, {
    message: messages.consent,
  });
  return z.object({
    acknowledgeNotQuote: requiredConsent,
    acknowledgeInspection: requiredConsent,
    acknowledgeNoAppointment: requiredConsent,
  });
}

export function createFullEstimateSchema(messages: {
  readonly required: string;
  readonly email: string;
  readonly phone: string;
  readonly year: string;
  readonly length: string;
  readonly servicesMin: string;
  readonly descriptionMin: string;
  readonly consent: string;
}) {
  return createEstimateCustomerSchema(messages)
    .merge(createEstimateVesselSchema(messages))
    .merge(createEstimateServiceSchema(messages))
    .merge(createEstimateDamageSchema(messages))
    .merge(createEstimateConsentSchema(messages));
}

export type EstimateFormValues = z.infer<
  ReturnType<typeof createFullEstimateSchema>
>;

export function validateEstimateFiles(
  files: readonly File[],
  messages: {
    readonly maxFiles: string;
    readonly maxSize: string;
    readonly type: string;
  },
): string | null {
  if (files.length > estimateUploadPolicy.maxFiles) {
    return messages.maxFiles;
  }
  for (const file of files) {
    if (file.size > estimateUploadPolicy.maxFileSizeBytes) {
      return messages.maxSize;
    }
    const mimeOk = (
      estimateUploadPolicy.acceptedMimeTypes as readonly string[]
    ).includes(file.type);
    const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    const extOk = estimateUploadPolicy.acceptedExtensions.includes(
      ext as (typeof estimateUploadPolicy.acceptedExtensions)[number],
    );
    if (!mimeOk && !extOk) {
      return messages.type;
    }
  }
  return null;
}
