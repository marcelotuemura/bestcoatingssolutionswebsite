import Link from 'next/link';
import { DivisionHero } from '@/components/divisions/DivisionHero';
import { DivisionProcess } from '@/components/divisions/DivisionProcess';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import {
  Breadcrumbs,
  BulletList,
  ContentSection,
  EstimateCtaBand,
} from '@/components/marketing';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import { routes } from '@/config/routes';
import { listMarineServiceSummaries } from '@/content/marine-services';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Phase 5E — Marine division.
 * Same design language as Aviation; atmosphere through marine photography/content.
 */
export function MarineDivisionPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.pages.marine;
  const services = listMarineServiceSummaries(locale);

  return (
    <main id="main-content" data-testid="marine-division-page">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.marine },
            ]}
          />
        </Container>
      </Section>

      <DivisionHero
        atmosphere="marine"
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        imageSrc={marketingPlaceholders.marineHero.src}
        imageLabel={dictionary.placeholder.mediaLabel}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
            {dictionary.cta.estimate}
          </ButtonLink>
          <ButtonLink
            href={localePath(locale, routes.services.path)}
            variant="secondary"
          >
            {dictionary.cta.viewServices}
          </ButtonLink>
        </div>
      </DivisionHero>

      <ContentSection
        id="overview"
        title={copy.overviewTitle}
        body={copy.overview}
      >
        <p className="text-text-muted mt-5 text-sm text-pretty">
          {copy.atmosphere}
        </p>
      </ContentSection>

      <DivisionProcess
        eyebrow={copy.processEyebrow}
        title={copy.processTitle}
        lead={copy.processLead}
        steps={copy.processSteps}
      />

      <ContentSection id="capabilities" title={copy.capabilitiesTitle}>
        <BulletList items={copy.capabilities} />
      </ContentSection>

      <Section
        id="marine-services"
        className="py-16 sm:py-24"
        aria-labelledby="marine-services-heading"
      >
        <Container>
          <Reveal className="max-w-3xl">
            <Heading as="h2" id="marine-services-heading">
              {copy.servicesCtaTitle}
            </Heading>
            <p className="text-text-secondary mt-5 text-lg text-pretty">
              {copy.servicesCtaBody}
            </p>
          </Reveal>
          <RevealStagger className="divide-border/70 border-border/70 mt-12 divide-y border-y">
            {services.map((service) => (
              <RevealItem key={service.slug}>
                <Link
                  href={localePath(locale, `/services/${service.slug}`)}
                  className="hover:bg-surface/40 focus-visible:ring-focus-ring group block py-6 transition focus-visible:ring-2 focus-visible:outline-none sm:py-7"
                  data-testid={`service-link-${service.slug}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                    <h3 className="text-text-primary group-hover:text-accent-hover text-lg font-medium tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-text-secondary max-w-xl text-sm text-pretty">
                      {service.lead}
                    </p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealStagger>
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
