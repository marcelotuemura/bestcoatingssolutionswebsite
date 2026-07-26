/** Phase 7 corpus SECURITY DEFINER RPC catalog. */
export const PHASE7_CORPUS_RPC_CATALOG = [
  'media_corpus_ensure_own_membership',
  'media_create_corpus',
  'media_create_corpus_version',
  'media_add_corpus_item',
  'media_remove_corpus_item',
  'media_suggest_corpus_label',
  'media_confirm_corpus_label',
  'media_review_corpus_item',
  'media_assign_corpus_split',
  'media_corpus_version_readiness',
  'media_submit_corpus_version',
  'media_approve_corpus_version',
  'media_corpus_build_manifest',
  'media_release_corpus_version',
  'media_cancel_corpus_version',
  'media_archive_corpus',
  'media_generate_corpus_export',
  'media_corpus_asset_eligibility',
] as const;

export type Phase7CorpusRpc = (typeof PHASE7_CORPUS_RPC_CATALOG)[number];
