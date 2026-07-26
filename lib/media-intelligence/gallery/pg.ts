/**
 * PostgreSQL access for Phase 7 gallery RPCs.
 * Reuses publications pool (same physical database).
 * Actor JWT is set via set_config; never client-trusted.
 */

export {
  getPublicationPool as getGalleryPool,
  resolvePublicationDatabaseUrl as resolveGalleryDatabaseUrl,
  isPublicationPostgresConfigured as isGalleryPostgresConfigured,
  withPublicationActor as withGalleryActor,
  withPublicationService as withGalleryService,
  ensurePublicationActor as ensureGalleryActor,
  queryAsActor as galleryQueryAsActor,
  actorIdToUuid as galleryActorIdToUuid,
  __resetPublicationPoolForTests as __resetGalleryPoolForTests,
} from '@/lib/media-intelligence/publishers/pg';
