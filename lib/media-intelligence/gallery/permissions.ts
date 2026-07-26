import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';

export type GalleryAction =
  | 'upload'
  | 'edit_metadata'
  | 'set_favorite'
  | 'manage_collection'
  | 'archive'
  | 'review'
  | 'read';

export function actorCanGalleryEdit(actor: MediaTrustedActor): boolean {
  return (
    actorHasPermission(actor, 'edit_metadata') ||
    actor.roles.includes('administrator') ||
    actor.roles.includes('owner')
  );
}

export function actorCanGalleryReview(actor: MediaTrustedActor): boolean {
  return (
    actorHasPermission(actor, 'approve_workflow') ||
    actor.roles.includes('administrator') ||
    actor.roles.includes('owner')
  );
}

export function actorCanUpload(actor: MediaTrustedActor): boolean {
  return actorCanGalleryEdit(actor);
}

export function actorCanGalleryAction(
  actor: MediaTrustedActor,
  action: GalleryAction,
): boolean {
  switch (action) {
    case 'read':
      return actorHasPermission(actor, 'read');
    case 'upload':
    case 'edit_metadata':
    case 'manage_collection':
    case 'archive':
      return actorCanGalleryEdit(actor);
    case 'set_favorite':
      return actorHasPermission(actor, 'read');
    case 'review':
      return actorCanGalleryReview(actor);
    default:
      return false;
  }
}

export function actorIsViewer(actor: MediaTrustedActor): boolean {
  const allRoles = actor.roles?.length ? actor.roles : [actor.role];
  return allRoles.every((r) => r === 'viewer');
}
