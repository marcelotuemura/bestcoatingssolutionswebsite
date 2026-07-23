'use server';

import {
  createFullEstimateSchema,
  validateEstimateFiles,
} from '@/lib/forms/estimate-schema';
import { getDictionarySync } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { processEstimateSubmission } from '@/lib/submissions/process-submission';
import {
  getRequestIp,
  getSubmissionIdentityKey,
} from '@/lib/submissions/request-context';
import type {
  EstimateFormPayload,
  SubmissionResult,
} from '@/lib/submissions/types';

export async function submitEstimateAction(input: {
  readonly locale: string;
  readonly values: EstimateFormPayload;
  readonly turnstileToken?: string;
  readonly simulateFailure?: boolean;
  readonly photos?: readonly File[];
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
  const parsed = createFullEstimateSchema(messages).safeParse(input.values);
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

  const files = input.photos ?? [];
  const fileError = validateEstimateFiles(files, messages);
  if (fileError) {
    return {
      ok: false,
      status: 'failed',
      messageKey: 'validationFailed',
      errorCode: 'validation',
      fieldErrors: { photos: fileError },
    };
  }

  const remoteIp = await getRequestIp();
  const identityKey = await getSubmissionIdentityKey('estimate');

  return processEstimateSubmission({
    payload: parsed.data,
    files,
    turnstileToken: input.turnstileToken,
    remoteIp,
    identityKey,
    simulateFailure: input.simulateFailure,
  });
}
