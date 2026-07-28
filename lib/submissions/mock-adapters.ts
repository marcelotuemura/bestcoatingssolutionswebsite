/**
 * Legacy mock adapters retained for isolated unit tests of the previous
 * prepare-only path. Production wiring uses Server Actions + Resend.
 */

import type {
  ContactSubmissionAdapter,
  EstimateSubmissionAdapter,
  SubmissionResult,
} from '@/lib/submissions/types';

function createReferenceId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function simulateLatency(): Promise<void> {
  const ms = process.env.NODE_ENV === 'test' ? 0 : 250;
  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockContactAdapter: ContactSubmissionAdapter = {
  async submit({ simulateFailure }): Promise<SubmissionResult> {
    await simulateLatency();
    if (simulateFailure) {
      return {
        ok: false,
        status: 'failed',
        messageKey: 'failure',
        errorCode: 'simulated',
      };
    }
    return {
      ok: true,
      status: 'delivered',
      referenceId: createReferenceId('contact'),
      messageKey: 'success',
    };
  },
};

export const mockEstimateAdapter: EstimateSubmissionAdapter = {
  async submit({ simulateFailure, attachments }): Promise<SubmissionResult> {
    await simulateLatency();
    void attachments;
    if (simulateFailure) {
      return {
        ok: false,
        status: 'failed',
        messageKey: 'failure',
        errorCode: 'simulated',
      };
    }
    return {
      ok: true,
      status: 'delivered',
      referenceId: createReferenceId('estimate'),
      messageKey: 'success',
    };
  },
};
