import { notFound } from 'next/navigation';
import { ApprovalActions } from '@/components/media-intelligence/ApprovalActions';
import { BeforeAfterCompare } from '@/components/media-intelligence/BeforeAfterCompare';
import {
  ScoreBadge,
  StatusBadge,
} from '@/components/media-intelligence/MediaBadges';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { generateCaseStudyDraft } from '@/lib/media-intelligence/case-study';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import { generateSeoPackage } from '@/lib/media-intelligence/seo';

export default async function MediaProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = getMediaIntelligenceRepository();
  const project = repo.getProject(id);
  if (!project) notFound();

  const assets = project.assetIds
    .map((assetId) => repo.getAsset(assetId))
    .filter(Boolean);
  const before = repo.getAsset(project.beforeAssetIds[0] ?? '');
  const after = repo.getAsset(project.afterAssetIds[0] ?? '');
  const caseStudy = generateCaseStudyDraft(project, assets as never);

  return (
    <MediaShell
      title={project.title}
      subtitle={`${project.projectNumber} · confidence ${Math.round(project.confidence * 100)}%`}
    >
      <BeforeAfterCompare before={before} after={after} />

      <section className="border-navy-700 bg-navy-900/40 mt-8 rounded-2xl border p-5">
        <h2 className="text-lg font-semibold text-white">
          Case study draft (approval required)
        </h2>
        <dl className="text-silver-300 mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-silver-500">Summary</dt>
            <dd>{caseStudy.summary}</dd>
          </div>
          <div>
            <dt className="text-silver-500">SEO title</dt>
            <dd>{caseStudy.seoTitle}</dd>
          </div>
          <div>
            <dt className="text-silver-500">Insurance summary</dt>
            <dd>{caseStudy.insuranceSummary}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">Assets in sequence</h2>
        {assets.map((asset) =>
          asset ? (
            <div
              key={asset.id}
              className="border-navy-700 rounded-xl border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white">
                  {asset.originalFilename}
                </p>
                <StatusBadge status={asset.status} />
              </div>
              {asset.scores ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <ScoreBadge label="Overall" score={asset.scores.overall} />
                  <ScoreBadge
                    label="Marketing"
                    score={asset.scores.marketing}
                  />
                </div>
              ) : null}
              <div className="mt-4">
                <ApprovalActions assetId={asset.id} status={asset.status} />
              </div>
              <p className="text-silver-500 mt-3 text-xs">
                SEO file hint: {generateSeoPackage(asset).optimizedFilename}
              </p>
            </div>
          ) : null,
        )}
      </section>
    </MediaShell>
  );
}
