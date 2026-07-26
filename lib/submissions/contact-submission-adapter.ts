/**
 * Active contact submission adapter — delegates to the Server Action.
 */
import { submitContactAction } from '@/app/actions/submit-contact';
import type { ContactSubmissionAdapter } from '@/lib/submissions/types';

export const contactSubmissionAdapter: ContactSubmissionAdapter = {
  submit: (input) => submitContactAction(input),
};
