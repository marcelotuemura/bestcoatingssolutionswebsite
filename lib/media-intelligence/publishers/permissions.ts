import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import type { MediaPermission } from '@/lib/media-intelligence/auth/roles';
import type { PublicationJobStatus } from '@/lib/media-intelligence/publishers/types';

export type PublicationAction =
  | 'create_draft'
  | 'update_draft'
  | 'submit_for_approval'
  | 'approve'
  | 'reject_approval'
  | 'schedule'
  | 'cancel'
  | 'execute_publish'
  | 'retry'
  | 'read';

const ACTION_PERMISSION: Record<PublicationAction, MediaPermission | null> = {
  create_draft: 'prepare_publish_draft',
  update_draft: 'prepare_publish_draft',
  submit_for_approval: 'prepare_publish_draft',
  approve: 'create_publication_approval',
  reject_approval: 'approve_workflow',
  schedule: 'schedule',
  cancel: 'schedule',
  execute_publish: 'publish',
  retry: 'publish',
  read: 'read',
};

export function permissionForPublicationAction(
  action: PublicationAction,
): MediaPermission | null {
  return ACTION_PERMISSION[action];
}

export function actorCanPublicationAction(
  actor: MediaTrustedActor,
  action: PublicationAction,
): boolean {
  const permission = ACTION_PERMISSION[action];
  if (!permission) return false;
  return actorHasPermission(actor, permission);
}

/** Statuses an editor may still mutate (draft fields only). */
export function editorMayEditStatus(status: PublicationJobStatus): boolean {
  return status === 'draft' || status === 'awaiting_approval';
}
