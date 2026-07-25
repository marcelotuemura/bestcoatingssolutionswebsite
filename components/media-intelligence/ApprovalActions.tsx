'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPublicationApprovalAction,
  transitionMediaAssetAction,
} from '@/app/media/actions';
import type { AssetWorkflowStatus } from '@/lib/media-intelligence/schemas';
import type { PublishTarget } from '@/lib/media-intelligence/publishers/website';

const workflowActions: Array<{
  label: string;
  to: AssetWorkflowStatus;
  tone?: 'danger' | 'default';
}> = [
  { label: 'Send to approval', to: 'pending_approval' },
  { label: 'Approve workflow', to: 'approved' },
  { label: 'Reject', to: 'rejected', tone: 'danger' },
  { label: 'Archive', to: 'archived' },
  { label: 'Hide', to: 'hidden' },
  { label: 'Schedule', to: 'scheduled' },
];

const publishTargets: Array<{
  label: string;
  target: PublishTarget;
  to: AssetWorkflowStatus;
}> = [
  { label: 'Approve for website', target: 'website', to: 'published_website' },
  {
    label: 'Approve for portfolio',
    target: 'portfolio',
    to: 'published_portfolio',
  },
  { label: 'Approve for social', target: 'social', to: 'published_social' },
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

  function runTransition(to: AssetWorkflowStatus) {
    setError(null);
    startTransition(async () => {
      const result = await transitionMediaAssetAction({ assetId, to });
      if (!result.ok) {
        setError(result.error ?? 'Transition failed');
        return;
      }
      router.refresh();
    });
  }

  function runPublish(target: PublishTarget, to: AssetWorkflowStatus) {
    setError(null);
    startTransition(async () => {
      const approval = await createPublicationApprovalAction({
        assetId,
        target,
        note: `Owner publication approval for ${target}`,
      });
      if (!approval.ok) {
        setError(approval.error ?? 'Publication approval failed');
        return;
      }
      const result = await transitionMediaAssetAction({ assetId, to });
      if (!result.ok) {
        setError(result.error ?? 'Publish failed');
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
        {workflowActions.map((action) => (
          <button
            key={action.to}
            type="button"
            disabled={pending}
            onClick={() => runTransition(action.to)}
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
      <div className="flex flex-wrap gap-2">
        {publishTargets.map((action) => (
          <button
            key={action.target}
            type="button"
            disabled={pending}
            onClick={() => runPublish(action.target, action.to)}
            className="border-electric-500/40 text-electric-400 hover:border-electric-500 rounded-lg border px-3 py-1.5 text-sm"
            data-testid={`media-publish-${action.target}`}
          >
            {action.label} + publish
          </button>
        ))}
      </div>
      {error ? (
        <p className="text-sm text-rose-200" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-silver-500 text-xs">
        Publication requires a stored target-specific owner approval record.
        Workflow status alone is never enough. Actor identity comes from the
        server session — not the browser.
      </p>
    </div>
  );
}
