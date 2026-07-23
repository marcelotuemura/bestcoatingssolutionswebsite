export type SubmissionStatus = 'prepared' | 'failed';

export interface SubmissionResult {
  readonly ok: boolean;
  readonly status: SubmissionStatus;
  /** Opaque reference for UI — never includes PII. */
  readonly referenceId?: string;
  readonly messageKey: 'demoSuccess' | 'demoFailure';
  readonly errorCode?: 'simulated' | 'validation' | 'unknown';
}

export interface EstimateAttachmentMeta {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export interface EstimateAttachment extends EstimateAttachmentMeta {
  /** Browser File — never persisted or uploaded in Phase 4. */
  readonly file: File;
}

export interface ContactSubmissionAdapter {
  submit(input: {
    readonly payload: Record<string, unknown>;
    readonly simulateFailure?: boolean;
  }): Promise<SubmissionResult>;
}

export interface EstimateSubmissionAdapter {
  submit(input: {
    readonly payload: Record<string, unknown>;
    readonly attachments: readonly EstimateAttachmentMeta[];
    readonly simulateFailure?: boolean;
  }): Promise<SubmissionResult>;
}
