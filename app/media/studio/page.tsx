import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';
import { generateSocialDrafts } from '@/lib/media-intelligence/social';

export default function MediaStudioPage() {
  const repo = getMediaIntelligenceRepository();
  const project = repo.listProjects()[0];
  const assets = project
    ? project.assetIds.map((id) => repo.getAsset(id)).filter(Boolean)
    : [];
  const drafts = project ? generateSocialDrafts(project, assets as never) : [];

  return (
    <MediaShell
      title="Social Media Studio"
      subtitle="Captions, hashtags, carousels, and CTAs for Instagram, Facebook, LinkedIn, GBP, X, Threads, Pinterest — approval required before publishing."
    >
      {!project ? (
        <p className="text-silver-500 text-sm">
          Import a project to generate social drafts.
        </p>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <article
              key={draft.platform}
              className="border-navy-700 bg-navy-900/50 rounded-2xl border p-5"
            >
              <h2 className="text-lg font-semibold text-white capitalize">
                {draft.platform.replace('_', ' ')}
              </h2>
              <p className="text-silver-300 mt-3 text-sm whitespace-pre-wrap">
                {draft.caption}
              </p>
              <p className="text-silver-500 mt-3 text-xs">
                {draft.hashtags.join(' ')}
              </p>
              <p className="mt-3 text-xs text-amber-100">
                Requires owner approval · auto-publish disabled
              </p>
            </article>
          ))}
        </div>
      )}
    </MediaShell>
  );
}
