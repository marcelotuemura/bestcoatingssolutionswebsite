/**
 * Typed wrappers for Phase 5 SECURITY DEFINER RPCs.
 * Never trust client-supplied actor IDs — RPCs derive auth.uid().
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export const EDITOR_METADATA_FIELDS = [
  'manufacturer',
  'boat_name',
  'boat_type',
  'repair_category',
  'stage',
  'keywords',
  'notes',
  'project_name',
] as const;

export const EDITOR_PROTECTED_FIELDS = [
  'id',
  'external_id',
  'checksum',
  'filename',
  'original_filename',
  'storage_bucket',
  'storage_object_key',
  'source_system',
  'created_by',
  'created_at',
  'archived_at',
  'privacy_status',
  'is_exact_duplicate',
  'is_near_duplicate',
  'score_website',
  'score_marketing',
  'score_technical',
] as const;

export type EditorMetadataUpdate = {
  readonly externalId: string;
  readonly manufacturer?: string;
  readonly boatName?: string;
  readonly boatType?: string;
  readonly repairCategory?: string;
  readonly stage?: string;
  readonly keywords?: readonly string[];
  readonly notes?: string;
  readonly projectName?: string;
};

export async function rpcEditorUpdateAssetMetadata(
  client: SupabaseClient,
  input: EditorMetadataUpdate,
) {
  return client.rpc('media_editor_update_asset_metadata', {
    p_external_id: input.externalId,
    p_manufacturer: input.manufacturer ?? null,
    p_boat_name: input.boatName ?? null,
    p_boat_type: input.boatType ?? null,
    p_repair_category: input.repairCategory ?? null,
    p_stage: input.stage ?? null,
    p_keywords: input.keywords ? [...input.keywords] : null,
    p_notes: input.notes ?? null,
    p_project_name: input.projectName ?? null,
  });
}

export async function rpcReviewResolvePrivacyFlag(
  client: SupabaseClient,
  flagId: string,
  notes?: string,
) {
  return client.rpc('media_review_resolve_privacy_flag', {
    p_flag_id: flagId,
    p_notes: notes ?? null,
  });
}

export async function rpcReviewAiSuggestion(
  client: SupabaseClient,
  analysisId: string,
  decision: 'accept' | 'reject' | 'deferred',
  notes?: string,
) {
  return client.rpc('media_review_ai_suggestion', {
    p_analysis_id: analysisId,
    p_decision: decision,
    p_notes: notes ?? null,
  });
}

export async function rpcReviewDuplicateDecision(
  client: SupabaseClient,
  groupExternalId: string,
  decision: string,
  notes?: string,
) {
  return client.rpc('media_review_duplicate_decision', {
    p_group_external_id: groupExternalId,
    p_decision: decision,
    p_notes: notes ?? null,
  });
}

export async function rpcUpdateOwnDisplayName(
  client: SupabaseClient,
  displayName: string,
) {
  return client.rpc('media_update_own_display_name', {
    p_display_name: displayName,
  });
}

export async function rpcAssignRole(
  client: SupabaseClient,
  userId: string,
  role: string,
) {
  return client.rpc('media_assign_role', {
    p_user_id: userId,
    p_role: role,
  });
}

export async function rpcRevokeRole(
  client: SupabaseClient,
  userId: string,
  role: string,
) {
  return client.rpc('media_revoke_role', {
    p_user_id: userId,
    p_role: role,
  });
}

export async function rpcSetUserActiveState(
  client: SupabaseClient,
  userId: string,
  isActive: boolean,
  archive = false,
) {
  return client.rpc('media_set_user_active_state', {
    p_user_id: userId,
    p_is_active: isActive,
    p_archive: archive,
  });
}

/** Catalog of RPCs and accepted fields for documentation/tests. */
export const PHASE5_RPC_CATALOG = [
  {
    name: 'media_editor_update_asset_metadata',
    roles: ['editor', 'administrator', 'owner'],
    fields: EDITOR_METADATA_FIELDS,
    never: EDITOR_PROTECTED_FIELDS,
  },
  {
    name: 'media_review_resolve_privacy_flag',
    roles: ['reviewer', 'administrator', 'owner'],
    fields: ['flag_id', 'notes'] as const,
    never: ['risk', 'confidence', 'asset_id'] as const,
  },
  {
    name: 'media_review_ai_suggestion',
    roles: ['reviewer', 'administrator', 'owner'],
    fields: ['analysis_id', 'decision', 'notes'] as const,
    never: ['provider', 'quality', 'boat', 'is_current'] as const,
  },
  {
    name: 'media_review_duplicate_decision',
    roles: ['reviewer', 'administrator', 'owner'],
    fields: ['group_external_id', 'decision', 'notes'] as const,
    never: ['members', 'kind', 'similarity'] as const,
  },
  {
    name: 'media_update_own_display_name',
    roles: ['authenticated self'],
    fields: ['display_name'] as const,
    never: [
      'email',
      'is_active',
      'archived_at',
      'last_login_at',
      'id',
    ] as const,
  },
  {
    name: 'media_assign_role',
    roles: ['owner'],
    fields: ['user_id', 'role'] as const,
    never: ['assigned_by'] as const,
  },
  {
    name: 'media_revoke_role',
    roles: ['owner'],
    fields: ['user_id', 'role'] as const,
    never: [] as const,
  },
  {
    name: 'media_set_user_active_state',
    roles: ['owner'],
    fields: ['user_id', 'is_active', 'archive'] as const,
    never: ['email'] as const,
  },
] as const;
