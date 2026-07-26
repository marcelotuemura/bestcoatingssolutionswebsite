'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  addCorpusItemAction,
  approveCorpusVersionAction,
  assignCorpusSplitAction,
  cancelCorpusVersionAction,
  confirmCorpusLabelAction,
  generateCorpusExportAction,
  previewCorpusManifestAction,
  releaseCorpusVersionAction,
  reviewCorpusItemAction,
  submitCorpusVersionAction,
  suggestCorpusLabelAction,
} from '@/app/media/corpus-actions';
import type {
  MediaCorpusItem,
  MediaCorpusItemLabel,
  MediaCorpusVersion,
  ReleaseReadiness,
} from '@/lib/media-intelligence/corpora';

const SPLITS = ['train', 'validation', 'test', 'holdout'] as const;

export function CorpusVersionPanel({
  version,
  items,
  labelsByItem,
  readiness,
  assetIds,
  canDraft,
  canReview,
  canApprove,
  canRelease,
}: {
  readonly version: MediaCorpusVersion;
  readonly items: readonly MediaCorpusItem[];
  readonly labelsByItem: Record<string, MediaCorpusItemLabel[]>;
  readonly readiness: ReleaseReadiness;
  readonly assetIds: readonly string[];
  readonly canDraft: boolean;
  readonly canReview: boolean;
  readonly canApprove: boolean;
  readonly canRelease: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [manifestPreview, setManifestPreview] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setMessage(result.error ?? 'Action failed');
        return;
      }
      setMessage('Updated');
      router.refresh();
    });
  }

  return (
    <div className="space-y-8" data-testid="corpus-version-panel">
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          Version {version.versionNumber}{' '}
          <span className="text-silver-400 text-sm uppercase">
            {version.status}
          </span>
        </h2>
        <p className="text-silver-300 text-sm">{version.notes || 'No notes'}</p>
        {version.manifestChecksum ? (
          <p
            className="text-silver-500 text-xs"
            data-testid="manifest-checksum"
          >
            Manifest checksum: {version.manifestChecksum}
          </p>
        ) : null}
      </section>

      <section
        className="border-navy-700 space-y-2 rounded-xl border p-4"
        data-testid="release-readiness"
      >
        <h3 className="font-medium">Release readiness</h3>
        <p className="text-sm">
          {readiness.ready ? 'Ready' : 'Not ready'} · {readiness.includedItems}/
          {readiness.totalItems} included
        </p>
        {readiness.errors.length > 0 ? (
          <ul className="text-sm text-red-400" data-testid="readiness-errors">
            {readiness.errors.map((e) => (
              <li key={e.code}>
                Error: {e.code}
                {e.count != null ? ` (${e.count})` : ''}
              </li>
            ))}
          </ul>
        ) : null}
        {readiness.warnings.length > 0 ? (
          <ul
            className="text-sm text-amber-300"
            data-testid="readiness-warnings"
          >
            {readiness.warnings.map((e) => (
              <li key={e.code}>Warning: {e.code}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-2">
        {canApprove && version.status === 'building' ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border px-3 py-1.5 text-sm"
            data-testid="corpus-submit-version"
            onClick={() =>
              run(() => submitCorpusVersionAction({ versionId: version.id }))
            }
          >
            Submit for review
          </button>
        ) : null}
        {canApprove && version.status === 'review_ready' ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border px-3 py-1.5 text-sm"
            data-testid="corpus-approve-version"
            onClick={() =>
              run(() => approveCorpusVersionAction({ versionId: version.id }))
            }
          >
            Approve version
          </button>
        ) : null}
        {canRelease && version.status === 'approved' ? (
          <button
            type="button"
            disabled={pending}
            className="bg-electric-500 text-navy-950 rounded-lg px-3 py-1.5 text-sm font-medium"
            data-testid="corpus-release-version"
            onClick={() =>
              run(() => releaseCorpusVersionAction({ versionId: version.id }))
            }
          >
            Release (owner)
          </button>
        ) : null}
        {canRelease &&
        ['building', 'review_ready', 'approved'].includes(version.status) ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-300"
            data-testid="corpus-cancel-version"
            onClick={() =>
              run(() => cancelCorpusVersionAction({ versionId: version.id }))
            }
          >
            Cancel version
          </button>
        ) : null}
        <button
          type="button"
          disabled={pending}
          className="rounded-lg border px-3 py-1.5 text-sm"
          data-testid="corpus-preview-manifest"
          onClick={() =>
            startTransition(async () => {
              const result = await previewCorpusManifestAction({
                versionId: version.id,
              });
              if (!result.ok) {
                setMessage(result.error ?? 'Preview failed');
                return;
              }
              setManifestPreview(JSON.stringify(result.manifest, null, 2));
            })
          }
        >
          Preview manifest
        </button>
        {canApprove && version.status === 'released' ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border px-3 py-1.5 text-sm"
            data-testid="corpus-generate-export"
            onClick={() =>
              run(() => generateCorpusExportAction({ versionId: version.id }))
            }
          >
            Generate export record
          </button>
        ) : null}
      </div>

      {message ? (
        <p
          className="text-silver-300 text-sm"
          data-testid="corpus-action-message"
        >
          {message}
        </p>
      ) : null}

      {manifestPreview ? (
        <pre
          className="bg-navy-900 media-light:bg-slate-100 max-h-96 overflow-auto rounded-xl p-4 text-xs"
          data-testid="corpus-manifest-preview"
        >
          {manifestPreview}
        </pre>
      ) : null}

      {canDraft && version.status === 'building' ? (
        <form
          className="flex flex-wrap items-end gap-2"
          data-testid="corpus-add-item-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            run(() =>
              addCorpusItemAction({
                versionId: version.id,
                assetExternalId: String(form.get('assetId') ?? ''),
              }),
            );
          }}
        >
          <label className="text-sm">
            Add candidate asset
            <select
              name="assetId"
              className="border-navy-700 bg-navy-900 mt-1 block rounded-lg border px-3 py-2"
              data-testid="corpus-asset-select"
            >
              {assetIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={pending || assetIds.length === 0}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Add candidate
          </button>
        </form>
      ) : null}

      <section className="space-y-4" data-testid="corpus-item-queue">
        <h3 className="font-medium">Candidate / review queue</h3>
        {items.length === 0 ? (
          <p className="text-silver-400 text-sm">No items yet.</p>
        ) : (
          items.map((item) => {
            const labels = labelsByItem[item.id] ?? [];
            const aiLabels = labels.filter((l) => l.source === 'ai_suggested');
            const humanLabels = labels.filter(
              (l) => l.source === 'human_confirmed',
            );
            return (
              <article
                key={item.id}
                className="border-navy-700 space-y-3 rounded-xl border p-4"
                data-testid={`corpus-item-${item.id}`}
              >
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium">{item.assetExternalId}</p>
                    <p className="text-silver-400">
                      status={item.status} · privacy=
                      {item.privacyStatusSnapshot}
                      {item.isNearDuplicateSnapshot ? ' · near-duplicate' : ''}
                      {item.isExactDuplicateSnapshot
                        ? ' · exact-duplicate'
                        : ''}
                    </p>
                  </div>
                  <span className="text-silver-400 text-xs uppercase">
                    {item.datasetSplit ?? 'no split'}
                  </span>
                </div>

                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div data-testid={`ai-labels-${item.id}`}>
                    <p className="mb-1 font-medium text-amber-200">
                      AI suggestions (unconfirmed)
                    </p>
                    {aiLabels.length === 0 ? (
                      <p className="text-silver-500">None</p>
                    ) : (
                      <ul>
                        {aiLabels.map((l) => (
                          <li key={l.id}>
                            {l.labelKey}: {l.labelValue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div data-testid={`human-labels-${item.id}`}>
                    <p className="mb-1 font-medium text-emerald-300">
                      Human-confirmed labels
                    </p>
                    {humanLabels.length === 0 ? (
                      <p className="text-silver-500">None</p>
                    ) : (
                      <ul>
                        {humanLabels.map((l) => (
                          <li key={l.id}>
                            {l.labelKey}: {l.labelValue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {canDraft && version.status === 'building' ? (
                  <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      run(() =>
                        suggestCorpusLabelAction({
                          itemId: item.id,
                          labelKey: String(form.get('key') ?? ''),
                          labelValue: String(form.get('value') ?? ''),
                        }),
                      );
                    }}
                  >
                    <input
                      name="key"
                      placeholder="AI label key"
                      required
                      className="rounded border px-2 py-1 text-sm"
                    />
                    <input
                      name="value"
                      placeholder="AI label value"
                      required
                      className="rounded border px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded border px-2 py-1 text-sm"
                    >
                      Store AI suggestion
                    </button>
                  </form>
                ) : null}

                {canReview ? (
                  <form
                    className="flex flex-wrap gap-2"
                    data-testid={`confirm-label-form-${item.id}`}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      run(() =>
                        confirmCorpusLabelAction({
                          itemId: item.id,
                          labelKey: String(form.get('key') ?? ''),
                          labelValue: String(form.get('value') ?? ''),
                        }),
                      );
                    }}
                  >
                    <input
                      name="key"
                      placeholder="Confirmed key"
                      required
                      className="rounded border px-2 py-1 text-sm"
                      data-testid={`confirm-label-key-${item.id}`}
                    />
                    <input
                      name="value"
                      placeholder="Confirmed value"
                      required
                      className="rounded border px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded border px-2 py-1 text-sm"
                      data-testid={`confirm-label-submit-${item.id}`}
                    >
                      Confirm human label
                    </button>
                  </form>
                ) : null}

                {(canDraft || canReview) &&
                ['building', 'review_ready'].includes(version.status) ? (
                  <label className="block text-sm">
                    Dataset split
                    <select
                      className="ml-2 rounded border px-2 py-1"
                      data-testid={`split-select-${item.id}`}
                      value={item.datasetSplit ?? ''}
                      onChange={(event) => {
                        const split = event.target.value;
                        if (!split) return;
                        run(() =>
                          assignCorpusSplitAction({
                            itemId: item.id,
                            split,
                          }),
                        );
                      }}
                    >
                      <option value="">Select…</option>
                      {SPLITS.map((split) => (
                        <option key={split} value={split}>
                          {split}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {canReview &&
                ['building', 'review_ready'].includes(version.status) ? (
                  <div className="flex flex-wrap gap-2">
                    {item.isNearDuplicateSnapshot &&
                    !item.nearDuplicateAcknowledged ? (
                      <button
                        type="button"
                        className="rounded border border-amber-400/50 px-2 py-1 text-sm text-amber-200"
                        data-testid={`ack-near-dup-${item.id}`}
                        onClick={() =>
                          run(() =>
                            reviewCorpusItemAction({
                              itemId: item.id,
                              decision: 'acknowledge_near_duplicate',
                            }),
                          )
                        }
                      >
                        Acknowledge near-duplicate
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      data-testid={`include-item-${item.id}`}
                      onClick={() =>
                        run(() =>
                          reviewCorpusItemAction({
                            itemId: item.id,
                            decision: 'include',
                          }),
                        )
                      }
                    >
                      Include
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      data-testid={`exclude-item-${item.id}`}
                      onClick={() =>
                        run(() =>
                          reviewCorpusItemAction({
                            itemId: item.id,
                            decision: 'exclude',
                            notes: 'Excluded by reviewer',
                          }),
                        )
                      }
                    >
                      Exclude
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
