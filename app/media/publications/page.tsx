import { PublicationDraftForm } from '@/components/media-intelligence/PublicationDraftForm';
import { PublicationQueue } from '@/components/media-intelligence/PublicationQueue';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { listJobsForActor } from '@/lib/media-intelligence/publishers';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';

export default async function PublicationsPage() {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();
  if (!session.ok) return null;

  const repo = getMediaIntelligenceRepository();
  const assets = repo
    .listAssets()
    .filter((a) => a.privacyRisks.length === 0)
    .slice()
    .sort((a, b) => {
      const aSeed = a.id.startsWith('asset-seed-') ? 0 : 1;
      const bSeed = b.id.startsWith('asset-seed-') ? 0 : 1;
      if (aSeed !== bSeed) return aSeed - bSeed;
      return b.importedAt.localeCompare(a.importedAt);
    });
  const jobs = await listJobsForActor(session.actor);
  const canPrepare = actorHasPermission(session.actor, 'prepare_publish_draft');

  return (
    <MediaShell
      title="Publications"
      subtitle="Approval-gated website, social, and Google Business drafts. Never auto-publishes. Draft adapters do not claim external delivery. Jobs persist in PostgreSQL."
      readOnlyBanner={false}
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-3">
          <h2 className="media-light:text-slate-900 text-xl font-semibold text-white">
            Readiness checklist
          </h2>
          <ul
            className="text-silver-300 media-light:text-slate-600 list-disc space-y-1 pl-5 text-sm"
            data-testid="publication-readiness"
          >
            <li>Exact MediaApproval for asset + target</li>
            <li>No privacy risks on the asset</li>
            <li>Only approved derivatives (never originals)</li>
            <li>Owner-only live publish; editors prepare drafts</li>
            <li>
              Provider-not-configured is never shown as externally published
            </li>
            <li>Lifecycle mutations enforced by PostgreSQL RPCs</li>
          </ul>
        </section>

        {canPrepare ? (
          <section className="space-y-3">
            <h2 className="media-light:text-slate-900 text-xl font-semibold text-white">
              Create draft
            </h2>
            <PublicationDraftForm assetIds={assets.map((a) => a.id)} />
          </section>
        ) : (
          <p
            className="text-silver-300 text-sm"
            data-testid="publication-prepare-denied"
          >
            Your role cannot prepare publication drafts.
          </p>
        )}

        <section className="space-y-3">
          <h2 className="media-light:text-slate-900 text-xl font-semibold text-white">
            Publication queue
          </h2>
          <PublicationQueue jobs={jobs} />
        </section>
      </div>
    </MediaShell>
  );
}
