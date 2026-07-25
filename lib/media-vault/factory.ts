import { JsonMediaRepository } from '@/lib/media-vault/repositories/json-repository';
import { LocalFilesystemRepository } from '@/lib/media-vault/repositories/local-filesystem-repository';
import { PostgreSQLRepository } from '@/lib/media-vault/repositories/postgres-repository';
import { SupabaseStorageRepository } from '@/lib/media-vault/repositories/supabase-repository';
import type {
  MediaRepository,
  MediaRepositoryBackend,
} from '@/lib/media-vault/types';

let singleton: MediaRepository | null = null;

export function resolveMediaRepositoryBackend(
  raw = process.env.MEDIA_REPOSITORY?.trim().toLowerCase(),
): MediaRepositoryBackend {
  switch (raw) {
    case 'local':
    case 'local-filesystem':
    case 'filesystem':
      return 'local-filesystem';
    case 'supabase':
      return 'supabase';
    case 'postgres':
    case 'postgresql':
      return 'postgres';
    case 'json':
    default:
      return 'json';
  }
}

export function createMediaRepository(
  backend = resolveMediaRepositoryBackend(),
): MediaRepository {
  switch (backend) {
    case 'local-filesystem':
      return new LocalFilesystemRepository();
    case 'supabase':
      return new SupabaseStorageRepository();
    case 'postgres':
      return new PostgreSQLRepository();
    case 'json':
    default:
      return new JsonMediaRepository();
  }
}

/** Process-wide repository used by the Interactive Media Library UI. */
export function getMediaRepository(): MediaRepository {
  if (!singleton) {
    singleton = createMediaRepository();
  }
  return singleton;
}

/** Test helper — swap repository implementation. */
export function setMediaRepositoryForTests(
  repository: MediaRepository | null,
): void {
  singleton = repository;
}
