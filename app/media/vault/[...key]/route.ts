import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { requireMediaVaultAccess } from '@/lib/media-intelligence/auth/vault-guard';
import { getMediaRepository } from '@/lib/media-vault/factory';
import type { ThumbnailSize, VaultObjectKind } from '@/lib/media-vault/types';
import { THUMBNAIL_SIZES } from '@/lib/media-vault/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KINDS = new Set<VaultObjectKind>([
  'original',
  'thumbnail',
  'webp',
  'avif',
  'preview',
  'poster',
]);

/**
 * Authenticated private vault object stream.
 * Never publicly cacheable. Never indexes. Path traversal blocked in repository.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const denied = await requireMediaVaultAccess();
  if (denied) return denied;

  const url = new URL(request.url);
  const { key } = await context.params;
  // /media/vault/<assetId>/<kind>/[size]
  const assetId = key[0];
  const kind = key[1] as VaultObjectKind | undefined;
  const sizeRaw = key[2];

  if (!assetId || !kind || !KINDS.has(kind)) {
    return new Response('Not found', { status: 404 });
  }

  let size: ThumbnailSize | undefined;
  if (kind === 'thumbnail') {
    const parsed = Number(sizeRaw ?? url.searchParams.get('size') ?? 400);
    if (!THUMBNAIL_SIZES.includes(parsed as ThumbnailSize)) {
      return new Response('Invalid thumbnail size', { status: 400 });
    }
    size = parsed as ThumbnailSize;
  }

  const object = await getMediaRepository().resolvePrivateObject(
    assetId,
    kind,
    size,
  );
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const nodeStream = createReadStream(object.absolutePath);
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type': object.contentType,
      'Content-Length': String(object.bytes),
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    },
  });
}
