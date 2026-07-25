'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  approvePublicationAction,
  cancelPublicationAction,
  executePublicationAction,
  schedulePublicationAction,
  submitPublicationAction,
} from '@/app/media/publication-actions';
import type { PublicationJob } from '@/lib/media-intelligence/publishers/types';

export function PublicationJobActions({
  job,
  canPrepare,
  canApprove,
  canSchedule,
  canPublish,
}: {
  readonly job: PublicationJob;
  readonly canPrepare: boolean;
  readonly canApprove: boolean;
  readonly canSchedule: boolean;
  readonly canPublish: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState('');

  function run(
    action: () => Promise<{ ok: boolean; error?: string; message?: string }>,
  ) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Action failed');
        return;
      }
      setMessage(result.message ?? 'Updated');
      router.refresh();
    });
  }

  return (
    <div className="space-y-3" data-testid="publication-job-actions">
      <div className="flex flex-wrap gap-2">
        {canPrepare && job.status === 'draft' ? (
          <button
            type="button"
            disabled={pending}
            className="border-electric-500 text-electric-300 rounded-lg border px-3 py-1.5 text-xs"
            data-testid="publication-submit"
            onClick={() =>
              run(() => submitPublicationAction({ jobId: job.id }))
            }
          >
            Submit for approval
          </button>
        ) : null}
        {canApprove &&
        (job.status === 'awaiting_approval' || job.status === 'draft') ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border border-emerald-500 px-3 py-1.5 text-xs text-emerald-300"
            data-testid="publication-approve"
            onClick={() =>
              run(() => approvePublicationAction({ jobId: job.id }))
            }
          >
            Approve publication
          </button>
        ) : null}
        {canSchedule &&
        (job.status === 'approved' || job.status === 'scheduled') ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="border-navy-600 bg-navy-950 rounded-lg border px-2 py-1 text-xs"
              data-testid="publication-schedule-input"
            />
            <button
              type="button"
              disabled={pending || !scheduleAt}
              className="rounded-lg border border-sky-500 px-3 py-1.5 text-xs text-sky-300"
              data-testid="publication-schedule"
              onClick={() =>
                run(() =>
                  schedulePublicationAction({
                    jobId: job.id,
                    scheduledFor: new Date(scheduleAt).toISOString(),
                  }),
                )
              }
            >
              Schedule
            </button>
          </div>
        ) : null}
        {canPublish &&
        (job.status === 'approved' || job.status === 'scheduled') ? (
          <button
            type="button"
            disabled={pending}
            className="bg-electric-500 text-navy-950 rounded-lg px-3 py-1.5 text-xs font-medium"
            data-testid="publication-execute"
            onClick={() =>
              run(() => executePublicationAction({ jobId: job.id }))
            }
          >
            Execute publish action
          </button>
        ) : null}
        {(canPrepare || canSchedule) &&
        job.status !== 'published' &&
        job.status !== 'cancelled' ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border border-red-400/60 px-3 py-1.5 text-xs text-red-200"
            data-testid="publication-cancel"
            onClick={() =>
              run(() => cancelPublicationAction({ jobId: job.id }))
            }
          >
            Cancel
          </button>
        ) : null}
      </div>
      {message ? (
        <p
          className="text-sm text-emerald-300"
          data-testid="publication-action-message"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          className="text-sm text-red-300"
          role="alert"
          data-testid="publication-action-error"
        >
          {error}
        </p>
      ) : null}
      <ul className="text-silver-400 media-light:text-slate-600 list-disc space-y-1 pl-5 text-xs">
        <li>Never auto-publishes</li>
        <li>Requires exact MediaApproval for asset + target</li>
        <li>Privacy-blocked assets are rejected</li>
        <li>Draft adapters never claim external delivery</li>
      </ul>
    </div>
  );
}
