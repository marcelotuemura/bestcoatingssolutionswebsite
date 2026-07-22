import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Heading } from '@/components/ui/Heading';
import type { ProjectCaseStudy } from '@/config/projects';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Reusable case-study layout for future approved projects.
 * When `project.placeholder` is true, UI must label every media/slot clearly.
 */
export function CaseStudyFramework({
  locale,
  dictionary,
  project,
  labels,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly project: ProjectCaseStudy;
  readonly labels: {
    readonly category: string;
    readonly problem: string;
    readonly repair: string;
    readonly materials: string;
    readonly timeline: string;
    readonly results: string;
    readonly images: string;
    readonly cta: string;
  };
}) {
  return (
    <article
      className="border-navy-700/80 max-w-3xl rounded-3xl border border-dashed p-6 sm:p-8"
      data-placeholder={project.placeholder ? 'true' : 'false'}
    >
      <Badge tone="accent" className="mb-4">
        {dictionary.placeholder.projectLabel}
      </Badge>
      <p className="text-electric-400 text-sm tracking-wide uppercase">
        {labels.category}: {project.category}
      </p>
      <Heading as="h2" className="mt-3">
        {project.title}
      </Heading>

      <dl className="text-silver-300 mt-8 space-y-6 text-pretty">
        <div>
          <dt className="text-silver-500 text-xs tracking-wide uppercase">
            {labels.problem}
          </dt>
          <dd className="mt-2">{project.problem}</dd>
        </div>
        <div>
          <dt className="text-silver-500 text-xs tracking-wide uppercase">
            {labels.repair}
          </dt>
          <dd className="mt-2">{project.repair}</dd>
        </div>
        <div>
          <dt className="text-silver-500 text-xs tracking-wide uppercase">
            {labels.materials}
          </dt>
          <dd className="mt-2">
            <ul className="list-inside list-disc space-y-1">
              {project.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-silver-500 text-xs tracking-wide uppercase">
            {labels.timeline}
          </dt>
          <dd className="mt-2">{project.timeline}</dd>
        </div>
        <div>
          <dt className="text-silver-500 text-xs tracking-wide uppercase">
            {labels.results}
          </dt>
          <dd className="mt-2">{project.results}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-white">{labels.images}</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {project.images.map((image) => (
            <li
              key={image.id}
              className="border-navy-700 bg-navy-950/60 flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed p-4 text-center"
            >
              <span className="text-silver-400 text-sm capitalize">
                {image.role}
              </span>
              <span className="text-silver-600 mt-2 text-xs">
                {dictionary.placeholder.mediaLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <ButtonLink href={localePath(locale, project.ctaPath)}>
          {labels.cta}
        </ButtonLink>
      </div>
    </article>
  );
}
