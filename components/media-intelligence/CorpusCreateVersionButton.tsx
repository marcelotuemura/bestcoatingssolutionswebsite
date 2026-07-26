'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createCorpusVersionAction } from '@/app/media/corpus-actions';

export function CreateVersionButton({
  corpusId,
}: {
  readonly corpusId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-lg border px-3 py-1.5 text-sm"
      data-testid="create-corpus-version"
      onClick={() => {
        startTransition(async () => {
          const result = await createCorpusVersionAction({
            corpusId,
            notes: 'New version after prior release or revision',
          });
          if (result.ok && result.versionId) {
            router.push(
              `/media/corpora/${corpusId}/versions/${result.versionId}`,
            );
            router.refresh();
          }
        });
      }}
    >
      {pending ? 'Creating…' : 'Create new version'}
    </button>
  );
}
