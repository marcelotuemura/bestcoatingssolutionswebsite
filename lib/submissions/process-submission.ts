/**
 * Production contact/estimate submission pipeline (server-only).
 * Used by Server Actions — never import from client components.
 */

import { canEnablePublicFormDelivery } from '@/config/launch';
import { submissionMessaging } from '@/config/submission';
import { captureSafeError } from '@/lib/monitoring/safe-error';
import { checkSubmissionRateLimit } from '@/lib/security/rate-limit';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
import {
  isBlobUploadConfigured,
  uploadEstimatePhotos,
} from '@/lib/submissions/blob-upload';
import { sendResendEmail } from '@/lib/submissions/resend-delivery';
import type {
  ContactFormPayload,
  EstimateFormPayload,
  SubmissionResult,
} from '@/lib/submissions/types';

function createReferenceId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rateLimitDisabled(): boolean {
  return process.env.BCS_DISABLE_RATE_LIMIT === '1';
}

async function guardSubmission(input: {
  readonly identityKey: string;
  readonly turnstileToken?: string;
  readonly remoteIp?: string;
}): Promise<SubmissionResult | null> {
  if (!rateLimitDisabled()) {
    const rate = await checkSubmissionRateLimit(input.identityKey);
    if (!rate.allowed) {
      return {
        ok: false,
        status: 'failed',
        messageKey: 'rateLimited',
        errorCode: 'rate-limited',
      };
    }
  }

  const turnstile = await verifyTurnstileToken(
    input.turnstileToken,
    input.remoteIp,
  );
  if (!turnstile.ok) {
    return {
      ok: false,
      status: 'failed',
      messageKey: 'botCheckFailed',
      errorCode: 'bot-check-failed',
    };
  }

  return null;
}

export async function processContactSubmission(input: {
  readonly payload: ContactFormPayload;
  readonly turnstileToken?: string;
  readonly remoteIp?: string;
  readonly identityKey: string;
  readonly simulateFailure?: boolean;
}): Promise<SubmissionResult> {
  const blocked = await guardSubmission({
    identityKey: input.identityKey,
    turnstileToken: input.turnstileToken,
    remoteIp: input.remoteIp,
  });
  if (blocked) {
    return blocked;
  }

  if (input.simulateFailure) {
    return {
      ok: false,
      status: 'failed',
      messageKey: 'demoFailure',
      errorCode: 'simulated',
    };
  }

  const referenceId = createReferenceId('contact');
  const deliveryEnabled = canEnablePublicFormDelivery();

  if (deliveryEnabled) {
    try {
      const delivery = await sendResendEmail({
        subject: `BCS contact request ${referenceId}`,
        text: [
          `Reference: ${referenceId}`,
          `Name: ${input.payload.name}`,
          `Email: ${input.payload.email}`,
          `Phone: ${input.payload.phone}`,
          `Inquiry type: ${input.payload.inquiryType}`,
          `Preferred contact: ${input.payload.preferredContactMethod}`,
          '',
          'Message:',
          input.payload.message,
        ].join('\n'),
        replyTo: input.payload.email,
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
          messageKey: 'deliveryFailed',
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
        messageKey: 'deliveryFailed',
        errorCode: 'delivery-exception',
      };
    }
  }

  return {
    ok: true,
    status: 'prepared',
    referenceId,
    messageKey: 'demoSuccess',
    notice: submissionMessaging.demoSuccessNotice,
  };
}

export async function processEstimateSubmission(input: {
  readonly payload: EstimateFormPayload;
  readonly files: readonly File[];
  readonly turnstileToken?: string;
  readonly remoteIp?: string;
  readonly identityKey: string;
  readonly simulateFailure?: boolean;
}): Promise<SubmissionResult> {
  const blocked = await guardSubmission({
    identityKey: input.identityKey,
    turnstileToken: input.turnstileToken,
    remoteIp: input.remoteIp,
  });
  if (blocked) {
    return blocked;
  }

  if (input.simulateFailure) {
    return {
      ok: false,
      status: 'failed',
      messageKey: 'demoFailure',
      errorCode: 'simulated',
    };
  }

  const referenceId = createReferenceId('estimate');
  const deliveryEnabled = canEnablePublicFormDelivery();

  let uploadedCount = 0;
  let uploadUrls: readonly string[] = [];
  if (deliveryEnabled && isBlobUploadConfigured() && input.files.length > 0) {
    try {
      const uploaded = await uploadEstimatePhotos({
        referenceId,
        files: input.files,
      });
      uploadedCount = uploaded.length;
      uploadUrls = uploaded.map((item) => item.url);
    } catch (error) {
      captureSafeError(error, { area: 'estimate-upload', referenceId });
      return {
        ok: false,
        status: 'failed',
        messageKey: 'deliveryFailed',
        errorCode: 'upload-failed',
      };
    }
  }

  if (deliveryEnabled) {
    try {
      const delivery = await sendResendEmail({
        subject: `BCS estimate request ${referenceId}`,
        text: [
          `Reference: ${referenceId}`,
          `Name: ${input.payload.fullName}`,
          `Email: ${input.payload.email}`,
          `Phone: ${input.payload.phone}`,
          `Preferred contact: ${input.payload.preferredContactMethod}`,
          `Vessel: ${input.payload.manufacturer} ${input.payload.model} (${input.payload.year})`,
          `Length: ${input.payload.lengthFeet} ft`,
          `Location: ${input.payload.currentLocation}`,
          `Services: ${input.payload.services.join(', ')}`,
          `Affected area: ${input.payload.affectedArea}`,
          `Urgency: ${input.payload.urgency}`,
          `Operability: ${input.payload.operability}`,
          `Insurance related: ${input.payload.insuranceRelated}`,
          '',
          'Damage description:',
          input.payload.damageDescription,
          '',
          `Photos attached to request: ${input.files.length}`,
          `Photos stored: ${uploadedCount}${isBlobUploadConfigured() ? '' : ' (Blob not configured — metadata only)'}`,
          ...(uploadUrls.length > 0
            ? ['Photo URLs (internal):', ...uploadUrls]
            : []),
        ].join('\n'),
        replyTo: input.payload.email,
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
          messageKey: 'deliveryFailed',
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
        messageKey: 'deliveryFailed',
        errorCode: 'delivery-exception',
      };
    }
  }

  return {
    ok: true,
    status: 'prepared',
    referenceId,
    messageKey: 'demoSuccess',
    notice: submissionMessaging.demoSuccessNotice,
  };
}
