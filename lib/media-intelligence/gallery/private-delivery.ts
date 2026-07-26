/**
 * Phase 7 — server-authorized private media delivery for gallery assets.
 *
 * Flow:
 * 1. Authenticate caller (vault route).
 * 2. Resolve asset by external id (workspace-scoped SELECT / membership).
 * 3. Resolve original or derivative object key.
 * 4. Return local absolutePath (local-vault) OR ephemeral signedUrl (Supabase).
 *
 * Never persist signed URLs. Never expose service-role credentials to clients.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { resolveVaultRoot } from '@/lib/media-vault/layout';
import type {
  PrivateObjectRef,
  ThumbnailSize,
  VaultObjectKind,
} from '@/lib/media-vault/types';
import { assertSafeObjectKey } from '@/lib/media-intelligence/storage/object-keys';
import { validateSupabaseConfig } from '@/lib/media-intelligence/supabase/config';
import {
  isPublicationPostgresConfigured,
  withPublicationActor,
} from '@/lib/media-intelligence/publishers/pg';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';

const LOCAL_BUCKET = 'local-vault';
const GALLERY_BUCKET = 'gallery';
const SIGNED_URL_TTL_SECONDS = 60;

type AssetStorageRow = {
  id: string;
  external_id: string;
  workspace_id: string;
  file_type: string;
  media_kind: string;
  checksum: string;
  file_size_bytes: string | number;
  storage_bucket: string | null;
  storage_object_key: string | null;
};

type DerivativeRow = {
  kind: string;
  size_px: number | null;
  storage_bucket: string;
  object_key: string;
  content_type: string;
  bytes: string | number | null;
};

function galleryRoot(): string {
  return path.join(resolveVaultRoot(), 'gallery');
}

async function fileExists(abs: string): Promise<boolean> {
  try {
    await fs.access(abs);
    return true;
  } catch {
    return false;
  }
}

async function resolveLocalGalleryPath(
  objectKey: string,
): Promise<{ absolutePath: string; bytes: number } | null> {
  const safe = assertSafeObjectKey(objectKey);
  const absolutePath = path.join(galleryRoot(), safe);
  const root = path.resolve(galleryRoot());
  if (!path.resolve(absolutePath).startsWith(root + path.sep)) {
    return null;
  }
  if (!(await fileExists(absolutePath))) return null;
  const stat = await fs.stat(absolutePath);
  return { absolutePath, bytes: stat.size };
}

async function createEphemeralSignedUrl(
  bucket: string,
  objectKey: string,
): Promise<string | null> {
  const validated = validateSupabaseConfig({ requireServiceRole: true });
  if (!validated.ok || !validated.config.serviceRoleKey) return null;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(
      validated.config.url,
      validated.config.serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(assertSafeObjectKey(objectKey), SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

async function loadAssetRow(
  actor: MediaTrustedActor,
  externalId: string,
): Promise<AssetStorageRow | null> {
  if (!isPublicationPostgresConfigured()) return null;
  return withPublicationActor(actor, async (client) => {
    const { rows } = await client.query<AssetStorageRow>(
      `select id, external_id, workspace_id, file_type, media_kind, checksum,
              file_size_bytes, storage_bucket, storage_object_key
       from public.media_assets
       where external_id = $1
       limit 1`,
      [externalId],
    );
    return rows[0] ?? null;
  });
}

async function loadDerivativeRow(
  actor: MediaTrustedActor,
  assetId: string,
  kind: VaultObjectKind,
  size?: ThumbnailSize,
): Promise<DerivativeRow | null> {
  return withPublicationActor(actor, async (client) => {
    if (kind === 'thumbnail') {
      const { rows } = await client.query<DerivativeRow>(
        `select kind, size_px, storage_bucket, object_key, content_type, bytes
         from public.media_asset_derivatives
         where asset_id = $1::uuid
           and kind = 'thumbnail'
           and size_px = $2
         limit 1`,
        [assetId, size ?? 400],
      );
      return rows[0] ?? null;
    }
    const { rows } = await client.query<DerivativeRow>(
      `select kind, size_px, storage_bucket, object_key, content_type, bytes
       from public.media_asset_derivatives
       where asset_id = $1::uuid
         and kind = $2
       order by size_px desc nulls last
       limit 1`,
      [assetId, kind],
    );
    return rows[0] ?? null;
  });
}

async function resolveByChecksumFallback(
  checksum: string,
  kind: VaultObjectKind,
  size?: ThumbnailSize,
  contentType = 'application/octet-stream',
): Promise<PrivateObjectRef | null> {
  if (kind === 'thumbnail') {
    const px = size ?? 400;
    const candidates = [
      path.join(
        galleryRoot(),
        'thumbnails',
        String(px),
        `${checksum}_${px}.webp`,
      ),
      path.join(galleryRoot(), 'thumbnails', String(px), `${checksum}.webp`),
    ];
    for (const absolutePath of candidates) {
      if (await fileExists(absolutePath)) {
        const stat = await fs.stat(absolutePath);
        return {
          kind,
          absolutePath,
          contentType: 'image/webp',
          bytes: stat.size,
          size: px,
        };
      }
    }
    return null;
  }

  if (kind === 'original' || kind === 'preview') {
    const originals = path.join(galleryRoot(), 'originals');
    try {
      const entries = await fs.readdir(originals);
      const match = entries.find((name) => name.startsWith(checksum));
      if (!match) return null;
      const absolutePath = path.join(originals, match);
      const stat = await fs.stat(absolutePath);
      return {
        kind,
        absolutePath,
        contentType,
        bytes: stat.size,
      };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Resolve a private gallery object for an authenticated workspace member.
 * Returns null when the object is missing or unauthorized (caller maps to 404).
 */
