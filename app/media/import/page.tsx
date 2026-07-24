import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { ImportDropzone } from '@/components/media-intelligence/ImportDropzone';

export default function MediaImportPage() {
  return (
    <MediaShell
      title="Import Engine"
      subtitle="Ingest from folder, drag & drop, camera, phone, SD card, drives, and future cloud adapters. Every file is analyzed. Originals are never modified."
    >
      <ImportDropzone />
      <div className="border-navy-700 bg-navy-900/40 mt-8 rounded-2xl border p-5">
        <h2 className="text-lg font-semibold text-white">Import pipeline</h2>
        <ol className="text-silver-300 mt-3 list-decimal space-y-1 pl-5 text-sm">
          <li>Preserve original (write-once vault)</li>
          <li>Analyze (quality, boat, damage, repair, privacy, tags)</li>
          <li>Score (0–100 marketing / SEO / commercial / …)</li>
          <li>Detect duplicates & QC issues (recommendations only)</li>
          <li>Queue for owner approval — never auto-publish</li>
        </ol>
      </div>
    </MediaShell>
  );
}
