'use server';

import { processEstimateSubmission } from '@/lib/submissions/process-submission';
import type {
  EstimateAttachmentMeta,
  SubmissionResult,
} from '@/lib/submissions/types';

export async function submitEstimateAction(input: {
  readonly payload: Record<string, unknown>;
  readonly attachments: readonly EstimateAttachmentMeta[];
  readonly simulateFailure?: boolean;
  readonly sourcePath?: string;
}): Promise<SubmissionResult> {
  return processEstimateSubmission(input);
}
