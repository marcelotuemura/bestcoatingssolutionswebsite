import Link from 'next/link';
import {
  getApprovedProjectImages,
  getProjectImageById,
  getRelatedProjects,
  type ProjectRecord,
} from '@/config/projects';
import { routes } from '@/config/routes';
import { BeforeAfterPair } from '@/components/portfolio/BeforeAfterPair';
import { ProjectImageGallery } from '@/components/portfolio/ProjectImageGallery';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import {
  Breadcrumbs,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ProjectDetailPage({
  locale,
  dictionary,
  project,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly project: ProjectRecord;
}) {
  const copy = project.copy[locale];
  const labels = dictionary.phase5.projects.labels;
  const duringImages = getApprovedProjectImages(project, 'during');
  const related = getRelatedProjects(project);

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.projects, href: '/projects' },
              { label: copy.title },
            ]}
          />
        </Container>
      </Section>

      <PageHero
        eyebrow={labels.category}
        title={copy.title}
        lead={copy.summary}
      />

      {project.isTestFixture ? (
        <Section>
          <Container>
            <p
              className="max-w-3xl rounded-2xl border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100"
              data-testid="test-fixture-badge"
            >
              {labels.testFixtureBadge}
            </p>
          </Container>
        </Section>
      ) : null}

      <ContentSection id="overview" title={labels.overview} body={copy.summary}>
        <dl className="text-silver-400 mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {project.vesselType ? (
            <div>
              <dt className="text-white">{labels.vessel}</dt>
              <dd>{project.vesselType}</dd>
            </div>
          ) : null}
          {project.generalLocation ? (
            <div>
              <dt className="text-white">{labels.location}</dt>
              <dd>{project.generalLocation}</dd>
            </div>
          ) : null}
          {project.completionDate ? (
            <div>
              <dt className="text-white">{labels.completed}</dt>
              <dd>{project.completionDate}</dd>
            </div>
          ) : null}
        </dl>
      </ContentSection>

      {copy.damageType ? (
        <ContentSection
          id="damage"
          title={labels.damage}
          body={copy.damageType}
        />
      ) : null}

      {copy.repairScope ? (
        <ContentSection
          id="repair-scope"
          title={labels.repairScope}
          body={copy.repairScope}
        />
      ) : null}

      {copy.processSummary ? (
        <ContentSection
          id="process"
          title={labels.process}
          body={copy.processSummary}
        />
      ) : null}

      {project.beforeAfterPairs.length > 0 ? (
        <Section id="before-after" aria-labelledby="before-after-heading">
          <Container>
            <h2 id="before-after-heading" className="sr-only">
              {dictionary.phase5.beforeAfter.pairLabel}
            </h2>
            <div className="space-y-8">
              {project.beforeAfterPairs.map((pair) => {
                const before = getProjectImageById(project, pair.beforeImageId);
                const after = getProjectImageById(project, pair.afterImageId);
                if (!before || !after) {
                  return null;
                }
                return (
                  <BeforeAfterPair
                    key={pair.id}
                    before={before}
                    after={after}
                    beforeLabel={dictionary.phase5.beforeAfter.before}
                    afterLabel={dictionary.phase5.beforeAfter.after}
                    pairLabel={dictionary.phase5.beforeAfter.pairLabel}
                    caption={pair.caption}
                    placeholderLabel={labels.placeholderImage}
                  />
                );
              })}
            </div>
          </Container>
        </Section>
      ) : null}

      {duringImages.length > 0 ? (
        <Section id="during" aria-labelledby="gallery-heading">
          <Container>
            <ProjectImageGallery
              title={labels.during}
              images={duringImages}
              placeholderLabel={labels.placeholderImage}
            />
          </Container>
        </Section>
      ) : null}

      {copy.materialsSummary ? (
        <ContentSection
          id="materials"
          title={labels.materials}
          body={copy.materialsSummary}
        />
      ) : null}

      {copy.finishSummary ? (
        <ContentSection
          id="finish"
          title={labels.finish}
          body={copy.finishSummary}
        />
      ) : null}

      {project.relatedServiceSlugs.length > 0 ? (
        <Section aria-labelledby="related-services-heading">
          <Container>
            <h2
              id="related-services-heading"
              className="text-2xl font-semibold text-white"
            >
              {labels.relatedServices}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {project.relatedServiceSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={localePath(locale, `/services/${slug}`)}
                    className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
                  >
                    {slug.replace(/-/g, ' ')}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href={localePath(locale, routes.resources.path)}
                className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
              >
                {dictionary.nav.resources}
              </Link>
            </p>
          </Container>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section aria-labelledby="related-projects-heading">
          <Container>
            <h2
              id="related-projects-heading"
              className="text-2xl font-semibold text-white"
            >
              {labels.relatedProjects}
            </h2>
            <ul className="mt-4 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={localePath(locale, `/projects/${item.slug}`)}
                    className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
                  >
                    {item.copy[locale].title}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={dictionary.phase5.projects.detailEstimateTitle}
        body={dictionary.phase5.projects.detailEstimateBody}
        notice={dictionary.pages.estimateShared.notice}
      />
    </main>
  );
}
