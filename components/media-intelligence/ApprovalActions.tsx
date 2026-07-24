'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { transitionMediaAssetAction } from '@/app/media/actions';
import type { AssetWorkflowStatus } from '@/lib/media-intelligence/schemas';

const actions: Array<{
  label: string;
  to: AssetWorkflowStatus;
  tone?: 'danger' | 'default';
}> = [
  { label: 'Send to approval', to: 'pending_approval' },
  { label: 'Approve', to: 'approved' },
  { label: 'Reject', to: 'rejected', tone: 'danger' },
  { label: 'Archive', to: 'archived' },
  { label: 'Hide', to: 'hidden' },
  { label: 'Schedule', to: 'scheduled' },
  { label: 'Publish website', to: 'published_website' },
  { label: 'Publish portfolio', to: 'published_portfolio' },
  { label: 'Publish social', to: 'published_social' },
];

export function ApprovalActions({
  assetId,
  status,
}: {
  readonly assetId: string;
  readonly status: AssetWorkflowStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(to: AssetWorkflowStatus) {
    setError(null);
    startTransition(async () => {
      const result = await transitionMediaAssetAction({
        assetId,
        to,
        actor: 'owner',
      });
      if (!result.ok) {
        setError(result.error ?? 'Transition failed');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-silver-500 text-sm">
        Current status: <span className="text-silver-200">{status}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.to}
            type="button"
            disabled={pending}
            onClick={() => run(action.to)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              action.tone === 'danger'
                ? 'border-rose-500/40 text-rose-200'
                : 'border-navy-700 text-silver-200 hover:border-electric-500'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
      {error ? (
        <p className="text-sm text-rose-200" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-silver-500 text-xs">
        Publishing buttons only succeed after approval. Originals are never
        deleted by these actions.
      </p>
    </div>
  );
}
