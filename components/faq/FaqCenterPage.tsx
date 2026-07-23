import Link from 'next/link';
import { faqCategories } from '@/config/faq';
import { routes } from '@/config/routes';
import type { FaqCategoryContent } from '@/content/faq';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, EstimateCtaBand, PageHero } from '@/components/marketing';

export function FaqCenterPage({
  locale,
  dictionary,
  categories,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly categories: readonly FaqCategoryContent[];
}) {
  const copy = dictionary.phase5.faq;

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.faq },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <Section aria-labelledby="faq-categories-heading">
        <Container>
          <Heading as="h2" id="faq-categories-heading">
            {copy.categoriesHeading}
          </Heading>
          <p className="text-silver-500 mt-2 text-sm">{copy.expandHint}</p>
          <nav
            aria-label={copy.categoriesHeading}
            className="mt-6"
            data-testid="faq-category-nav"
          >
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`#faq-${category.id}`}
                    className="border-navy-600 text-silver-200 hover:border-electric-500 hover:text-electric-400 focus-visible:ring-electric-500 inline-flex rounded-full border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {category.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </Section>

      {categories.map((category) => {
        const definition = faqCategories.find(
          (item) => item.id === category.id,
        );
        return (
          <Section
            key={category.id}
            id={`faq-${category.id}`}
            aria-labelledby={`faq-${category.id}-heading`}
          >
            <Container>
              <Heading as="h2" id={`faq-${category.id}-heading`}>
                {category.title}
              </Heading>
              <p className="text-silver-400 mt-2 max-w-3xl text-pretty">
                {category.description}
              </p>
              <div className="mt-6 max-w-3xl space-y-3">
                {category.items.map((item) => (
                  <details
                    key={item.id}
                    id={item.id}
                    className="border-navy-700 group rounded-2xl border px-5 py-4"
                    data-testid={`faq-item-${item.id}`}
                  >
                    <summary className="focus-visible:ring-electric-500 cursor-pointer list-none text-base font-medium text-white focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-start justify-between gap-4">
                        {item.question}
                        <span
                          aria-hidden="true"
                          className="text-silver-500 transition group-open:rotate-45"
                        >
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="text-silver-400 mt-3 text-sm text-pretty sm:text-base">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
              {definition && definition.relatedServiceSlugs.length > 0 ? (
                <div className="mt-6">
                  <p className="text-sm font-medium text-white">
                    {copy.relatedServices}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-3">
                    {definition.relatedServiceSlugs.map((slug) => (
                      <li key={slug}>
                        <Link
                          href={localePath(locale, `/services/${slug}`)}
                          className="text-electric-400 hover:text-electric-300 focus-visible:ring-electric-500 text-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {slug.replace(/-/g, ' ')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Container>
          </Section>
        );
      })}

      <Section>
        <Container>
          <div className="flex flex-wrap gap-3">
            <Link
              href={localePath(locale, routes.contact.path)}
              className="border-navy-600 hover:border-electric-500 focus-visible:ring-electric-500 inline-flex rounded-full border px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:outline-none"
            >
              {copy.contactCta}
            </Link>
            <Link
              href={localePath(locale, routes.estimateRequest.path)}
              className="bg-electric-500 hover:bg-electric-400 focus-visible:ring-electric-500 inline-flex rounded-full px-4 py-2 text-sm font-medium text-white focus-visible:ring-2 focus-visible:outline-none"
            >
              {copy.estimateCta}
            </Link>
          </div>
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
