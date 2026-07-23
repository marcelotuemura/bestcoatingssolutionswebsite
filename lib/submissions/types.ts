export type SubmissionStatus = 'prepared' | 'delivered' | 'failed';

export interface SubmissionResult {
  readonly ok: boolean;
  readonly status: SubmissionStatus;
  /** Opaque reference for UI — never includes PII. */
  readonly referenceId?: string;
  readonly messageKey: 'demoSuccess' | 'demoFailure' | 'deliveredSuccess';
  readonly errorCode?:
    | 'simulated'
    | 'validation'
    | 'unknown'
    | 'rate-limited'
    | 'bot-check-failed'
    | 'delivery-failed'
    | 'delivery-exception'
    | string;
}

export interface EstimateAttachmentMeta {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export interface EstimateAttachment extends EstimateAttachmentMeta {
  /** Browser File — never persisted or uploaded until the upload pipeline is live. */
  readonly file: File;
}

export interface ContactSubmissionAdapter {
  submit(input: {
    readonly payload: Record<string, unknown> & {
      readonly name?: string;
      readonly email?: string;
      readonly phone?: string;
      readonly message?: string;
    };
    readonly simulateFailure?: boolean;
    readonly turnstileToken?: string;
    readonly remoteIp?: string;
    readonly identityKey?: string;
  }): Promise<SubmissionResult>;
}

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
