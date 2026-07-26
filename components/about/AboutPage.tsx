import Link from 'next/link';
import { getApprovedAboutFacts } from '@/config/about';
import { routes } from '@/config/routes';
import { getAboutContent } from '@/content/about';
import { CompanyValues } from '@/components/trust/CompanyValues';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import {
  Breadcrumbs,
  BulletList,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function AboutPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const content = getAboutContent(locale);
  const approvedFacts = getApprovedAboutFacts();

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.about },
            ]}
          />
        </Container>
      </Section>

      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <Section aria-labelledby="about-photo-heading" className="pt-0">
        <Container>
          <div
            className="relative flex min-h-[14rem] items-end overflow-hidden rounded-sm bg-[radial-gradient(ellipse_at_70%_10%,rgba(10,132,255,0.14),transparent_50%),linear-gradient(165deg,#0a1a2f_0%,#07101c_60%,#050d18_100%)] p-6 sm:min-h-[18rem]"
            data-testid="about-photo-slot"
          >
            <div
              aria-hidden
              className="bcs-ocean-texture pointer-events-none absolute inset-0 opacity-40"
            />
            <div className="relative">
              <h2 id="about-photo-heading" className="sr-only">
                {content.title}
              </h2>
              <p className="text-silver-500 max-w-xl text-sm text-pretty">
                {content.photoNote}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <ContentSection id="introduction" title={content.introductionTitle}>
        <div className="space-y-4">
          {content.introduction.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-silver-300 text-pretty"
            >
              {paragraph}
            </p>
          ))}
          {approvedFacts.length === 0 ? (
            <p
              className="text-silver-500 text-sm text-pretty"
              data-testid="about-owner-facts-pending"
            >
              {dictionary.phase5.about.ownerFactsPending}
            </p>
          ) : (
            <ul className="text-silver-300 mt-4 space-y-2 text-sm">
              {approvedFacts.map((fact) => (
                <li key={fact.id}>
                  <span className="text-white">{fact.label}:</span> {fact.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ContentSection>

      <ContentSection id="career" title={content.careerTitle}>
        <div className="space-y-4">
          {content.career.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-silver-300 text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </ContentSection>

      <ContentSection id="philosophy" title={content.philosophyTitle}>
        <div className="space-y-4">
          {content.philosophy.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-silver-300 text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </ContentSection>

      <Section
        id="craft-principles"
        aria-labelledby="about-craft-principles-heading"
      >
        <Container>
          <div className="max-w-3xl">
            <Heading as="h2" id="about-craft-principles-heading">
              {content.craftPrinciplesTitle}
            </Heading>
            <p className="text-silver-300 mt-4 text-pretty">
              {content.craftPrinciplesIntro}
            </p>
            <ol className="text-silver-100 mt-6 list-decimal space-y-3 pl-5 text-pretty">
              {content.craftPrinciplesQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
            <p className="text-silver-300 mt-6 text-pretty">
              {content.craftPrinciplesClosing}
            </p>
          </div>
        </Container>
      </Section>

      <Section id="what-to-expect" aria-labelledby="about-expect-heading">
        <Container>
          <div className="max-w-3xl">
            <Heading as="h2" id="about-expect-heading">
              {content.expectTitle}
            </Heading>
            <p className="text-silver-300 mt-4 text-pretty">
              {content.expectIntro}
            </p>
            <ol className="mt-8 space-y-5">
              {content.expectSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="border-navy-700/80 border-l pl-5"
                >
                  <p className="text-electric-400 text-xs tracking-[0.2em] uppercase">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {step.title}
                  </p>
                  <p className="text-silver-300 mt-1 text-sm text-pretty">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <ContentSection id="specialization" title={content.specializationTitle}>
        <BulletList items={content.specialization} />
      </ContentSection>

      <ContentSection id="communication" title={content.communicationTitle}>
        <div className="space-y-4">
          {content.communication.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-silver-300 text-pretty"
            >
              {paragraph}
            </p>
          ))}
          <Link
            href={localePath(locale, routes.workmanship.path)}
            className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
          >
            {dictionary.nav.workmanship}
          </Link>
        </div>
      </ContentSection>

      <Section id="values" aria-labelledby="company-values-heading">
        <Container>
          <CompanyValues
            title={content.valuesTitle}
            intro={content.valuesIntro}
            values={content.values}
          />
        </Container>
      </Section>

      <ContentSection
        id="service-area-summary"
        title={content.serviceAreaTitle}
      >
        <BulletList items={content.serviceArea} />
        <p className="mt-4">
          <Link
            href={localePath(locale, routes.serviceArea.path)}
            className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
          >
            {dictionary.nav.serviceArea}
          </Link>
        </p>
      </ContentSection>

      <ContentSection
        id="projects-cta"
        title={content.projectsCtaTitle}
        body={content.projectsCtaBody}
      >
        <Link
          href={localePath(locale, routes.projects.path)}
          className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
        >
          {dictionary.cta.viewWork}
        </Link>
      </ContentSection>

      <Section
        id="employer-disclaimer"
        aria-labelledby="employer-disclaimer-heading"
        className="pt-0"
      >
        <Container>
          <h2 id="employer-disclaimer-heading" className="sr-only">
            Disclaimer
          </h2>
          <p
            className="text-silver-500 max-w-3xl text-sm text-pretty italic"
            data-testid="about-employer-disclaimer"
          >
            {content.disclaimer}
          </p>
        </Container>
      </Section>

      <ContentSection
        id="aviation"
        title={content.aviationTitle}
        body={content.aviationBody}
      >
        <Link
          href={localePath(locale, routes.aviation.path)}
          className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
        >
          {dictionary.nav.aviation}
        </Link>
      </ContentSection>

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={content.estimateCtaTitle}
        body={content.estimateCtaBody}
        notice={dictionary.pages.estimateShared.notice}
      />
    </main>
  );
}
