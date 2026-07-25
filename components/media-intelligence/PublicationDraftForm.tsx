'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createPublicationDraftAction } from '@/app/media/publication-actions';

export function PublicationDraftForm({
  assetIds,
}: {
  readonly assetIds: readonly string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<
    'website' | 'social' | 'google_business'
  >('website');

  return (
    <form
      className="border-navy-700 media-light:border-slate-200 media-light:bg-white bg-navy-900/40 space-y-3 rounded-xl border p-4"
      data-testid="publication-draft-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const assetId = String(form.get('assetId') ?? '');
        const idempotencyKey = `draft-${assetId}-${target}-${Date.now()}`;
        let payload: unknown;
        if (target === 'website') {
          payload = {
            kind: 'website',
            placement: String(form.get('placement') ?? 'portfolio'),
            title: String(form.get('title') ?? ''),
            caption: String(form.get('caption') ?? ''),
            altText: String(form.get('altText') ?? ''),
            derivativeKind: 'webp',
          };
        } else if (target === 'social') {
          payload = {
            kind: 'social',
            platform: String(form.get('platform') ?? 'instagram'),
            destinationAccountRef: String(
              form.get('destination') ?? 'bcs-main',
            ),
            caption: String(form.get('caption') ?? ''),
            hashtags: [],
            campaignTags: [],
          };
        } else {
          payload = {
            kind: 'google_business',
            locationRef: String(form.get('destination') ?? 'bcs-ftl'),
            postType: 'update',
            summary: String(form.get('caption') ?? ''),
            ctaType: 'learn_more',
          };
        }
        setError(null);
        startTransition(async () => {
          const result = await createPublicationDraftAction({
            assetId,
            target,
            payload,
            idempotencyKey,
          });
          if (!result.ok) {
            setError(result.error ?? 'Failed to create draft');
            return;
          }
          if (result.jobId) {
            // Absolute /media path — never locale-prefixed.
            const href = `/media/publications/${result.jobId}`;
            router.push(href);
            // Hard fallback if client router stalls (e.g. first paint after create).
            window.setTimeout(() => {
              if (!window.location.pathname.endsWith(result.jobId)) {
                window.location.assign(href);
              }
            }, 750);
            return;
          }
          router.refresh();
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-silver-300 media-light:text-slate-600">
            Asset
          </span>
          <select
            name="assetId"
            required
            className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
            data-testid="publication-asset"
            defaultValue={assetIds[0] ?? ''}
          >
            {assetIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-silver-300 media-light:text-slate-600">
            Target
          </span>
          <select
            name="target"
            className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
            data-testid="publication-target"
            value={target}
            onChange={(e) => setTarget(e.target.value as typeof target)}
          >
            <option value="website">Website</option>
            <option value="social">Social</option>
            <option value="google_business">Google Business</option>
          </select>
        </label>
      </div>

      {target === 'website' ? (
        <label className="block text-sm">
          <span className="text-silver-300 media-light:text-slate-600">
            Placement
          </span>
          <select
            name="placement"
            className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
            defaultValue="portfolio"
          >
            <option value="portfolio">Portfolio</option>
            <option value="home_hero">Home hero</option>
            <option value="service_page">Service page</option>
            <option value="blog">Blog</option>
            <option value="gallery">Gallery</option>
            <option value="before_after">Before / after</option>
          </select>
        </label>
      ) : (
        <label className="block text-sm">
          <span className="text-silver-300 media-light:text-slate-600">
            Destination / account
          </span>
          <input
            name="destination"
            required
            defaultValue={target === 'social' ? 'bcs-main' : 'bcs-ftl'}
            className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
      )}

      {target === 'social' ? (
        <label className="block text-sm">
          <span className="text-silver-300 media-light:text-slate-600">
            Platform
          </span>
          <select
            name="platform"
            className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
            defaultValue="instagram"
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </label>
      ) : null}

      <label className="block text-sm">
        <span className="text-silver-300 media-light:text-slate-600">
          {target === 'website' ? 'Title' : 'Caption / summary'}
        </span>
        <input
          name={target === 'website' ? 'title' : 'caption'}
          required
          className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
          data-testid="publication-title"
          placeholder={
            target === 'website'
              ? 'Gelcoat restoration portfolio piece'
              : 'Before/after craftsmanship update'
          }
        />
      </label>

      {target === 'website' ? (
        <>
          <label className="block text-sm">
            <span className="text-silver-300 media-light:text-slate-600">
              Alt text
            </span>
            <input
              name="altText"
              required
              className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
              data-testid="publication-alt"
              placeholder="Sea Ray gelcoat after repair"
            />
          </label>
          <label className="block text-sm">
            <span className="text-silver-300 media-light:text-slate-600">
              Caption
            </span>
            <input
              name="caption"
              className="border-navy-600 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 bg-navy-950 mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
        </>
      ) : null}

      {error ? (
        <p
          className="text-sm text-red-300"
          role="alert"
          data-testid="publication-form-error"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || assetIds.length === 0}
        className="bg-electric-500 hover:bg-electric-400 text-navy-950 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        data-testid="publication-create"
      >
        {pending ? 'Creating…' : 'Create draft'}
      </button>
    </form>
  );
}
