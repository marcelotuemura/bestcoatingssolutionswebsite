/**
 * Active contact submission adapter.
 * PRODUCTION BLOCKER: swap mock for real email/CRM delivery before launch.
 */
export { mockContactAdapter as contactSubmissionAdapter } from '@/lib/submissions/mock-adapters';
export type { ContactSubmissionAdapter } from '@/lib/submissions/types';
