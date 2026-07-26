import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CorpusVersionPanel } from '@/components/media-intelligence/CorpusVersionPanel';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  getCorpusDetail,
  getVersionDetail,
} from '@/lib/media-intelligence/corpora';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';

export default async function CorpusVersionPage({
  params,
}: {
  readonly params: Promise<{ id: string; versionId: string }>;
}) {
  await requireMediaPageAccess();
  const session = await resolveMediaTrustedActor();
  if (!session.ok) return null;
  const { id, versionId } = await params;

  const corpusDetail = await getCorpusDetail(session.actor, id);
  if (!corpusDetail.ok) notFound();
  const versionDetail = await getVersionDetail(session.actor, versionId);
  if (!versionDetail.ok) notFound();
  if (versionDetail.data.version.corpusId !== id) notFound();

  const assetIds = getMediaIntelligenceRepository()
    .listAssets()
    .filter((a) => a.privacyRisks.length === 0)
    .map((a) => a.id)
    .slice(0, 40);

  return (
    <MediaShell
      title={`${corpusDetail.data.corpus.name} · v${versionDetail.data.version.versionNumber}`}
      subtitle="Candidate queue, human labels, splits, eligibility, and immutable release."
      readOnlyBanner={false}
    >
      <div className="space-y-6">
        <Link
          href={`/media/corpora/${id}`}
          className="text-electric-400 text-sm hover:underline"
        >
          ← Corpus detail
        </Link>
        <CorpusVersionPanel
          version={versionDetail.data.version}
          items={versionDetail.data.items}
          labelsByItem={versionDetail.data.labelsByItem}
          readiness={versionDetail.data.readiness}
          assetIds={assetIds}
          canDraft={actorHasPermission(session.actor, 'manage_corpus_draft')}
          canReview={actorHasPermission(session.actor, 'review_corpus')}
          canApprove={actorHasPermission(session.actor, 'approve_corpus')}
          canRelease={actorHasPermission(session.actor, 'release_corpus')}
        />
      </div>
    </MediaShell>
  );
}
