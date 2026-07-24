'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { importMediaMetadataAction } from '@/app/media/actions';

export function ImportDropzone() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [filename, setFilename] = useState('');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!filename.trim()) return;
    startTransition(async () => {
      const result = await importMediaMetadataAction({
        files: [
          {
            filename: filename.trim(),
            mimeType: 'image/jpeg',
            bytes: 1_000_000,
          },
        ],
      });
      setMessage(
        result.ok
          ? `Metadata record created for foundation testing (${result.created}). No original file was uploaded or stored.`
          : (result.error ?? 'Simulation failed'),
      );
      setFilename('');
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
        role="status"
        data-testid="media-import-simulation-banner"
      >
        <p className="font-medium">
          Foundation simulation — no original files are uploaded or stored.
        </p>
        <p className="mt-1 text-xs">
          Do not select confidential production photos here. The real vault
          (binary upload, checksums, immutable storage, derivatives) is a later
          phase. Demo seeds are non-client data.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="border-navy-700 bg-navy-900/40 space-y-4 rounded-2xl border border-dashed px-6 py-10"
        data-testid="media-import-dropzone"
      >
        <h2 className="text-lg font-medium text-white">
          Create metadata-only test record
        </h2>
        <p className="text-silver-500 max-w-2xl text-sm">
          Enter a filename to simulate analysis. File bytes are not transmitted.
          This creates a library metadata row for foundation testing only.
        </p>
        <label className="block text-sm">
          <span className="text-silver-400">Simulated filename</span>
          <input
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            placeholder="demo_sea_ray_before_gelcoat.jpg"
            className="border-navy-700 bg-navy-950 text-silver-100 mt-2 w-full rounded-xl border px-3 py-2 text-sm"
            data-testid="media-import-filename"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !filename.trim()}
          className="bg-electric-500 hover:bg-electric-400 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          data-testid="media-import-submit"
        >
          {pending ? 'Creating metadata…' : 'Create metadata record'}
        </button>
      </form>

      {message ? (
        <p
          className="text-silver-300 text-sm"
          role="status"
          data-testid="media-import-message"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
