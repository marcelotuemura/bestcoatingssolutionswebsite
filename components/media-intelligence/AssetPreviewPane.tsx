'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GalleryAsset } from '@/lib/media-intelligence/gallery/types';
import {
  updateGalleryMetadataAction,
  reviewGalleryAssetAction,
} from '@/app/media/gallery-actions';
import { FavoriteToggle } from '@/components/media-intelligence/FavoriteToggle';

type Props = {
  readonly asset: GalleryAsset;
  readonly prevId?: string | null;
  readonly nextId?: string | null;
};

function MetaRow({
  label,
  value,
}: {
  label: string;
  value?: string | null | number;
}) {
  if (value == null || value === '') return null;
  return (
    <div>
      <dt className="text-silver-500 text-xs">{label}</dt>
      <dd className="text-silver-200 text-sm break-words">{String(value)}</dd>
    </div>
  );
}

export function AssetPreviewPane({ asset, prevId, nextId }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(asset.displayTitle ?? '');
  const [description, setDescription] = useState(asset.description ?? '');
  const [location, setLocation] = useState(asset.location ?? '');
  const [creatorName, setCreatorName] = useState(asset.creatorName ?? '');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [reviewing, startReview] = useTransition();
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(true);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setPreviewFailed(false);
    setZoom(1);
    setFit(true);
    setTitle(asset.displayTitle ?? '');
    setDescription(asset.description ?? '');
    setLocation(asset.location ?? '');
    setCreatorName(asset.creatorName ?? '');
  }, [
    asset.externalId,
    asset.displayTitle,
    asset.description,
    asset.location,
    asset.creatorName,
  ]);

  const handleSave = () => {
    setEditError(null);
    startSave(async () => {
      const result = await updateGalleryMetadataAction({
        externalId: asset.externalId,
        metadata: {
          displayTitle: title,
          description,
          location,
          creatorName,
        },
      });
      if (!result.ok) {
        setEditError(result.error ?? 'Save failed');
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const handleReview = (decision: 'approve' | 'reject' | 'in_review') => {
    setReviewMsg(null);
    startReview(async () => {
      const result = await reviewGalleryAssetAction({
        assetExternalId: asset.externalId,
        decision,
      });
      if (!result.ok) {
        setReviewMsg(result.error ?? 'Review failed');
        return;
      }
      setReviewMsg(`Marked as ${decision}`);
      router.refresh();
    });
  };

  const onKeyNav = useCallback(
    (event: KeyboardEvent) => {
      if (editing) return;
      if (event.key === 'ArrowLeft' && prevId) {
        router.push(`/media/assets/${prevId}`);
      }
      if (event.key === 'ArrowRight' && nextId) {
        router.push(`/media/assets/${nextId}`);
      }
    },
    [editing, nextId, prevId, router],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyNav);
    return () => window.removeEventListener('keydown', onKeyNav);
  }, [onKeyNav]);

  const isImage = asset.mediaKind === 'image';
  const isVideo = asset.mediaKind === 'video';
  const previewSrc = `/media/vault/${encodeURIComponent(asset.externalId)}/preview`;
  const originalSrc = `/media/vault/${encodeURIComponent(asset.externalId)}/original`;

  return (
    <div
      className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"
      data-testid="asset-preview-pane"
    >
      <section className="border-navy-700 bg-navy-900/40 rounded-2xl border p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {prevId ? (
            <Link
              href={`/media/assets/${prevId}`}
              className="border-navy-700 text-silver-300 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
              data-testid="preview-prev"
            >
              ← Previous
            </Link>
          ) : null}
          {nextId ? (
            <Link
              href={`/media/assets/${nextId}`}
              className="border-navy-700 text-silver-300 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
              data-testid="preview-next"
            >
              Next →
            </Link>
          ) : null}
          {isImage ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setFit(true);
                  setZoom(1);
                }}
                className="border-navy-700 text-silver-300 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
                data-testid="preview-fit"
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => {
                  setFit(false);
                  setZoom((z) => Math.min(4, z + 0.25));
                }}
                className="border-navy-700 text-silver-300 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
                data-testid="preview-zoom-in"
              >
                Zoom +
              </button>
              <button
                type="button"
                onClick={() => {
                  setFit(false);
                  setZoom((z) => Math.max(0.5, z - 0.25));
                }}
                className="border-navy-700 text-silver-300 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
                data-testid="preview-zoom-out"
              >
                Zoom −
              </button>
            </>
          ) : null}
          <a
            href={originalSrc}
            download={asset.originalFilename}
            className="border-navy-700 text-silver-300 hover:border-electric-500 ml-auto rounded-lg border px-3 py-1.5 text-xs transition"
            data-testid="download-original"
          >
            Download original
          </a>
        </div>

        <div
          className="bg-navy-950 flex max-h-[70vh] min-h-[240px] items-center justify-center overflow-auto rounded-xl"
          data-testid="asset-preview"
        >
          {previewFailed ? (
            <p className="text-silver-500 px-4 text-center text-sm">
              Preview unavailable. The private object may be missing or you may
              lack access.
            </p>
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt={asset.displayTitle ?? asset.originalFilename}
              className={`origin-center transition-transform duration-200 motion-reduce:transition-none ${fit ? 'max-h-[70vh] w-auto max-w-full object-contain' : ''}`}
              style={fit ? undefined : { transform: `scale(${zoom})` }}
              onError={() => setPreviewFailed(true)}
            />
          ) : isVideo ? (
            <video
              src={previewSrc}
              controls
              playsInline
              className="max-h-[70vh] w-full"
              onError={() => setPreviewFailed(true)}
            >
              <track kind="captions" />
            </video>
          ) : (
            <p className="text-silver-500 text-sm">Unsupported media kind.</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <FavoriteToggle
            assetExternalId={asset.externalId}
            workspaceId={asset.workspaceId}
            initialFavorite={asset.isFavorite ?? false}
          />
          {asset.privacyStatus === 'clear' && !asset.archivedAt ? (
            <Link
              href={`/media/publications?assetId=${asset.externalId}`}
              className="border-electric-500 text-electric-400 hover:bg-electric-500/10 rounded-lg border px-3 py-1.5 text-xs transition"
              data-testid="prepare-publication-btn"
            >
              Prepare publication draft
            </Link>
          ) : (
            <span
              className="rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs text-amber-200"
              data-testid="publication-blocked-badge"
            >
              Publication blocked
            </span>
          )}
        </div>
      </section>

      <section className="border-navy-700 bg-navy-900/40 space-y-4 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Details</h2>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="border-navy-700 text-silver-300 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-xs transition"
              data-testid="edit-metadata-btn"
            >
              Edit
            </button>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-3" data-testid="metadata-form">
            <div>
              <label className="text-silver-400 text-xs" htmlFor="edit-title">
                Title
              </label>
              <input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-navy-700 bg-navy-950 focus:border-electric-500 mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                data-testid="edit-title"
              />
            </div>
            <div>
              <label
                className="text-silver-400 text-xs"
                htmlFor="edit-description"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-navy-700 bg-navy-950 focus:border-electric-500 mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                data-testid="edit-description"
              />
            </div>
            <div>
              <label
                className="text-silver-400 text-xs"
                htmlFor="edit-location"
              >
                Location
              </label>
              <input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-navy-700 bg-navy-950 focus:border-electric-500 mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                data-testid="edit-location"
              />
            </div>
            <div>
              <label className="text-silver-400 text-xs" htmlFor="edit-creator">
                Creator
              </label>
              <input
                id="edit-creator"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="border-navy-700 bg-navy-950 focus:border-electric-500 mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                data-testid="edit-creator"
              />
            </div>
            {editError ? (
              <p className="text-xs text-red-400" data-testid="edit-error">
                {editError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-electric-500 hover:bg-electric-600 rounded-lg px-4 py-2 text-sm text-white transition disabled:opacity-50"
                data-testid="save-metadata-btn"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="border-navy-700 text-silver-300 rounded-lg border px-4 py-2 text-sm transition hover:text-white"
                data-testid="cancel-edit-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="space-y-3">
            <MetaRow label="Title" value={asset.displayTitle} />
            <MetaRow label="Filename" value={asset.originalFilename} />
            <MetaRow
              label="Type"
              value={`${asset.fileType} · ${asset.mediaKind}`}
            />
            <MetaRow
              label="Size"
              value={`${Math.round(asset.fileSizeBytes / 1024)} KB`}
            />
            {asset.width && asset.height ? (
              <MetaRow
                label="Dimensions"
                value={`${asset.width}×${asset.height}`}
              />
            ) : null}
            <MetaRow label="Uploader" value={asset.createdBy} />
            <MetaRow label="Uploaded" value={asset.createdAt} />
            <MetaRow label="Description" value={asset.description} />
            <MetaRow label="Location" value={asset.location} />
            <MetaRow label="Creator" value={asset.creatorName} />
            <MetaRow label="Capture date" value={asset.captureDate} />
            <MetaRow label="Privacy" value={asset.privacyStatus} />
            <MetaRow label="Review status" value={asset.reviewStatus} />
            <MetaRow
              label="Checksum"
              value={`${asset.checksum.slice(0, 20)}…`}
            />
            {asset.tags?.length ? (
              <div>
                <dt className="text-silver-500 text-xs">Tags</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-navy-700 rounded px-2 py-0.5 text-xs text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        {asset.reviewStatus === 'pending' ||
        asset.reviewStatus === 'in_review' ? (
          <div
            className="border-navy-700 space-y-2 border-t pt-4"
            data-testid="review-actions"
          >
            <p className="text-silver-400 text-xs font-medium">Review</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleReview('approve')}
                disabled={reviewing}
                className="rounded-lg bg-green-600/20 px-3 py-1.5 text-xs text-green-300 transition hover:bg-green-600/30 disabled:opacity-50"
                data-testid="approve-btn"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleReview('reject')}
                disabled={reviewing}
                className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-600/30 disabled:opacity-50"
                data-testid="reject-btn"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleReview('in_review')}
                disabled={reviewing}
                className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs text-blue-300 transition hover:bg-blue-600/30 disabled:opacity-50"
                data-testid="in-review-btn"
              >
                Mark in review
              </button>
            </div>
            {reviewMsg ? (
              <p className="text-silver-400 text-xs" data-testid="review-msg">
                {reviewMsg}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
