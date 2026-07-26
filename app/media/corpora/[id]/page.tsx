import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { getCorpusDetail } from '@/lib/media-intelligence/corpora';
import { CreateVersionButton } from '@/components/media-intelligence/CorpusCreateVersionButton';
import { ArchiveCorpusButton } from '@/components/media-intelligence/CorpusArchiveButton';

export default async function CorpusDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();
  if (!session.ok) return null;
  const { id } = await params;
  const detail = await getCorpusDetail(session.actor, id);
  if (!detail.ok) notFound();

  const { corpus, versions, events } = detail.data;
  const canDraft = actorHasPermission(session.actor, 'manage_corpus_draft');
  const canArchive = actorHasPermission(session.actor, 'release_corpus');

  return (
    <MediaShell
      title={corpus.name}
      subtitle={`${corpus.intendedUse} · ${corpus.status} · ${corpus.externalId}`}
      readOnlyBanner={false}
    >
      <div className="space-y-8">
        <p>
          <Link
            href="/media/corpora"
            className="text-electric-400 text-sm hover:underline"
          >
            ← All corpora
          </Link>
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-silver-300 text-sm">
            {corpus.description || 'No description'}
          </p>
          <div className="flex flex-wrap gap-2">
            {canDraft && corpus.status !== 'archived' ? (
              <CreateVersionButton corpusId={corpus.id} />
            ) : null}
            {canArchive && corpus.status !== 'archived' ? (
              <ArchiveCorpusButton corpusId={corpus.id} />
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Versions</h2>
          <ul className="space-y-2" data-testid="corpus-version-list">
            {versions.map((version) => (
              <li key={version.id}>
                <Link
                  href={`/media/corpora/${corpus.id}/versions/${version.id}`}
                  className="border-navy-700 hover:border-electric-500 flex items-center justify-between rounded-xl border px-4 py-3 text-sm"
                  data-testid={`version-link-${version.id}`}
                >
                  <span>
                    v{version.versionNumber} · {version.status}
                  </span>
                  <span className="text-silver-400 text-xs">
                    {version.releasedAt
                      ? `released ${version.releasedAt}`
                      : version.updatedAt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Audit events</h2>
          <ul className="space-y-2 text-sm" data-testid="corpus-audit-events">
            {events.length === 0 ? (
              <li className="text-silver-400">No events yet.</li>
            ) : (
              events.map((event) => (
                <li
                  key={event.id}
                  className="border-navy-800 rounded-lg border px-3 py-2"
                >
                  <span className="font-medium">{event.action}</span>
                  {event.previousStatus || event.nextStatus ? (
                    <span className="text-silver-400">
                      {' '}
                      {event.previousStatus ?? '∅'} → {event.nextStatus ?? '∅'}
                    </span>
                  ) : null}
                  <span className="text-silver-500 block text-xs">
                    actor={event.actorId ?? 'unknown'} · {event.at}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </MediaShell>
  );
}
