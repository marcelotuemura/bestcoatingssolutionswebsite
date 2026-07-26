'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createCorpusAction } from '@/app/media/corpus-actions';

const INTENDED_USES = [
  'damage_detection',
  'estimate_assist',
  'quality_scoring',
  'privacy_detection',
  'general_evaluation',
  'other',
] as const;

export function CorpusCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="border-navy-700 media-light:border-slate-200 space-y-3 rounded-xl border p-4"
      data-testid="corpus-create-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await createCorpusAction({
            name: String(form.get('name') ?? ''),
            description: String(form.get('description') ?? ''),
            intendedUse: String(
              form.get('intendedUse') ?? 'general_evaluation',
            ),
          });
          if (!result.ok) {
            setError(result.error ?? 'Failed to create corpus');
            return;
          }
          router.push(`/media/corpora/${result.corpusId}`);
          router.refresh();
        });
      }}
    >
      <label className="block space-y-1 text-sm">
        <span>Corpus name</span>
        <input
          name="name"
          required
          maxLength={160}
          className="border-navy-700 bg-navy-900 media-light:border-slate-300 media-light:bg-white w-full rounded-lg border px-3 py-2"
          data-testid="corpus-name-input"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Description</span>
        <textarea
          name="description"
          rows={2}
          className="border-navy-700 bg-navy-900 media-light:border-slate-300 media-light:bg-white w-full rounded-lg border px-3 py-2"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Intended use</span>
        <select
          name="intendedUse"
          defaultValue="general_evaluation"
          className="border-navy-700 bg-navy-900 media-light:border-slate-300 media-light:bg-white w-full rounded-lg border px-3 py-2"
        >
          {INTENDED_USES.map((use) => (
            <option key={use} value={use}>
              {use}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-sm text-red-400" data-testid="corpus-create-error">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-electric-500 hover:bg-electric-400 text-navy-950 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
        data-testid="corpus-create-submit"
      >
        {pending ? 'Creating…' : 'Create draft corpus'}
      </button>
    </form>
  );
}
