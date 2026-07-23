import Link from 'next/link';
import { routes } from '@/config/routes';
import { getRelatedResources, type ResourceRecord } from '@/content/resources';
import { EducationalDisclaimer } from '@/components/trust/EducationalDisclaimer';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
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

function looksLikeBulletList(body: readonly string[]): boolean {
  if (body.length < 2) {
    return false;
  }
  return body.every(
    (item) => item.length < 180 && !item.includes('. ') && !item.includes('?'),
  );
}

export function ResourceDetailPage({
  locale,
  dictionary,
  resource,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly resource: ResourceRecord;
}) {
  const copy = resource.copy[locale];
  const labels = dictionary.phase5.resources;
  const related = getRelatedResources(resource);

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.resources, href: '/resources' },
              { label: copy.title },
            ]}
          />
        </Container>
      </Section>

      <PageHero
        eyebrow={resource.category}
        title={copy.title}
        lead={copy.summary}
      />

      <Section>
        <Container>
          <dl className="text-silver-400 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="sr-only">{labels.authorLabel}</dt>
              <dd>
                {labels.authorLabel}: {resource.authorDisplayName}
              </dd>
            </div>
            {resource.publishedAt ? (
              <div>
                <dt className="sr-only">{labels.publishedLabel}</dt>
                <dd>
                  {labels.publishedLabel}: {resource.publishedAt}
                </dd>
              </div>
            ) : null}
            {resource.updatedAt ? (
              <div>
                <dt className="sr-only">{labels.updatedLabel}</dt>
                <dd>
                  {labels.updatedLabel}: {resource.updatedAt}
                </dd>
              </div>
            ) : null}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container>
          <EducationalDisclaimer
            title={dictionary.phase5.educationalDisclaimer.title}
            body={dictionary.phase5.educationalDisclaimer.body}
          />
        </Container>
      </Section>

      {copy.sections.map((section) => (
        <ContentSection
          key={section.id}
          id={section.id}
          title={section.heading}
        >
          {looksLikeBulletList(section.body) ? (
            <ul className="text-silver-300 list-disc space-y-2 pl-5">
              {section.body.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-silver-300 text-pretty"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </ContentSection>
      ))}

      {resource.relatedServiceSlugs.length > 0 ? (
        <Section aria-labelledby="resource-related-services">
          <Container>
            <Heading as="h2" id="resource-related-services">
              {labels.relatedServices}
            </Heading>
            <ul className="mt-4 flex flex-wrap gap-3">
              {resource.relatedServiceSlugs.map((slug) => (
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
          </Container>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section aria-labelledby="resource-related-resources">
          <Container>
            <Heading as="h2" id="resource-related-resources">
              {labels.relatedResources}
            </Heading>
            <ul className="mt-4 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={localePath(locale, `/resources/${item.slug}`)}
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

      <Section>
        <Container>
          <ul className="flex flex-wrap gap-3">
            <li>
              <Link
                href={localePath(locale, routes.faq.path)}
                className="border-navy-600 inline-flex rounded-full border px-4 py-2 text-sm text-white"
              >
                {labels.linkFaq}
              </Link>
            </li>
            <li>
              <Link
                href={localePath(locale, routes.contact.path)}
                className="border-navy-600 inline-flex rounded-full border px-4 py-2 text-sm text-white"
              >
                {labels.linkContact}
              </Link>
            </li>
            <li>
              <Link
                href={localePath(locale, routes.estimateRequest.path)}
                className="bg-electric-500 inline-flex rounded-full px-4 py-2 text-sm font-medium text-white"
              >
                {labels.linkEstimate}
              </Link>
            </li>
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
