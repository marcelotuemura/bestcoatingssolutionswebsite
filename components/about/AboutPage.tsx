import Link from 'next/link';
import { getApprovedAboutFacts } from '@/config/about';
import { routes } from '@/config/routes';
import { getAboutContent } from '@/content/about';
import { CompanyValues } from '@/components/trust/CompanyValues';
import { Container } from '@/components/ui/Container';
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

      <ContentSection id="specialization" title={content.specializationTitle}>
        <BulletList items={content.specialization} />
      </ContentSection>

      <ContentSection id="inspection" title={content.inspectionTitle}>
        <div className="space-y-4">
          {content.inspection.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-silver-300 text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        id="workmanship-approach"
        title={content.workmanshipTitle}
      >
        <div className="space-y-4">
          {content.workmanship.map((paragraph) => (
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
          {dictionary.nav.projects}
        </Link>
      </ContentSection>

      <ContentSection
        id="services-cta"
        title={content.servicesCtaTitle}
        body={content.servicesCtaBody}
      >
        <Link
          href={localePath(locale, routes.services.path)}
          className="text-electric-400 hover:text-electric-300 text-sm underline-offset-2 hover:underline"
        >
          {dictionary.nav.services}
        </Link>
      </ContentSection>

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
