import { CorpusCreateForm } from '@/components/media-intelligence/CorpusCreateForm';
import { CorpusList } from '@/components/media-intelligence/CorpusList';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { listCorporaForActor } from '@/lib/media-intelligence/corpora';

export default async function CorporaPage() {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();
  if (!session.ok) return null;

  const corpora = await listCorporaForActor(session.actor);
  const canDraft = actorHasPermission(session.actor, 'manage_corpus_draft');

  return (
    <MediaShell
      title="Training corpora"
      subtitle="Human-reviewed dataset governance for future ML evaluation. No model training, no external AI export, no signed URLs."
      readOnlyBanner={false}
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Governance checklist</h2>
          <ul
            className="text-silver-300 list-disc space-y-1 pl-5 text-sm"
            data-testid="corpus-governance-checklist"
          >
            <li>
              Human-reviewed data only — AI suggestions never auto-confirm
            </li>
            <li>Privacy-blocked and archived assets cannot be included</li>
            <li>Exact duplicates cannot leak across dataset splits</li>
            <li>
              Released versions are immutable; further changes need a new
              version
            </li>
            <li>
              Manifests contain checksums and labels — never secrets or signed
              URLs
            </li>
          </ul>
        </section>

        {canDraft ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Create draft corpus</h2>
            <CorpusCreateForm />
          </section>
        ) : (
          <p
            className="text-silver-300 text-sm"
            data-testid="corpus-draft-denied"
          >
            Your role cannot create draft corpora.
          </p>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Corpora</h2>
          <CorpusList corpora={corpora} />
        </section>
      </div>
    </MediaShell>
  );
}
