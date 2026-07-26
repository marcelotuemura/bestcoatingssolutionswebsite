/**
 * Workspace-scoped gallery object keys for private Supabase Storage.
 * Keys never include absolute filesystem paths or signed URLs.
 */

import { assertSafeObjectKey } from '@/lib/media-intelligence/storage/object-keys';

const SAFE_WORKSPACE = /^[a-zA-Z0-9._-]+$/;

export function assertSafeWorkspaceId(workspaceId: string): string {
  const id = workspaceId.trim();
  if (!id || id.length > 80 || !SAFE_WORKSPACE.test(id)) {
    throw new Error('Invalid workspace id for storage object key');
  }
  return id;
}

export function buildGalleryOriginalObjectKey(input: {
  readonly workspaceId: string;
  readonly checksum: string;
  readonly filename: string;
}): string {
  const workspace = assertSafeWorkspaceId(input.workspaceId);
  const ext = input.filename.includes('.')
    ? input.filename.slice(input.filename.lastIndexOf('.'))
    : '';
  const base = input.filename
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 120);
  const key = `workspaces/${workspace}/originals/${input.checksum.slice(0, 16)}_${base}${ext.toLowerCase()}`;
  return assertSafeObjectKey(key);
}

export function buildGalleryThumbnailObjectKey(input: {
  readonly workspaceId: string;
  readonly assetExternalId: string;
  readonly sizePx: number;
}): string {
  const workspace = assertSafeWorkspaceId(input.workspaceId);
  const id = input.assetExternalId.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const key = `workspaces/${workspace}/thumbnails/${input.sizePx}/${id}.webp`;
  return assertSafeObjectKey(key);
}

export function isWorkspaceScopedGalleryKey(
  objectKey: string,
  workspaceId: string,
): boolean {
  try {
    const safe = assertSafeObjectKey(objectKey);
    const workspace = assertSafeWorkspaceId(workspaceId);
    return safe.startsWith(`workspaces/${workspace}/`);
  } catch {
    return false;
  }
}
