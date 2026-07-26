/**
 * Phase 7 gallery durable storage mode policy.
 *
 * Production/staging must use private Supabase Storage.
 * Local vault is opt-in only for development/tests — never a durable
 * production persistence mechanism (Vercel / ephemeral disks).
 */

export type GalleryStorageMode = 'supabase' | 'local';

export type GalleryStorageModeResolution = {
  readonly mode: GalleryStorageMode;
  readonly source: 'explicit' | 'default';
  readonly durableRequired: boolean;
  readonly allowsLocalVault: boolean;
};

function envName(): string {
  return (process.env.MEDIA_SUPABASE_ENV ?? '').trim().toLowerCase();
}

function isProductionRuntime(): boolean {
  const supabaseEnv = envName();
  if (supabaseEnv === 'production' || supabaseEnv === 'prod') return true;
  if (process.env.VERCEL_ENV === 'production') return true;
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.VERCEL_ENV !== 'preview' &&
    process.env.VERCEL_ENV !== 'development' &&
    supabaseEnv !== 'staging' &&
    supabaseEnv !== 'development' &&
    supabaseEnv !== 'dev'
  ) {
    return true;
  }
  return false;
}

function isStagingRuntime(): boolean {
  return envName() === 'staging';
}

function isTestRuntime(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    process.env.MEDIA_GALLERY_REPOSITORY === 'memory'
  );
}

/**
 * Resolve gallery storage mode.
 *
 * Rules:
 * - Default is always `supabase` (durable).
 * - `local` requires explicit MEDIA_GALLERY_STORAGE_MODE=local.
 * - Production and staging reject `local`.
 * - Tests may use local when explicitly opted in (or under Vitest with local).
 */
export function resolveGalleryStorageMode(
  raw = process.env.MEDIA_GALLERY_STORAGE_MODE,
): GalleryStorageModeResolution {
  const explicit = raw?.trim().toLowerCase();
  const production = isProductionRuntime();
  const staging = isStagingRuntime();
  const test = isTestRuntime();

  if (explicit === 'local') {
    if (production || staging) {
      throw new Error(
        'MEDIA_GALLERY_STORAGE_MODE=local is forbidden in production/staging. ' +
          'Durable private Supabase Storage is required.',
      );
    }
    return {
      mode: 'local',
      source: 'explicit',
      durableRequired: false,
      allowsLocalVault: true,
    };
  }

  if (explicit === 'supabase' || explicit === 'remote') {
    return {
      mode: 'supabase',
      source: 'explicit',
      durableRequired: true,
      allowsLocalVault: false,
    };
  }

  if (explicit && explicit !== '') {
    throw new Error(
      `Invalid MEDIA_GALLERY_STORAGE_MODE="${explicit}". Use "supabase" or "local".`,
    );
  }

  // Default: supabase everywhere. Local only via explicit opt-in.
  // Vitest may set MEDIA_GALLERY_STORAGE_MODE=local in test files.
  if (test && process.env.MEDIA_GALLERY_ALLOW_LOCAL_DEFAULT === '1') {
    return {
      mode: 'local',
      source: 'default',
      durableRequired: false,
      allowsLocalVault: true,
    };
  }

  return {
    mode: 'supabase',
    source: 'default',
    // Default mode always requires durable private Supabase Storage.
    durableRequired: true,
    allowsLocalVault: false,
  };
}

export function assertGalleryStorageModeAllowed(): GalleryStorageModeResolution {
  return resolveGalleryStorageMode();
}

export function galleryStorageBucketForMode(
  mode: GalleryStorageMode,
): 'media-originals' | 'local-vault' {
  return mode === 'supabase' ? 'media-originals' : 'local-vault';
}

export function galleryThumbnailBucketForMode(
  mode: GalleryStorageMode,
): 'media-thumbnails' | 'local-vault' {
  return mode === 'supabase' ? 'media-thumbnails' : 'local-vault';
}
