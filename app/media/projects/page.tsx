import Link from 'next/link';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { StatusBadge } from '@/components/media-intelligence/MediaBadges';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';

export default function MediaProjectsPage() {
  const projects = getMediaIntelligenceRepository().listProjects();

  return (
    <MediaShell
      title="Projects"
      subtitle="Automatically detected before → during → after repair sequences with confidence scoring."
    >
      <div className="space-y-4">
        {projects.map((project) => (
          <article
            key={project.id}
            className="border-navy-700 bg-navy-900/50 rounded-2xl border p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-silver-500 text-xs uppercase">
                  {project.projectNumber}
                </p>
                <Link
                  href={`/media/projects/${project.id}`}
                  className="mt-1 block text-xl font-semibold text-white hover:underline"
                >
                  {project.title}
                </Link>
                <p className="text-silver-400 mt-2 text-sm">
                  {project.assetIds.length} assets · confidence{' '}
                  {Math.round(project.confidence * 100)}%
                  {project.isDemoSeed ? ' · DEMO SEED' : ''}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>
          </article>
        ))}
        {projects.length === 0 ? (
          <p className="text-silver-500 text-sm">
            No projects detected yet. Import before/during/after sets to begin.
          </p>
        ) : null}
      </div>
    </MediaShell>
  );
}
