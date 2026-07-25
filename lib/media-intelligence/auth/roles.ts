/**
 * Phase 5 RBAC — roles and server-side permission matrix.
 * UI hiding is not authorization.
 */

export const MEDIA_ROLES = [
  'owner',
  'administrator',
  'editor',
  'reviewer',
  'viewer',
] as const;

export type MediaAccessRole = (typeof MEDIA_ROLES)[number];

export const MEDIA_PERMISSIONS = [
  'read',
  'import_metadata',
  'rebuild_projects',
  'run_ingestion',
  'run_analysis',
  'review_duplicates',
  'review_privacy',
  'review_ai',
  'edit_metadata',
  'prepare_publish_draft',
  'approve_workflow',
  'reject',
  'archive',
  'hide',
  'schedule',
  'create_publication_approval',
  'publish',
  'manage_users',
  'manage_roles',
  'manage_storage_config',
  'run_migration',
  'view_audit',
] as const;

export type MediaPermission = (typeof MEDIA_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<MediaAccessRole, readonly MediaPermission[]> = {
  owner: MEDIA_PERMISSIONS,
  administrator: [
    'read',
    'import_metadata',
    'rebuild_projects',
    'run_ingestion',
    'run_analysis',
    'review_duplicates',
    'review_privacy',
    'review_ai',
    'edit_metadata',
    'prepare_publish_draft',
    'approve_workflow',
    'reject',
    'archive',
    'hide',
    'schedule',
    'create_publication_approval',
    'view_audit',
  ],
  editor: ['read', 'edit_metadata', 'prepare_publish_draft', 'review_ai'],
  reviewer: [
    'read',
    'review_duplicates',
    'review_privacy',
    'review_ai',
    'approve_workflow',
    'reject',
  ],
  viewer: ['read'],
};

export function roleHasPermission(
  role: MediaAccessRole,
  permission: MediaPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function actorRolesHavePermission(
  roles: readonly MediaAccessRole[],
  permission: MediaPermission,
): boolean {
  return roles.some((role) => roleHasPermission(role, permission));
}

/** Highest-privilege role for display / primary actor.role. */
export function primaryRole(
  roles: readonly MediaAccessRole[],
): MediaAccessRole {
  for (const role of MEDIA_ROLES) {
    if (roles.includes(role)) return role;
  }
  return 'viewer';
}

export function canManageRole(
  actorRoles: readonly MediaAccessRole[],
  targetRole: MediaAccessRole,
): boolean {
  if (!actorRolesHavePermission(actorRoles, 'manage_roles')) return false;
  // Only owners may manage owner-level roles.
  if (targetRole === 'owner') {
    return actorRoles.includes('owner');
  }
  return actorRoles.includes('owner');
}

export { ROLE_PERMISSIONS };
