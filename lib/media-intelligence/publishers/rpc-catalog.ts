/** Phase 6 publication SECURITY DEFINER RPC catalog. */
export const PHASE6_PUBLICATION_RPC_CATALOG = [
  'media_create_publication_draft',
  'media_update_publication_draft',
  'media_submit_publication',
  'media_approve_publication',
  'media_reject_publication_approval',
  'media_schedule_publication',
  'media_cancel_publication',
  'media_execute_publication',
  'media_record_publication_result',
  'media_retry_publication',
] as const;

export type Phase6PublicationRpc =
  (typeof PHASE6_PUBLICATION_RPC_CATALOG)[number];
