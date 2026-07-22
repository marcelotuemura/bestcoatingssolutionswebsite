import { z } from 'zod';
import {
  contactInquiryTypes,
  preferredContactMethods,
} from '@/config/form-options';

export function createContactSchema(messages: {
  readonly required: string;
  readonly email: string;
  readonly phone: string;
  readonly messageMin: string;
  readonly consent: string;
}) {
  return z.object({
    name: z.string().trim().min(1, messages.required).max(120),
    email: z.string().trim().email(messages.email).max(200),
    phone: z
      .string()
      .trim()
      .min(7, messages.phone)
      .max(40)
      .regex(/^[\d\s()+.-]+$/, messages.phone),
    inquiryType: z.enum(contactInquiryTypes, {
      errorMap: () => ({ message: messages.required }),
    }),
    message: z.string().trim().min(10, messages.messageMin).max(4000),
    preferredContactMethod: z.enum(preferredContactMethods, {
      errorMap: () => ({ message: messages.required }),
    }),
    consent: z.boolean().refine((value) => value === true, {
      message: messages.consent,
    }),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
