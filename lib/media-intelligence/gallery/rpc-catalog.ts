/** Phase 7 gallery SECURITY DEFINER RPC catalog. */
export const PHASE7_GALLERY_RPC_CATALOG = [
  'media_gallery_ensure_own_membership',
  'media_gallery_find_asset_by_checksum',
  'media_gallery_register_asset',
  'media_gallery_register_derivative',
  'media_gallery_update_metadata',
  'media_gallery_set_favorite',
  'media_gallery_create_collection',
  'media_gallery_update_collection',
  'media_gallery_collection_set_assets',
  'media_gallery_archive_assets',
  'media_gallery_submit_for_review',
  'media_gallery_review_asset',
] as const;

export type Phase7GalleryRpc = (typeof PHASE7_GALLERY_RPC_CATALOG)[number];
