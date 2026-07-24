export * from '@/lib/media-intelligence/auth/session';
export * from '@/lib/media-intelligence/auth/guards';
export * from '@/lib/media-intelligence/auth/login-rate-limit';
export * from '@/lib/media-intelligence/schemas';
export * from '@/lib/media-intelligence/workflow';
export * from '@/lib/media-intelligence/scoring';
export * from '@/lib/media-intelligence/privacy';
export * from '@/lib/media-intelligence/duplicates';
export * from '@/lib/media-intelligence/search';
export * from '@/lib/media-intelligence/case-study';
export * from '@/lib/media-intelligence/seo';
export * from '@/lib/media-intelligence/social';
export * from '@/lib/media-intelligence/repository';
export * from '@/lib/media-intelligence/analysis/engine';
export * from '@/lib/media-intelligence/analysis/project-detection';
export * from '@/lib/media-intelligence/storage/types';
export * from '@/lib/media-intelligence/publishers/website';
// Phase 4 vision — schema/providers/enrichment (node store/pipeline imported directly)
export * from '@/lib/media-intelligence/vision/schema';
export * from '@/lib/media-intelligence/vision/provider';
export * from '@/lib/media-intelligence/vision/factory';
export * from '@/lib/media-intelligence/vision/quality';
export * from '@/lib/media-intelligence/vision/privacy-detect';
export * from '@/lib/media-intelligence/vision/providers/mock';
export * from '@/lib/media-intelligence/vision/providers/openai';
export * from '@/lib/media-intelligence/vision/merge';
export * from '@/lib/media-intelligence/vision/project-enrichment';
export * from '@/lib/media-intelligence/vision/search-enrichment';
export * from '@/lib/media-intelligence/vision/adapter';
export {
  MEDIA_ROLES,
  MEDIA_PERMISSIONS,
  ROLE_PERMISSIONS,
  roleHasPermission,
  actorRolesHavePermission,
  primaryRole,
  canManageRole,
  type MediaAccessRole,
  type MediaPermission as MediaAccessPermission,
} from '@/lib/media-intelligence/auth/roles';
export * from '@/lib/media-intelligence/supabase/config';
export * from '@/lib/media-intelligence/audit/audit';
export * from '@/lib/media-intelligence/storage/object-keys';
export * from '@/lib/media-intelligence/migration/mapping';
export * from '@/lib/media-intelligence/vision/analysis-repository';
export * from '@/lib/media-intelligence/vision/analysis-factory';
