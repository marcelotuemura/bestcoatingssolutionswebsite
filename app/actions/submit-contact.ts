'use server';

import { processContactSubmission } from '@/lib/submissions/process-submission';
import type { SubmissionResult } from '@/lib/submissions/types';

export async function submitContactAction(input: {
  readonly payload: Record<string, unknown>;
  readonly simulateFailure?: boolean;
  readonly sourcePath?: string;
}): Promise<SubmissionResult> {
  return processContactSubmission(input);
}
