import { canEnablePublicFormDelivery } from '@/config/launch';
import { submissionMessaging } from '@/config/submission';
import { captureSafeError } from '@/lib/monitoring/safe-error';
import { checkSubmissionRateLimit } from '@/lib/security/rate-limit';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
import { sendResendEmail } from '@/lib/submissions/resend-delivery';
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

async function guardSubmission(input: {
  readonly identityKey: string;
  readonly turnstileToken?: string;
  readonly remoteIp?: string;
}): Promise<SubmissionResult | null> {
  const rate = await checkSubmissionRateLimit(input.identityKey);
  if (!rate.allowed) {
    return {
      ok: false,
      status: 'failed',
      messageKey: 'demoFailure',
      errorCode: 'rate-limited',
    };
  }

  const turnstile = await verifyTurnstileToken(
    input.turnstileToken,
    input.remoteIp,
  );
  if (!turnstile.ok) {
    return {
      ok: false,
      status: 'failed',
      messageKey: 'demoFailure',
      errorCode: 'bot-check-failed',
    };
  }

  return null;
}

/**
 * Contact adapter — demo by default; Resend only when launch gates allow.
 * PRODUCTION BLOCKER until delivery flag + credentials + legal gates clear.
 */
export const mockContactAdapter: ContactSubmissionAdapter = {
  async submit({
    simulateFailure,
    payload,
    turnstileToken,
    remoteIp,
    identityKey,
  }): Promise<SubmissionResult> {
    await simulateLatency();
    const blocked = await guardSubmission({
      identityKey: identityKey ?? 'contact:anonymous',
      turnstileToken,
      remoteIp,
    });
    if (blocked) {
      return blocked;
    }
    if (simulateFailure) {
      return {
        ok: false,
        status: 'failed',
        messageKey: 'demoFailure',
        errorCode: 'simulated',
      };
    }

    const referenceId = createReferenceId('contact');

    if (canEnablePublicFormDelivery()) {
      try {
        const delivery = await sendResendEmail({
          subject: `BCS contact request ${referenceId}`,
          text: [
            `Reference: ${referenceId}`,
            `Name: ${payload?.name ?? '(provided)'}`,
            `Email: ${payload?.email ?? '(provided)'}`,
            `Phone: ${payload?.phone ?? '(optional)'}`,
            `Message length: ${payload?.message?.length ?? 0} characters`,
            'Message body intentionally omitted from this architecture log path when using monitoring; email body includes owner-facing summary only.',
          ].join('\n'),
          replyTo: payload?.email,
        });
        if (!delivery.ok) {
          captureSafeError(new Error(delivery.error ?? 'resend-failed'), {
            area: 'contact-delivery',
            referenceId,
            code: delivery.error,
          });
          return {
            ok: false,
            status: 'failed',
            messageKey: 'demoFailure',
            errorCode: delivery.error ?? 'delivery-failed',
          };
        }
        return {
          ok: true,
          status: 'delivered',
          referenceId,
          messageKey: 'deliveredSuccess',
        };
      } catch (error) {
        captureSafeError(error, { area: 'contact-delivery', referenceId });
        return {
          ok: false,
          status: 'failed',
          messageKey: 'demoFailure',
          errorCode: 'delivery-exception',
        };
      }
    }

    return {
      ok: true,
      status: 'prepared',
      referenceId,
      messageKey: 'demoSuccess',
    };
  },
};

/**
 * Estimate adapter — demo by default; does not store files until upload pipeline is approved.
 * PRODUCTION BLOCKER: secure upload + malware scan + retention before enabling binaries.
 */
export const mockEstimateAdapter: EstimateSubmissionAdapter = {
  async submit({
    simulateFailure,
    attachments,
    turnstileToken,
    remoteIp,
    identityKey,
    summary,
  }): Promise<SubmissionResult> {
    await simulateLatency();
    const blocked = await guardSubmission({
      identityKey: identityKey ?? 'estimate:anonymous',
      turnstileToken,
      remoteIp,
    });
    if (blocked) {
      return blocked;
    }
    // Intentionally ignore attachment binary content until upload pipeline is live.
    void attachments;
    if (simulateFailure) {
      return {
        ok: false,
        status: 'failed',
        messageKey: 'demoFailure',
        errorCode: 'simulated',
      };
    }

    const referenceId = createReferenceId('estimate');

    if (canEnablePublicFormDelivery()) {
      try {
        const delivery = await sendResendEmail({
          subject: `BCS estimate request ${referenceId}`,
          text: [
            `Reference: ${referenceId}`,
            `Service interest: ${summary?.serviceInterest ?? '(provided)'}`,
            `Attachment count: ${attachments?.length ?? 0}`,
            'Photo binaries are not uploaded in Phase 6 readiness mode.',
          ].join('\n'),
          replyTo: summary?.email,
        });
        if (!delivery.ok) {
          captureSafeError(new Error(delivery.error ?? 'resend-failed'), {
            area: 'estimate-delivery',
            referenceId,
            code: delivery.error,
          });
          return {
            ok: false,
            status: 'failed',
            messageKey: 'demoFailure',
            errorCode: delivery.error ?? 'delivery-failed',
          };
        }
        return {
          ok: true,
          status: 'delivered',
          referenceId,
          messageKey: 'deliveredSuccess',
        };
      } catch (error) {
        captureSafeError(error, { area: 'estimate-delivery', referenceId });
        return {
          ok: false,
          status: 'failed',
          messageKey: 'demoFailure',
          errorCode: 'delivery-exception',
        };
      }
    }

    return {
      ok: true,
      status: 'prepared',
      referenceId,
      messageKey: 'demoSuccess',
    };
  },
};

export function getDemoSuccessNotice(): string {
  return submissionMessaging.demoSuccessNotice;
}
