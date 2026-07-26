/**
 * POST /media/api/upload — multipart gallery file upload.
 *
 * Auth: temporal media session (same as all /media/* routes).
 * Response: { ok, assetId, checksum, duplicate? }
 *
 * Never expose service role. Never fake success.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorCanUpload } from '@/lib/media-intelligence/gallery/permissions';
import { uploadGalleryAsset } from '@/lib/media-intelligence/gallery/upload';
import {
  validateGalleryMimeType,
  validateGalleryFileSize,
} from '@/lib/media-intelligence/gallery/validation';

export const runtime = 'nodejs';
// Disable Next.js default body limit; we enforce our own.
export const config = {
  api: { bodyParser: false },
};

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth
  const session = await resolveMediaTrustedActor();
  if (!session.ok) {
    return errorResponse('Unauthorized.', 401);
  }
  const actor = session.actor;

  if (!actorCanUpload(actor)) {
    return errorResponse('Insufficient permissions to upload assets.', 403);
  }

  // Parse multipart form
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('Expected multipart/form-data request.', 400);
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return errorResponse('Missing file field.', 400);
  }

  const workspaceId =
    (formData.get('workspaceId') as string | null)?.trim() || 'bcs-default';

  // Validate mime type
  const mimeType = file.type || 'application/octet-stream';
  const mimeCheck = validateGalleryMimeType(mimeType);
  if (!mimeCheck.ok) {
    return errorResponse(mimeCheck.error, 415);
  }

  // Validate size
  const sizeCheck = validateGalleryFileSize(file.size);
  if (!sizeCheck.ok) {
    return errorResponse(sizeCheck.error, 413);
  }

  // Read file bytes
  let data: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    data = Buffer.from(arrayBuffer);
  } catch {
    return errorResponse('Failed to read uploaded file.', 400);
  }

  const filename =
    file instanceof File
      ? file.name
      : (formData.get('filename') as string | null) || 'upload.bin';

  // Upload
  const result = await uploadGalleryAsset({
    actor,
    workspaceId,
    filename,
    mimeType,
    data,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, outcome: result.outcome, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    outcome: result.outcome,
    assetId: result.assetId,
    checksum: result.checksum,
    duplicate: result.duplicate,
    processingComplete: result.processingComplete ?? true,
  });
}

export async function GET(): Promise<NextResponse> {
  return errorResponse('Method not allowed.', 405);
}
