/**
 * Legacy client-facing adapter facades — prefer Server Actions.
 * Unit tests may call these; they delegate to the production pipeline.
 */

import {
  processContactSubmission,
  processEstimateSubmission,
} from '@/lib/submissions/process-submission';
import type {
  ContactFormPayload,
  ContactSubmissionAdapter,
  EstimateFormPayload,
  EstimateSubmissionAdapter,
} from '@/lib/submissions/types';

export const mockContactAdapter: ContactSubmissionAdapter = {
  async submit({
    simulateFailure,
    payload,
    turnstileToken,
    remoteIp,
    identityKey,
  }) {
    return processContactSubmission({
      payload: payload as ContactFormPayload,
      turnstileToken,
      remoteIp,
      identityKey: identityKey ?? 'contact:anonymous',
      simulateFailure,
    });
  },
};

export const mockEstimateAdapter: EstimateSubmissionAdapter = {
  async submit({
    simulateFailure,
    payload,
    turnstileToken,
    remoteIp,
    identityKey,
  }) {
    return processEstimateSubmission({
      payload: payload as EstimateFormPayload,
      files: [],
      turnstileToken,
      remoteIp,
      identityKey: identityKey ?? 'estimate:anonymous',
      simulateFailure,
    });
  },
};
