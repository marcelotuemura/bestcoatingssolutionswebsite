/**
 * Active estimate submission adapter.
 * PRODUCTION BLOCKER: swap mock for secure upload + CRM/email before launch.
 */
export { mockEstimateAdapter as estimateSubmissionAdapter } from '@/lib/submissions/mock-adapters';
export type {
  EstimateSubmissionAdapter,
  EstimateAttachment,
  EstimateAttachmentMeta,
} from '@/lib/submissions/types';
