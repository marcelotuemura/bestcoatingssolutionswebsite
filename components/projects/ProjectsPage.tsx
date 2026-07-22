import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { CaseStudyFramework } from '@/components/case-study';
import {
  Breadcrumbs,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import { Reveal } from '@/components/home/Reveal';
import {
  getProjectFrameworkDemo,
  getPublishedProjects,
} from '@/config/projects';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

export function ProjectsPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.pages.projects;
  const published = getPublishedProjects();
  const framework = getProjectFrameworkDemo();

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

      <ContentSection
        id="framework"
        title={copy.frameworkTitle}
        body={copy.frameworkBody}
      />

      <Section id="project-slots" aria-labelledby="project-slots-heading">
        <Container>
          <Reveal>
            <Heading as="h2" id="project-slots-heading" className="sr-only">
              {copy.frameworkTitle}
            </Heading>
            {published.length === 0 ? (
              <p
                className="text-silver-400 mb-8 max-w-2xl text-pretty"
                data-testid="projects-empty"
              >
                {dictionary.placeholder.emptyProjects}
              </p>
            ) : null}
            <CaseStudyFramework
              locale={locale}
              dictionary={dictionary}
              project={framework}
              labels={copy.labels}
            />
          </Reveal>
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
