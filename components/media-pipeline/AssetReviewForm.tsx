'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveInventoryReviewAction } from '@/app/media/inventory-actions';
import type { MediaAssetRecord } from '@/lib/media-pipeline/types';

const STAGES = [
  'before',
  'damage',
  'disassembly',
  'preparation',
  'fairing',
  'fiberglass',
  'masking',
  'primer',
  'paint',
  'gelcoat',
  'polishing',
  'ceramic-coating',
  'completed',
  'unknown',
] as const;

const CATEGORIES = [
  'hull',
  'hardtop',
  'deck',
  'interior',
  'detail',
  'process',
  'result',
  'context',
  'unknown',
] as const;

const PRIVACY_FLAGS = [
  ['visibleFace', 'Visible face'],
  ['vesselRegistration', 'Vessel registration'],
  ['hin', 'HIN'],
  ['licensePlate', 'License plate'],
  ['customerDocument', 'Customer document'],
  ['invoice', 'Invoice'],
  ['address', 'Address'],
  ['gpsMetadata', 'GPS metadata'],
  ['otherPrivateInformation', 'Other private information'],
] as const;

export function AssetReviewForm({
  asset,
}: {
  readonly asset: MediaAssetRecord;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await saveInventoryReviewAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage('Review saved.');
      router.refresh();
    });
  }

  const field =
    'border-border/70 bg-surface/40 w-full rounded-md border px-3 py-2 text-sm';

  return (
    <form
      action={onSubmit}
      className="space-y-6"
      data-testid="asset-review-form"
    >
      <input type="hidden" name="assetId" value={asset.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-muted">Division</span>
          <select
            name="division"
            defaultValue={asset.division}
            className={field}
          >
            <option value="marine">marine</option>
            <option value="aviation">aviation</option>
            <option value="commercial">commercial</option>
            <option value="unknown">unknown</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-muted">Stage</span>
          <select name="stage" defaultValue={asset.stage} className={field}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-muted">Category</span>
          <select
            name="category"
            defaultValue={asset.category}
            className={field}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-muted">Status</span>
          <select name="status" defaultValue={asset.status} className={field}>
            {[
              'imported',
              'analyzing',
              'needs-review',
              'approved',
              'rejected',
              'published',
              'archived',
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-muted">Privacy status</span>
          <select
            name="privacyStatus"
            defaultValue={asset.privacyStatus}
            className={field}
          >
            <option value="unchecked">unchecked</option>
            <option value="clear">clear</option>
            <option value="review-required">review-required</option>
            <option value="blocked">blocked</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-muted">Quality status</span>
          <select
            name="qualityStatus"
            defaultValue={asset.qualityStatus}
            className={field}
          >
            {[
              'unchecked',
              'acceptable',
              'blurry',
              'duplicate',
              'low-resolution',
              'overexposed',
              'underexposed',
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-muted">Publish status</span>
          <select
            name="publishStatus"
            defaultValue={asset.publishStatus}
            className={field}
            data-testid="publish-status"
          >
            <option value="not-published">not-published</option>
            <option value="candidate">candidate</option>
            <option value="queued">queued</option>
            <option value="published">published</option>
            <option value="unpublished">unpublished</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="heroCandidate"
            defaultChecked={asset.heroCandidate}
            value="true"
          />
          Hero candidate
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={asset.featured}
            value="true"
          />
          Featured
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Alt text</span>
        <textarea
          name="altText"
          defaultValue={asset.altText ?? ''}
          rows={2}
          className={field}
          placeholder="Outcome + context only — no invented customer claims"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Caption</span>
        <textarea
          name="caption"
          defaultValue={asset.caption ?? ''}
          rows={2}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">Notes</span>
        <textarea
          name="notes"
          defaultValue={asset.notes ?? ''}
          rows={3}
          className={field}
        />
      </label>

      <fieldset
        className="border-border/60 space-y-2 rounded-lg border p-4"
        data-testid="privacy-checklist"
      >
        <legend className="px-1 text-sm font-medium">Privacy checklist</legend>
        <p className="text-text-muted text-xs">
          Manual flags only. GPS detection is heuristic. No OCR/face claims.
        </p>
        {PRIVACY_FLAGS.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={`privacy_${key}`}
              value="true"
              defaultChecked={Boolean(
                asset.privacyChecklist[
                  key as keyof typeof asset.privacyChecklist
                ],
              )}
            />
            {label}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="privacyReviewed" value="true" />
          Mark privacy checklist reviewed now
        </label>
      </fieldset>

      {error ? (
        <p className="text-sm text-red-600" data-testid="review-error">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-700" data-testid="review-success">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-navy hover:bg-brand-navy/90 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        data-testid="review-save"
      >
        {pending ? 'Saving…' : 'Save review'}
      </button>
    </form>
  );
}
