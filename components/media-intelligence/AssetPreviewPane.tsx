'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { GalleryAsset } from '@/lib/media-intelligence/gallery/types';
import {
  updateGalleryMetadataAction,
  reviewGalleryAssetAction,
} from '@/app/media/gallery-actions';
import { FavoriteToggle } from '@/components/media-intelligence/FavoriteToggle';

type Props = {
  readonly asset: GalleryAsset;
};

function MetaRow({
  label,
  value,
}: {
  label: string;
  value?: string | null | number;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-silver-500 text-xs">{label}</dt>
      <dd className="text-silver-200 text-sm">{String(value)}</dd>
    </div>
  );
}

export function AssetPreviewPane({ asset }: Props) {
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

  const isImage = asset.mediaKind === 'image';

  return (
    <div
      className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"
      data-testid="asset-preview-pane"
    >
      {/* Preview area */}
      <section className="border-navy-700 bg-navy-900/40 rounded-2xl border p-5">
        <div
          className="bg-navy-950 flex aspect-video items-center justify-center overflow-hidden rounded-xl"
          data-testid="asset-preview"
        >
          {isImage ? (
            <span className="text-silver-600 text-sm">
              Image preview (vault access required)
            </span>
          ) : (
            <span className="text-silver-600 text-sm">
              Video preview (vault access required)
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FavoriteToggle
            assetExternalId={asset.externalId}
            workspaceId={asset.workspaceId}
            initialFavorite={asset.isFavorite ?? false}
          />
        </div>
      </section>

      {/* Metadata & controls */}
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
              <label className="text-silver-400 text-xs">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-navy-700 bg-navy-950 focus:border-electric-500 mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                data-testid="edit-title"
              />
            </div>
            <div>
              <label className="text-silver-400 text-xs">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-navy-700 bg-navy-950 focus:border-electric-500 mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                data-testid="edit-description"
              />
            </div>
            <div>
              <label className="text-silver-400 text-xs">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-navy-700 bg-navy-950 focus:border-electric-500 mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                data-testid="edit-location"
              />
            </div>
            <div>
              <label className="text-silver-400 text-xs">Creator</label>
              <input
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
            <MetaRow label="Description" value={asset.description} />
            <MetaRow label="Location" value={asset.location} />
            <MetaRow label="Creator" value={asset.creatorName} />
            <MetaRow label="Capture date" value={asset.captureDate} />
            <MetaRow label="Privacy" value={asset.privacyStatus} />
            <MetaRow label="Review status" value={asset.reviewStatus} />
            <MetaRow
              label="Checksum"
              value={asset.checksum.slice(0, 20) + '…'}
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

        {/* Review actions */}
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