export async function resolveGalleryPrivateObject(
  actor: MediaTrustedActor,
  assetExternalId: string,
  kind: VaultObjectKind,
  size?: ThumbnailSize,
): Promise<PrivateObjectRef | null> {
  const asset = await loadAssetRow(actor, assetExternalId);
  if (!asset) {
    // Last-resort local lookup by external id pattern is intentionally omitted —
    // membership + DB ownership must gate access when postgres is configured.
    return null;
  }

  if (kind === 'original' || kind === 'preview') {
    if (!asset.storage_bucket || !asset.storage_object_key) {
      return resolveByChecksumFallback(
        asset.checksum,
        kind,
        size,
        asset.file_type,
      );
    }

    if (
      asset.storage_bucket === LOCAL_BUCKET ||
      asset.storage_bucket === GALLERY_BUCKET
    ) {
      const local = await resolveLocalGalleryPath(asset.storage_object_key);
      if (local) {
        return {
          kind,
          absolutePath: local.absolutePath,
          contentType: asset.file_type,
          bytes: local.bytes,
        };
      }
    }

    if (asset.storage_bucket !== LOCAL_BUCKET) {
      const signedUrl = await createEphemeralSignedUrl(
        asset.storage_bucket,
        asset.storage_object_key,
      );
      if (signedUrl) {
        return {
          kind,
          signedUrl,
          contentType: asset.file_type,
          bytes: Number(asset.file_size_bytes),
        };
      }
    }

    return resolveByChecksumFallback(
      asset.checksum,
      kind,
      size,
      asset.file_type,
    );
  }

  const deriv = await loadDerivativeRow(actor, asset.id, kind, size);
  if (deriv) {
    if (
      deriv.storage_bucket === LOCAL_BUCKET ||
      deriv.storage_bucket === GALLERY_BUCKET
    ) {
      const local = await resolveLocalGalleryPath(deriv.object_key);
      if (local) {
        return {
          kind,
          absolutePath: local.absolutePath,
          contentType: deriv.content_type,
          bytes: local.bytes,
          size: (deriv.size_px as ThumbnailSize | null) ?? size,
        };
      }
    }

    if (deriv.storage_bucket !== LOCAL_BUCKET) {
      const signedUrl = await createEphemeralSignedUrl(
        deriv.storage_bucket,
        deriv.object_key,
      );
      if (signedUrl) {
        return {
          kind,
          signedUrl,
          contentType: deriv.content_type,
          bytes: Number(deriv.bytes ?? 0),
          size: (deriv.size_px as ThumbnailSize | null) ?? size,
        };
      }
    }
  }

  if (kind === 'thumbnail' || kind === 'poster') {
    return resolveByChecksumFallback(
      asset.checksum,
      kind === 'poster' ? 'thumbnail' : kind,
      size ?? 400,
      'image/webp',
    );
  }

  return null;
}
