import { submissionMessaging } from '@/config/submission';
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

/**
 * Temporary contact adapter — does not deliver messages.
 * PRODUCTION BLOCKER: replace with real email/CRM delivery before launch.
 */
export const mockContactAdapter: ContactSubmissionAdapter = {
  async submit({ simulateFailure }): Promise<SubmissionResult> {
    await simulateLatency();
    if (simulateFailure) {
      return {
        ok: false,
        status: 'failed',
        messageKey: 'demoFailure',
        errorCode: 'simulated',
      };
    }
    return {
      ok: true,
      status: 'prepared',
      referenceId: createReferenceId('contact'),
      messageKey: 'demoSuccess',
    };
  },
};

/**
 * Temporary estimate adapter — does not deliver or store files.
 * PRODUCTION BLOCKER: replace with secure upload + CRM/email before launch.
 */
export const mockEstimateAdapter: EstimateSubmissionAdapter = {
  async submit({ simulateFailure, attachments }): Promise<SubmissionResult> {
    await simulateLatency();
    // Intentionally ignore attachment binary content — metadata only for demos.
    void attachments;
    if (simulateFailure) {
      return {
        ok: false,
        status: 'failed',
        messageKey: 'demoFailure',
        errorCode: 'simulated',
      };
    }
    return {
      ok: true,
      status: 'prepared',
      referenceId: createReferenceId('estimate'),
      messageKey: 'demoSuccess',
    };
  },
};

export function getDemoSuccessNotice(): string {
  return submissionMessaging.demoSuccessNotice;
}
