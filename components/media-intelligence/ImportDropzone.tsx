'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { importMediaFilesAction } from '@/app/media/actions';

export function ImportDropzone() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    startTransition(async () => {
      const result = await importMediaFilesAction({
        files: files.map((file) => ({
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          bytes: file.size,
        })),
      });
      setMessage(
        result.ok
          ? `Imported and analyzed ${result.imported} file(s). Originals preserved.`
          : (result.error ?? 'Import failed'),
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <label
        className="border-navy-700 hover:border-electric-500/60 bg-navy-900/40 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center transition"
        data-testid="media-import-dropzone"
      >
        <span className="text-lg font-medium text-white">
          Drag & drop or choose files
        </span>
        <span className="text-silver-500 mt-2 max-w-md text-sm">
          Folder, camera roll, SD card, and cloud downloads all land here.
          Originals are stored write-once. Analysis runs on every file — nothing
          is skipped.
        </span>
        <input
          type="file"
          multiple
          accept="image/*,video/mp4,video/quicktime,.heic,.tif,.tiff,.bmp,.raw"
          className="sr-only"
          onChange={(event) => onFiles(event.target.files)}
        />
      </label>
      <p className="text-silver-500 text-xs">
        Supported: JPG, JPEG, PNG, WEBP, HEIC, RAW, TIFF, BMP, MP4, MOV. Future
        adapters: Google Drive, OneDrive, Dropbox.
      </p>
      {pending ? (
        <p className="text-electric-400 text-sm">Analyzing import batch…</p>
      ) : null}
      {message ? (
        <p className="text-silver-300 text-sm" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
