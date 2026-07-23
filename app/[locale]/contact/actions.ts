'use server';

import { createContactSchema } from '@/lib/forms/contact-schema';
import { getDictionarySync } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { processContactSubmission } from '@/lib/submissions/process-submission';
import {
  getRequestIp,
  getSubmissionIdentityKey,
} from '@/lib/submissions/request-context';
import type {
  ContactFormPayload,
  SubmissionResult,
} from '@/lib/submissions/types';

export async function submitContactAction(input: {
  readonly locale: string;
  readonly values: ContactFormPayload;
  readonly turnstileToken?: string;
  readonly simulateFailure?: boolean;
}): Promise<SubmissionResult> {
  if (!isLocale(input.locale)) {
    return {
      ok: false,
      status: 'failed',
      messageKey: 'validationFailed',
      errorCode: 'invalid-locale',
    };
  }
  const locale = input.locale as Locale;
  const messages = getDictionarySync(locale).conversion.validation;
  const parsed = createContactSchema(messages).safeParse(input.values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      ok: false,
      status: 'failed',
      messageKey: 'validationFailed',
      errorCode: 'validation',
      fieldErrors,
    };
  }

  const remoteIp = await getRequestIp();
  const identityKey = await getSubmissionIdentityKey('contact');

  return processContactSubmission({
    payload: parsed.data,
    turnstileToken: input.turnstileToken,
    remoteIp,
    identityKey,
    simulateFailure: input.simulateFailure,
  });
}
