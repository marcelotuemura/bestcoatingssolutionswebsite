import Link from 'next/link';
import {
  getPublishedResources,
  type ResourceRecord,
} from '@/content/resources';
import { EducationalDisclaimer } from '@/components/trust/EducationalDisclaimer';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, EstimateCtaBand, PageHero } from '@/components/marketing';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ResourcesIndexPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.phase5.resources;
  const resources = getPublishedResources();

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.resources },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <Section>
        <Container>
          <EducationalDisclaimer
            title={dictionary.phase5.educationalDisclaimer.title}
            body={dictionary.phase5.educationalDisclaimer.body}
          />
        </Container>
      </Section>

      <Section aria-labelledby="resources-list-heading">
        <Container>
          <Heading as="h2" id="resources-list-heading" className="sr-only">
            {copy.title}
          </Heading>
          {resources.length === 0 ? (
            <div data-testid="resources-empty">
              <p className="text-lg text-white">{copy.emptyTitle}</p>
              <p className="text-silver-400 mt-2">{copy.emptyBody}</p>
            </div>
          ) : (
            <ul
              className="grid gap-6 sm:grid-cols-2"
              data-testid="resources-list"
            >
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  locale={locale}
                  resource={resource}
                  categoryLabel={copy.categoryLabel}
                />
              ))}
            </ul>
          )}
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

function ResourceCard({
  locale,
  resource,
  categoryLabel,
}: {
  readonly locale: Locale;
  readonly resource: ResourceRecord;
  readonly categoryLabel: string;
}) {
  const copy = resource.copy[locale];
  return (
    <li className="border-navy-700 rounded-2xl border p-5">
      <p className="text-silver-500 text-xs tracking-wide uppercase">
        {categoryLabel}: {resource.category}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">
        <Link
          href={localePath(locale, `/resources/${resource.slug}`)}
          className="hover:text-electric-400 focus-visible:ring-electric-500 rounded focus-visible:ring-2 focus-visible:outline-none"
        >
          {copy.title}
        </Link>
      </h2>
      <p className="text-silver-400 mt-2 text-sm text-pretty">{copy.summary}</p>
    </li>
  );
}
