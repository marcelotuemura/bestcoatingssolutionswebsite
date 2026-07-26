import {
  actorRolesHavePermission,
  type MediaAccessRole,
} from '@/lib/media-intelligence/auth/roles';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';

export type CorpusAction =
  'read' | 'draft' | 'review' | 'approve' | 'release' | 'archive' | 'export';

const ACTION_PERMISSION: Record<
  CorpusAction,
  | 'read'
  | 'manage_corpus_draft'
  | 'review_corpus'
  | 'approve_corpus'
  | 'release_corpus'
> = {
  read: 'read',
  draft: 'manage_corpus_draft',
  review: 'review_corpus',
  approve: 'approve_corpus',
  release: 'release_corpus',
  archive: 'release_corpus',
  export: 'approve_corpus',
};

export function actorCanCorpusAction(
  actor: MediaTrustedActor,
  action: CorpusAction,
): boolean {
  const roles = actor.roles as readonly MediaAccessRole[];
  return actorRolesHavePermission(roles, ACTION_PERMISSION[action]);
}

export function canTransitionCorpus(from: string, to: string): boolean {
  const map: Record<string, readonly string[]> = {
    draft: ['under_review', 'archived'],
    under_review: ['approved', 'draft', 'archived'],
    approved: ['archived'],
    archived: [],
  };
  return (map[from] ?? []).includes(to);
}

export function canTransitionCorpusVersion(from: string, to: string): boolean {
  const map: Record<string, readonly string[]> = {
    building: ['review_ready', 'cancelled'],
    review_ready: ['approved', 'building', 'cancelled'],
    approved: ['released', 'cancelled'],
    released: ['superseded'],
    superseded: [],
    cancelled: [],
  };
  return (map[from] ?? []).includes(to);
}
