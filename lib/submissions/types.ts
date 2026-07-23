import type { ContactFormValues } from '@/lib/forms/contact-schema';
import type { EstimateFormValues } from '@/lib/forms/estimate-schema';

export type SubmissionStatus = 'prepared' | 'delivered' | 'failed';

export type SubmissionMessageKey =
  | 'demoSuccess'
  | 'demoFailure'
  | 'deliveredSuccess'
  | 'deliveryFailed'
  | 'rateLimited'
  | 'botCheckFailed'
  | 'validationFailed';

export interface SubmissionResult {
  readonly ok: boolean;
  readonly status: SubmissionStatus;
  /** Opaque reference for UI — never includes PII. */
  readonly referenceId?: string;
  readonly messageKey: SubmissionMessageKey;
  readonly errorCode?: string;
  readonly notice?: string;
  /** Field-level validation errors from server Zod revalidation. */
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

export interface EstimateAttachmentMeta {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export interface EstimateAttachment extends EstimateAttachmentMeta {
  readonly file: File;
}

export type ContactFormPayload = ContactFormValues;
export type EstimateFormPayload = EstimateFormValues;

/** @deprecated Client adapters — use Server Actions + process-submission. */
export interface ContactSubmissionAdapter {
  submit(input: {
    readonly payload: Record<string, unknown> & Partial<ContactFormPayload>;
    readonly simulateFailure?: boolean;
    readonly turnstileToken?: string;
    readonly remoteIp?: string;
    readonly identityKey?: string;
  }): Promise<SubmissionResult>;
}

/** @deprecated Client adapters — use Server Actions + process-submission. */
export interface EstimateSubmissionAdapter {
  submit(input: {
    readonly payload: Record<string, unknown>;
    readonly attachments: readonly EstimateAttachmentMeta[];
    readonly simulateFailure?: boolean;
    readonly turnstileToken?: string;
    readonly remoteIp?: string;
    readonly identityKey?: string;
    readonly summary?: {
      readonly email?: string;
      readonly serviceInterest?: string;
    };
  }): Promise<SubmissionResult>;
}
