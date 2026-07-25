import Link from 'next/link';
import { StatWidget } from '@/components/media-library/StatWidget';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { getCatalogProjects } from '@/lib/media-library';

export default async function MediaProjectsPage() {
  await requireMediaPageAccess();
  const projects = await getCatalogProjects();

  return (
    <MediaShell
      title="Projects"
      subtitle="Catalog projects detected by the indexing engine — open any project for timeline and stage views."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatWidget label="Projects" value={projects.length} />
        <StatWidget
          label="Total media"
          value={projects.reduce((s, p) => s + p.mediaCount, 0)}
        />
        <StatWidget
          label="Privacy alerts"
          value={projects.reduce((s, p) => s + p.privacyAlertCount, 0)}
        />
      </div>
      <ul className="space-y-3" data-testid="projects-list">
        {projects.map((project) => (
          <li
            key={project.id}
            className="border-navy-700 bg-navy-900/50 media-light:border-slate-200 media-light:bg-white rounded-2xl border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={`/media/catalog/projects/${project.id}`}
                  className="hover:text-electric-400 media-light:text-slate-900 text-lg font-medium text-white"
                >
                  {project.name}
                </Link>
                <p className="text-silver-500 media-light:text-slate-500 mt-1 text-sm">
                  {project.manufacturer ?? 'Unknown'} ·{' '}
                  {project.repairCategory?.replace(/_/g, ' ') ?? 'repair'} ·{' '}
                  {project.mediaCount} media
                </p>
              </div>
              <Link
                href={`/media/catalog/projects/${project.id}`}
                className="text-electric-400 text-sm hover:underline"
              >
                Open →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </MediaShell>
  );
}
