export type SubmissionStatus = 'delivered' | 'failed';

export type SubmissionMessageKey =
  'success' | 'failure' | 'configError' | 'rateLimited';

export type SubmissionErrorCode =
  | 'simulated'
  | 'validation'
  | 'honeypot'
  | 'rate_limited'
  | 'config'
  | 'provider'
  | 'unknown';

export interface SubmissionResult {
  readonly ok: boolean;
  readonly status: SubmissionStatus;
  /** Opaque reference for UI — never includes PII. */
  readonly referenceId?: string;
  readonly messageKey: SubmissionMessageKey;
  readonly errorCode?: SubmissionErrorCode;
}

export interface EstimateAttachmentMeta {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export interface EstimateAttachment extends EstimateAttachmentMeta {
  /** Browser File — never persisted or uploaded in this release. */
  readonly file: File;
}

export interface ContactSubmissionAdapter {
  submit(input: {
    readonly payload: Record<string, unknown>;
    readonly simulateFailure?: boolean;
    readonly sourcePath?: string;
  }): Promise<SubmissionResult>;
}

export interface EstimateSubmissionAdapter {
  submit(input: {
    readonly payload: Record<string, unknown>;
    readonly attachments: readonly EstimateAttachmentMeta[];
    readonly simulateFailure?: boolean;
    readonly sourcePath?: string;
  }): Promise<SubmissionResult>;
}
