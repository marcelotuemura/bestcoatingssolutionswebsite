import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { ImportDropzone } from '@/components/media-intelligence/ImportDropzone';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';

export default async function MediaImportPage() {
  await requireMediaPageAccess();
  return (
    <MediaShell
      title="Import Engine"
      subtitle="Foundation metadata simulation only. No original binaries are uploaded or stored until the real vault phase."
    >
      <ImportDropzone />
      <div className="border-navy-700 bg-navy-900/40 mt-8 rounded-2xl border p-5">
        <h2 className="text-lg font-semibold text-white">
          Planned ingest pipeline (future)
        </h2>
        <ol className="text-silver-300 mt-3 list-decimal space-y-1 pl-5 text-sm">
          <li>Upload binary to immutable private vault (checksummed)</li>
          <li>Analyze (quality, boat, damage, repair, privacy, tags)</li>
          <li>Score (0–100 marketing / SEO / commercial / …)</li>
          <li>Detect duplicates & QC issues (recommendations only)</li>
          <li>Queue for owner approval — never auto-publish</li>
        </ol>
        <p className="text-silver-500 mt-3 text-xs">
          Current foundation creates metadata rows only for testing.
        </p>
      </div>
    </MediaShell>
  );
}
