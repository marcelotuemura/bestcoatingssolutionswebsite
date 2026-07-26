'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UploadStatus =
  'pending' | 'uploading' | 'done' | 'error' | 'duplicate' | 'cancelled';

type UploadFile = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
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

function uploadWithProgress(
  file: File,
  workspaceId: string,
  onProgress: (pct: number) => void,
  signal: AbortSignal,
): Promise<{
  ok: boolean;
  assetId?: string;
  checksum?: string;
  duplicate?: boolean;
  error?: string;
}> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/media/api/upload');
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const data = (xhr.response ?? {}) as {
        ok?: boolean;
        outcome?: string;
        assetId?: string;
        checksum?: string;
        duplicate?: boolean;
        error?: string;
      };
      if (xhr.status >= 200 && xhr.status < 300 && data.ok && data.assetId) {
        resolve({
          ok: true,
          assetId: data.assetId,
          checksum: data.checksum,
          duplicate:
            data.duplicate === true || data.outcome === 'duplicate_existing',
        });
        return;
      }
      resolve({
        ok: false,
        error: data.error ?? `Upload failed (${xhr.status})`,
      });
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));

    const onAbort = () => xhr.abort();
    signal.addEventListener('abort', onAbort, { once: true });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspaceId);
    formData.append('filename', file.name);
    xhr.send(formData);
  });
}

