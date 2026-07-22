import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, EstimateCtaBand, PageHero } from '@/components/marketing';
import { listMarineServiceSummaries } from '@/content/marine-services';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ServicesIndexPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.pages.services;
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
              { label: dictionary.nav.marine, href: '/marine' },
              { label: dictionary.nav.services },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <Section id="service-index" aria-labelledby="service-index-heading">
        <Container>
          <h2 id="service-index-heading" className="sr-only">
            {copy.title}
          </h2>
          <p className="text-silver-400 max-w-2xl text-pretty">
            {copy.indexNote}
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={localePath(locale, `/services/${service.slug}`)}
                  className="border-navy-700 hover:border-electric-500/40 focus-visible:ring-electric-500 block h-full rounded-2xl border p-5 transition focus-visible:ring-2 focus-visible:outline-none"
                  data-testid={`service-link-${service.slug}`}
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
