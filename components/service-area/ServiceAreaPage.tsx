import Link from 'next/link';
import {
  getApprovedServiceAreaLocations,
  getApprovedServiceAreaNotes,
  serviceAreaConfig,
} from '@/config/service-area';
import { shouldShowMarinaDirectory } from '@/config/marinas';
import { routes } from '@/config/routes';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, EstimateCtaBand, PageHero } from '@/components/marketing';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ServiceAreaPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.phase5.serviceArea;
  const locations = getApprovedServiceAreaLocations();
  const notes = getApprovedServiceAreaNotes();
  const primary = locations.find(
    (item) => item.kind === 'region' || item.kind === 'primary',
  );
  const additional = locations.filter((item) => item.id !== primary?.id);
  const mapLabel =
    locale === 'es'
      ? serviceAreaConfig.map.labelEs
      : serviceAreaConfig.map.labelEn;

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.serviceArea },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <Section aria-labelledby="primary-area-heading">
        <Container>
          <Heading as="h2" id="primary-area-heading">
            {copy.primaryHeading}
          </Heading>
          {primary ? (
            <div className="mt-4 max-w-3xl" data-testid="service-area-primary">
              <p className="text-lg text-white">{primary.name}</p>
              <p className="text-silver-400 mt-2 text-pretty">
                {locale === 'es' ? primary.summaryEs : primary.summaryEn}
              </p>
            </div>
          ) : null}
        </Container>
      </Section>

      {additional.length > 0 ? (
        <Section aria-labelledby="additional-locations-heading">
          <Container>
            <Heading as="h2" id="additional-locations-heading">
              {copy.additionalHeading}
            </Heading>
            <ul className="mt-4 max-w-3xl space-y-4">
              {additional.map((location) => (
                <li
                  key={location.id}
                  data-testid={`service-area-${location.id}`}
                >
                  <p className="font-medium text-white">{location.name}</p>
                  <p className="text-silver-400 mt-1 text-sm text-pretty">
                    {locale === 'es' ? location.summaryEs : location.summaryEn}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <Section aria-labelledby="service-notes-heading">
        <Container>
          <Heading as="h2" id="service-notes-heading">
            {copy.notesHeading}
          </Heading>
          <ul className="mt-4 max-w-3xl space-y-4">
            {notes.map((note) => (
              <li key={note.id}>
                <p className="font-medium text-white">{note.name}</p>
                <p className="text-silver-400 mt-1 text-sm text-pretty">
                  {locale === 'es' ? note.summaryEs : note.summaryEn}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section aria-labelledby="map-heading">
        <Container>
          <Heading as="h2" id="map-heading">
            {copy.mapHeading}
          </Heading>
          <div
            className="border-navy-700 bg-navy-950/50 mt-4 flex min-h-48 max-w-3xl items-center justify-center rounded-2xl border p-6"
            data-testid="service-area-map-placeholder"
            role="img"
            aria-label={mapLabel}
          >
            <p className="text-silver-400 text-center text-sm text-pretty">
              {mapLabel}
            </p>
          </div>
          {!shouldShowMarinaDirectory() ? (
            <p
              className="text-silver-500 mt-4 max-w-3xl text-sm text-pretty"
              data-testid="marina-directory-pending"
            >
              {copy.marinaPending}
            </p>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <ul className="flex flex-wrap gap-3">
            {[
              { href: routes.services.path, label: copy.linkServices },
              { href: routes.faq.path, label: copy.linkFaq },
              { href: routes.contact.path, label: copy.linkContact },
              { href: routes.estimateRequest.path, label: copy.linkEstimate },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={localePath(locale, link.href)}
                  className="border-navy-600 focus-visible:ring-electric-500 inline-flex rounded-full border px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:outline-none"
                >
                  {link.label}
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