export function UploadDropzone({ workspaceId = 'bcs-default' }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortMap = useRef(new Map<string, AbortController>());

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadFile[] = [];
    for (const file of incoming) {
      newFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: 'pending',
        progress: 0,
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

  const removeFile = (id: string) => {
    abortMap.current.get(id)?.abort();
    abortMap.current.delete(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const cancelFile = (id: string) => {
    abortMap.current.get(id)?.abort();
    abortMap.current.delete(id);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'cancelled', progress: 0 } : f,
      ),
    );
  };

  const runUpload = async (uf: UploadFile) => {
    const abortController = new AbortController();
    abortMap.current.set(uf.id, abortController);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uf.id
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f,
      ),
    );

    try {
      const result = await uploadWithProgress(
        uf.file,
        workspaceId,
        (pct) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === uf.id ? { ...f, progress: pct } : f)),
          );
        },
        abortController.signal,
      );

      if (result.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uf.id
              ? {
                  ...f,
                  status: result.duplicate ? 'duplicate' : 'done',
                  progress: 100,
                  assetId: result.assetId,
                  checksum: result.checksum,
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
                  error: result.error ?? 'Upload failed',
                }
              : f,
          ),
        );
      }
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError';
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uf.id
            ? {
                ...f,
                status: aborted ? 'cancelled' : 'error',
                error: aborted
                  ? undefined
                  : err instanceof Error
                    ? err.message
                    : 'Network error',
              }
            : f,
        ),
      );
    } finally {
      abortMap.current.delete(uf.id);
    }
  };

  const uploadAll = async () => {
    const pending = files.filter(
      (f) => f.status === 'pending' || f.status === 'error',
    );
    if (pending.length === 0) return;
    setUploading(true);
    for (const uf of pending) {
      await runUpload(uf);
    }
    setUploading(false);
    router.refresh();
  };

  const retryFile = async (id: string) => {
    const target = files.find((f) => f.id === id);
    if (!target) return;
    setUploading(true);
    await runUpload({ ...target, status: 'pending', progress: 0 });
    setUploading(false);
    router.refresh();
  };

  const pendingCount = files.filter(
    (f) => f.status === 'pending' || f.status === 'error',
  ).length;
  const doneCount = files.filter(
    (f) => f.status === 'done' || f.status === 'duplicate',
  ).length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;

  const overallProgress = useMemo(() => {
    if (files.length === 0) return 0;
    const sum = files.reduce((acc, f) => {
      if (f.status === 'done' || f.status === 'duplicate') return acc + 100;
      if (f.status === 'uploading') return acc + f.progress;
      return acc;
    }, 0);
    return Math.round(sum / files.length);
  }, [files]);

  return (
    <div className="space-y-4" data-testid="upload-dropzone">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
          dragging
            ? 'border-electric-500 bg-electric-500/10'
            : 'border-navy-600 bg-navy-900/40 hover:border-navy-500'
        }`}
        aria-label="Drop files here"
        data-testid="drop-zone"
      >
        <div className="bg-navy-950/80 border-navy-700 mb-4 flex h-14 w-14 items-center justify-center rounded-full border">
          <svg
            className="text-electric-400 h-7 w-7"
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
        </div>
        <p className="text-silver-100 text-sm font-medium">
          Drag and drop images or videos here
        </p>
        <p className="text-silver-500 mt-1 max-w-md text-center text-xs">
          JPEG, PNG, WebP, HEIC, TIFF, BMP · MP4, MOV · max 500 MB per file
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-navy-600 text-silver-200 hover:border-electric-500 bg-navy-950/60 mt-5 rounded-lg border px-4 py-2 text-sm transition hover:text-white"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/tiff,image/bmp,video/mp4,video/quicktime"
          onChange={onInputChange}
          data-testid="file-input"
        />
      </div>

      {files.length > 0 ? (
        <div className="space-y-3">
          <div
            className="border-navy-700 bg-navy-900/40 rounded-2xl border p-4"
            data-testid="upload-overall-progress"
          >
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-silver-300">
                Overall progress
                {uploadingCount > 0 ? ` · ${uploadingCount} uploading` : ''}
              </span>
              <span className="text-electric-400 font-medium">
                {overallProgress}%
              </span>
            </div>
            <div className="bg-navy-950 h-2 overflow-hidden rounded-full">
              <div
                className="bg-electric-500 h-full rounded-full transition-[width] duration-200"
                style={{ width: `${overallProgress}%` }}
                role="progressbar"
                aria-valuenow={overallProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          <div
            className="border-navy-700 divide-navy-700 divide-y overflow-hidden rounded-2xl border"
            data-testid="upload-file-list"
          >
            {files.map((uf) => (
              <div
                key={uf.id}
                className="space-y-2 px-4 py-3"
                data-testid={`upload-file-${uf.status}`}
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">
                      {uf.file.name}
                    </p>
                    <p className="text-silver-500 mt-0.5 text-xs">
                      {formatSize(uf.file.size)}
                      {uf.checksum
                        ? ` · sha256: ${uf.checksum.slice(0, 12)}…`
                        : ''}
                      {uf.assetId ? ` · id: ${uf.assetId.slice(0, 20)}…` : ''}
                    </p>
                    {uf.error ? (
                      <p className="mt-0.5 text-xs text-red-400">{uf.error}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-xs">
                    {uf.status === 'pending' ? (
                      <span className="text-silver-500">Ready</span>
                    ) : uf.status === 'uploading' ? (
                      <span className="text-electric-400">
                        Uploading… {uf.progress}%
                      </span>
                    ) : uf.status === 'done' ? (
                      <span className="text-green-400">✓ Uploaded</span>
                    ) : uf.status === 'duplicate' ? (
                      <span className="text-amber-400">Duplicate</span>
                    ) : uf.status === 'cancelled' ? (
                      <span className="text-silver-500">Cancelled</span>
                    ) : (
                      <span className="text-red-400">Error</span>
                    )}
                  </div>
                  {uf.status === 'uploading' ? (
                    <button
                      type="button"
                      onClick={() => cancelFile(uf.id)}
                      className="text-silver-500 text-xs transition hover:text-amber-300"
                      aria-label="Cancel upload"
                    >
                      Cancel
                    </button>
                  ) : null}
                  {uf.status === 'error' || uf.status === 'cancelled' ? (
                    <button
                      type="button"
                      onClick={() => void retryFile(uf.id)}
                      className="text-electric-400 hover:text-electric-300 text-xs transition"
                      aria-label="Retry upload"
                      data-testid="upload-retry"
                    >
                      Retry
                    </button>
                  ) : null}
                  {uf.status === 'pending' ||
                  uf.status === 'error' ||
                  uf.status === 'cancelled' ? (
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
                {uf.status === 'uploading' || uf.status === 'done' ? (
                  <div className="bg-navy-950 h-1.5 overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full transition-[width] duration-150 ${uf.status === 'done' ? 'bg-green-500' : 'bg-electric-500'}`}
                      style={{ width: `${uf.progress}%` }}
                      data-testid="upload-file-progress"
                    />
                  </div>
                ) : null}
                {uf.status === 'done' && uf.assetId ? (
                  <Link
                    href={`/media/assets/${uf.assetId}`}
                    className="text-electric-400 text-xs hover:underline"
                  >
                    Open preview →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {pendingCount > 0 ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => void uploadAll()}
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
        <p className="text-silver-300 text-sm" data-testid="upload-complete">
          Upload complete. {doneCount} asset{doneCount === 1 ? '' : 's'} added
          to the gallery.{' '}
          <Link
            href="/media/library?source=workspace"
            className="text-electric-400 hover:underline"
          >
            View gallery →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
