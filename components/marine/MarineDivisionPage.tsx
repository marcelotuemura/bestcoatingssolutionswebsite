import Link from 'next/link';
import { ButtonLink } from '@/components/ui/ButtonLink';
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
import { Reveal } from '@/components/home/Reveal';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import { routes } from '@/config/routes';
import { listMarineServiceSummaries } from '@/content/marine-services';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

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
    <main id="main-content">
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

      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        imageSrc={marketingPlaceholders.marineHero.src}
        imageLabel={dictionary.placeholder.mediaLabel}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={localePath(locale, routes.services.path)}>
            {dictionary.cta.viewServices}
          </ButtonLink>
          <ButtonLink
            href={localePath(locale, routes.estimateRequest.path)}
            variant="secondary"
          >
            {dictionary.cta.estimate}
          </ButtonLink>
        </div>
      </PageHero>

      <ContentSection
        id="overview"
        title={copy.overviewTitle}
        body={copy.overview}
      />

      <ContentSection id="capabilities" title={copy.capabilitiesTitle}>
        <BulletList items={copy.capabilities} />
      </ContentSection>

      <Section id="marine-services" aria-labelledby="marine-services-heading">
        <Container>
          <Reveal className="max-w-3xl">
            <Heading as="h2" id="marine-services-heading">
              {copy.servicesCtaTitle}
            </Heading>
            <p className="text-silver-300 mt-5 text-lg text-pretty">
              {copy.servicesCtaBody}
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={localePath(locale, `/services/${service.slug}`)}
                  className="border-navy-700 hover:border-electric-500/40 focus-visible:ring-electric-500 block rounded-2xl border p-5 transition focus-visible:ring-2 focus-visible:outline-none"
                >
                  <h3 className="text-lg font-medium text-white">
                    {service.title}
                  </h3>
                  <p className="text-silver-400 mt-2 text-sm text-pretty">
                    {service.lead}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
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
