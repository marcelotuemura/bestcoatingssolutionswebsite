'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { archiveCorpusAction } from '@/app/media/corpus-actions';

export function ArchiveCorpusButton({
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
      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
      data-testid="archive-corpus"
      onClick={() => {
        startTransition(async () => {
          const result = await archiveCorpusAction({ corpusId });
          if (result.ok) {
            router.refresh();
          }
        });
      }}
    >
      {pending ? 'Archiving…' : 'Archive corpus'}
    </button>
  );
}
