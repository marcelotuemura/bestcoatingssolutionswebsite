/**
 * Active estimate submission adapter — delegates to the Server Action.
 */
import { submitEstimateAction } from '@/app/actions/submit-estimate';
import type { EstimateSubmissionAdapter } from '@/lib/submissions/types';

export const estimateSubmissionAdapter: EstimateSubmissionAdapter = {
  submit: (input) => submitEstimateAction(input),
};
