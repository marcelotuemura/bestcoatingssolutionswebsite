'use client';

import { useCallback, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UploadFile = {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error' | 'duplicate';
  assetId?: string;
  checksum?: string;
  error?: string;
};

type Props = {
  readonly workspaceId?: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDropzone({ workspaceId = 'bcs-default' }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, startUpload] = useTransition();

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadFile[] = [];
    for (const file of incoming) {
      newFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: 'pending',
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = '';
    },
    [addFiles],
  );

  const uploadAll = () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (pending.length === 0) return;

    startUpload(async () => {
      for (const uf of pending) {
        setFiles((prev) =>
          prev.map((f) => (f.id === uf.id ? { ...f, status: 'uploading' } : f)),
        );

        const formData = new FormData();
        formData.append('file', uf.file);
        formData.append('workspaceId', workspaceId);
        formData.append('filename', uf.file.name);

        try {
          const res = await fetch('/media/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = (await res.json()) as {
            ok: boolean;
            assetId?: string;
            checksum?: string;
            duplicate?: boolean;
            error?: string;
          };
          if (data.ok) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uf.id
                  ? {
                      ...f,
                      status: data.duplicate ? 'duplicate' : 'done',
                      assetId: data.assetId,
                      checksum: data.checksum,
                    }
                  : f,
              ),
            );
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uf.id
                  ? {
                      ...f,
                      status: 'error',
                      error: data.error ?? 'Upload failed',
                    }
                  : f,
              ),
            );
          }
        } catch (err) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uf.id
                ? {
                    ...f,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Network error',
                  }
                : f,
            ),
          );
        }
      }
      router.refresh();
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const doneCount = files.filter(
    (f) => f.status === 'done' || f.status === 'duplicate',
  ).length;

  return (
    <div className="space-y-4" data-testid="upload-dropzone">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition ${
          dragging
            ? 'border-electric-500 bg-electric-500/5'
            : 'border-navy-700 hover:border-navy-600'
        }`}
        aria-label="Drop files here"
        data-testid="drop-zone"
      >
        <svg
          className="text-silver-600 mb-3 h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-silver-300 text-sm">
          Drag and drop images or videos here
        </p>
        <p className="text-silver-500 mt-1 text-xs">
          JPEG, PNG, WebP, HEIC, TIFF, BMP · MP4, MOV · max 500 MB per file
        </p>
        <label className="border-navy-700 text-silver-300 hover:border-electric-500 mt-4 cursor-pointer rounded-lg border px-4 py-2 text-sm transition hover:text-white">
          Browse files
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/tiff,image/bmp,video/mp4,video/quicktime"
            onChange={onInputChange}
            data-testid="file-input"
          />
        </label>
      </div>

      {/* File list */}
      {files.length > 0 ? (
        <div
          className="border-navy-700 divide-navy-700 divide-y overflow-hidden rounded-2xl border"
          data-testid="upload-file-list"
        >
          {files.map((uf) => (
            <div
              key={uf.id}
              className="flex items-center gap-3 px-4 py-3"
              data-testid={`upload-file-${uf.status}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{uf.file.name}</p>
                <p className="text-silver-500 mt-0.5 text-xs">
                  {formatSize(uf.file.size)}
                  {uf.checksum ? ` · sha256: ${uf.checksum.slice(0, 12)}…` : ''}
                  {uf.assetId ? ` · id: ${uf.assetId.slice(0, 20)}…` : ''}
                </p>
                {uf.error ? (
                  <p className="mt-0.5 text-xs text-red-400">{uf.error}</p>
                ) : null}
              </div>
              <div className="shrink-0">
                {uf.status === 'pending' ? (
                  <span className="text-silver-500 text-xs">Ready</span>
                ) : uf.status === 'uploading' ? (
                  <span className="text-electric-400 text-xs">Uploading…</span>
                ) : uf.status === 'done' ? (
                  <span className="text-xs text-green-400">✓ Uploaded</span>
                ) : uf.status === 'duplicate' ? (
                  <span className="text-xs text-amber-400">Duplicate</span>
                ) : (
                  <span className="text-xs text-red-400">Error</span>
                )}
              </div>
              {uf.status === 'pending' || uf.status === 'error' ? (
                <button
                  type="button"
                  onClick={() => removeFile(uf.id)}
                  className="text-silver-600 text-xs transition hover:text-red-400"
                  aria-label="Remove"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Upload button */}
      {pendingCount > 0 ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={uploadAll}
            disabled={uploading}
            className="bg-electric-500 hover:bg-electric-600 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
            data-testid="upload-submit"
          >
            {uploading
              ? 'Uploading…'
              : `Upload ${pendingCount} file${pendingCount === 1 ? '' : 's'}`}
          </button>
          {doneCount > 0 ? (
            <p className="text-silver-500 text-xs">
              {doneCount} file{doneCount === 1 ? '' : 's'} uploaded
            </p>
          ) : null}
        </div>
      ) : doneCount > 0 && files.every((f) => f.status !== 'pending') ? (
        <p className="text-silver-400 text-sm" data-testid="upload-complete">
          Upload complete. {doneCount} asset{doneCount === 1 ? '' : 's'} added
          to the gallery.{' '}
          <Link
            href="/media/library"
            className="text-electric-400 hover:underline"
          >
            View gallery →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
