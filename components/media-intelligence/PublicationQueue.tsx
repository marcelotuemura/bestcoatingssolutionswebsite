'use client';

import Link from 'next/link';
import type { PublicationJob } from '@/lib/media-intelligence/publishers/types';
import { jobDisplayLabel } from '@/lib/media-intelligence/publishers/validation';

export function PublicationQueue({
  jobs,
}: {
  readonly jobs: readonly PublicationJob[];
}) {
  if (jobs.length === 0) {
    return (
      <p
        className="text-silver-300 media-light:text-slate-600 text-sm"
        data-testid="publication-queue-empty"
      >
        No publication jobs yet. Create a draft from the form above.
      </p>
    );
  }

  return (
    <ul className="space-y-3" data-testid="publication-queue">
      {jobs.map((job) => (
        <li
          key={job.id}
          className="border-navy-700 media-light:border-slate-200 media-light:bg-white bg-navy-900/40 rounded-xl border p-4"
          data-testid={`publication-job-${job.id}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-electric-400 text-xs tracking-wide uppercase">
                {job.target.replace(/_/g, ' ')} · {job.externalId}
              </p>
              <p className="media-light:text-slate-900 mt-1 text-lg font-medium text-white">
                Asset {job.assetId}
              </p>
              <p
                className="text-silver-300 media-light:text-slate-600 mt-1 text-sm"
                data-testid={`publication-status-${job.id}`}
              >
                {jobDisplayLabel(job)}
              </p>
              {job.providerDeliveryStatus === 'draft_ready' ||
              job.providerDeliveryStatus === 'not_configured' ? (
                <p
                  className="media-light:text-amber-800 mt-2 text-xs text-amber-200"
                  data-testid={`publication-provider-${job.id}`}
                >
                  Provider not configured — this is not an external publication.
                </p>
              ) : null}
            </div>
            <Link
              href={`/media/publications/${job.id}`}
              className="border-electric-500 text-electric-300 hover:bg-electric-500/10 rounded-lg border px-3 py-1.5 text-xs"
              data-testid={`publication-open-${job.id}`}
            >
              Open
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
