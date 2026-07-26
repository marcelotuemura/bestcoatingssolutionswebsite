import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { UploadDropzone } from '@/components/media-intelligence/UploadDropzone';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { actorCanUpload } from '@/lib/media-intelligence/gallery/permissions';

export default async function MediaUploadPage() {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();
  const canUpload = session.ok && actorCanUpload(session.actor);

  return (
    <MediaShell
      title="Upload Assets"
      subtitle="Drag and drop images or videos to upload. SHA-256 verified — exact duplicates are detected automatically."
      readOnlyBanner={false}
    >
      {canUpload ? (
        <UploadDropzone workspaceId="bcs-default" />
      ) : (
        <div
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-6 text-center text-sm text-amber-100"
          role="alert"
          data-testid="upload-permission-denied"
        >
          Your current role does not permit file uploads. Contact an
          administrator to request editor access.
        </div>
      )}
    </MediaShell>
  );
}
