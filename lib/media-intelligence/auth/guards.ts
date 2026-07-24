import type {
  MediaApproval,
  PublishTarget,
} from '@/lib/media-intelligence/schemas';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  actorRolesHavePermission,
  type MediaPermission,
} from '@/lib/media-intelligence/auth/roles';

export type { MediaPermission } from '@/lib/media-intelligence/auth/roles';

/** @deprecated Prefer roles.ts ROLE_PERMISSIONS — kept for Phase 1 test compat. */
const ownerPermissions: readonly MediaPermission[] = [
  'read',
  'import_metadata',
  'rebuild_projects',
  'approve_workflow',
  'reject',
  'archive',
  'hide',
  'schedule',
  'create_publication_approval',
  'publish',
] as const;

export function actorHasPermission(
  actor: MediaTrustedActor,
  permission: MediaPermission,
): boolean {
  const roles = actor.roles?.length ? actor.roles : [actor.role];
  if (actorRolesHavePermission(roles, permission)) return true;
  // Temporary Phase 1 sessions were owner-only with a narrower enum —
  // keep ownerPermissions bridge for tests that only pass role: 'owner'.
  if (actor.role === 'owner' && ownerPermissions.includes(permission)) {
    return true;
  }
  return false;
}

export type GuardFailure = {
  readonly ok: false;
  readonly error: string;
  readonly status: number;
};

export type GuardSuccess = {
  readonly ok: true;
  readonly actor: MediaTrustedActor;
};

export async function requireMediaSession(): Promise<
  GuardSuccess | GuardFailure
> {
  const session = await resolveMediaTrustedActor();
  if (!session.ok) {
    return {
      ok: false,
      error: session.error,
      status: session.status,
    };
  }
  return { ok: true, actor: session.actor };
}

export async function requireMediaPermission(
  permission: MediaPermission,
): Promise<GuardSuccess | GuardFailure> {
  const session = await requireMediaSession();
  if (!session.ok) return session;
  if (!actorHasPermission(session.actor, permission)) {
    return {
      ok: false,
      error: `Permission denied: ${permission}`,
      status: 403,
    };
  }
  return session;
}

/**
 * Publication requires a stored MediaApproval for the exact asset + target.
 * Status === 'approved' alone is not sufficient.
 */
export function requireOwnerApprovalRecord(input: {
  readonly approval: MediaApproval | undefined;
  readonly assetId: string;
  readonly target: PublishTarget;
  readonly privacyBlocked: boolean;
}): { readonly ok: true } | GuardFailure {
  if (input.privacyBlocked) {
    return {
      ok: false,
      error: 'Privacy-blocked assets cannot be approved for publication.',
      status: 403,
    };
  }
  const approval = input.approval;
  if (!approval || approval.revokedAt) {
    return {
      ok: false,
      error:
        'Target-specific owner approval record required before publication.',
      status: 403,
    };
  }
  if (approval.assetId !== input.assetId || approval.target !== input.target) {
    return {
      ok: false,
      error: 'Approval record does not match asset and publication target.',
      status: 403,
    };
  }
  return { ok: true };
}
