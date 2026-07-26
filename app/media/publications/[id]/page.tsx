import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationJobActions } from '@/components/media-intelligence/PublicationJobActions';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  getJobWithEvents,
  jobDisplayLabel,
} from '@/lib/media-intelligence/publishers';

export default async function PublicationDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();
  if (!session.ok) return null;

  const { id } = await params;
  const detail = await getJobWithEvents(session.actor, id);
  if (!detail) notFound();
  const { job, events } = detail;

  return (
    <MediaShell
      title={`Publication ${job.externalId}`}
      subtitle={`${job.target.replace(/_/g, ' ')} · ${jobDisplayLabel(job)}`}
      readOnlyBanner={false}
    >
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/media/publications"
          className="text-electric-300 text-sm underline"
        >
          ← Back to queue
        </Link>

        <dl
          className="border-navy-700 media-light:border-slate-200 grid gap-3 rounded-xl border p-4 text-sm"
          data-testid="publication-detail"
        >
          <div>
            <dt className="text-silver-400">Status</dt>
            <dd data-testid="publication-detail-status">
              {jobDisplayLabel(job)}
            </dd>
          </div>
          <div>
            <dt className="text-silver-400">Provider delivery</dt>
            <dd data-testid="publication-detail-provider">
              {job.providerDeliveryStatus}
            </dd>
          </div>
          <div>
            <dt className="text-silver-400">Asset</dt>
            <dd>{job.assetId}</dd>
          </div>
          <div>
            <dt className="text-silver-400">Approval</dt>
            <dd>
              {job.approvalId
                ? `${job.approvalId} (v${job.approvalVersion ?? '?'})`
                : 'None yet'}
            </dd>
          </div>
          <div>
            <dt className="text-silver-400">Scheduled</dt>
            <dd>{job.scheduledFor ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-silver-400">Payload</dt>
            <dd>
              <pre className="bg-navy-950/60 mt-1 overflow-x-auto rounded p-2 text-xs">
                {JSON.stringify(job.payload, null, 2)}
              </pre>
            </dd>
          </div>
        </dl>

        <PublicationJobActions
          job={job}
          canPrepare={actorHasPermission(
            session.actor,
            'prepare_publish_draft',
          )}
          canApprove={actorHasPermission(
            session.actor,
            'create_publication_approval',
          )}
          canSchedule={actorHasPermission(session.actor, 'schedule')}
          canPublish={actorHasPermission(session.actor, 'publish')}
        />

        <section>
          <h2 className="mb-2 text-lg font-semibold">Event history</h2>
          <ol className="space-y-2 text-sm" data-testid="publication-events">
            {events.map((event) => (
              <li
                key={event.id}
                className="border-navy-800 rounded border px-3 py-2"
              >
                <span className="text-electric-300">{event.action}</span>
                {event.previousStatus || event.nextStatus ? (
                  <span className="text-silver-400">
                    {' '}
                    ({event.previousStatus ?? '—'} → {event.nextStatus ?? '—'})
                  </span>
                ) : null}
                <div className="text-silver-500 text-xs">{event.at}</div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </MediaShell>
  );
}
