import Link from 'next/link';
import { CaseStudyFramework } from '@/components/case-study';
import { ProjectsEmptyState } from '@/components/portfolio/ProjectsEmptyState';
import { TestimonialCollection } from '@/components/testimonials/TestimonialCollection';
import {
  Breadcrumbs,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import {
  getProjectFrameworkDemo,
  getPublishedProjects,
  getVisibleProjects,
} from '@/config/projects';
import { getPublishedTestimonials } from '@/config/testimonials';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ProjectsPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.phase5.projects;
  const published = getPublishedProjects();
  const visible = getVisibleProjects();
  const fixtures = visible.filter((project) => project.isTestFixture);
  const framework = getProjectFrameworkDemo();
  const testimonials = getPublishedTestimonials();

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.projects },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <Section id="portfolio">
        <Container>
          {published.length === 0 ? (
            <ProjectsEmptyState locale={locale} dictionary={dictionary} />
          ) : (
            <ul
              className="grid gap-6 sm:grid-cols-2"
              data-testid="projects-list"
            >
              {published.map((project) => (
                <li
                  key={project.id}
                  className="border-navy-700 rounded-2xl border p-5"
                >
                  <h2 className="text-lg font-semibold text-white">
                    <Link
                      href={localePath(locale, `/projects/${project.slug}`)}
                      className="hover:text-electric-400 focus-visible:ring-electric-500 rounded focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {project.copy[locale].title}
                    </Link>
                  </h2>
                  <p className="text-silver-400 mt-2 text-sm text-pretty">
                    {project.copy[locale].summary}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {fixtures.length > 0 ? (
            <ul
              className="mt-8 grid gap-6 sm:grid-cols-2"
              data-testid="projects-test-fixtures"
            >
              {fixtures.map((project) => (
                <li
                  key={project.id}
                  className="rounded-2xl border border-dashed border-amber-800/60 p-5"
                >
                  <p className="text-xs text-amber-200">
                    {copy.labels.testFixtureBadge}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    <Link
                      href={localePath(locale, `/projects/${project.slug}`)}
                      className="hover:text-electric-400 focus-visible:ring-electric-500 rounded focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {project.copy[locale].title}
                    </Link>
                  </h2>
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </Section>

      <ContentSection
        id="framework"
        title={copy.frameworkTitle}
        body={copy.frameworkBody}
      >
        <CaseStudyFramework
          locale={locale}
          dictionary={dictionary}
          project={framework}
          labels={dictionary.pages.projects.labels}
        />
      </ContentSection>

      <Section>
        <Container>
          <TestimonialCollection
            testimonials={testimonials}
            locale={locale}
            heading={dictionary.phase5.testimonials.heading}
            emptyNote={dictionary.phase5.testimonials.emptyNote}
          />
        </Container>
      </Section>

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={dictionary.pages.estimateShared.title}
        body={dictionary.pages.estimateShared.body}
        notice={dictionary.pages.estimateShared.notice}
      />
    </main>
  );
}
