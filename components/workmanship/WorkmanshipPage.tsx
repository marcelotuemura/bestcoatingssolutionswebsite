import Link from 'next/link';
import { routes } from '@/config/routes';
import { getWorkmanshipContent } from '@/content/workmanship';
import { Container } from '@/components/ui/Container';
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

export function WorkmanshipPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const content = getWorkmanshipContent(locale);
  const copy = dictionary.phase5.workmanship;

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.workmanship },
            ]}
          />
        </Container>
      </Section>

      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <Section>
        <Container>
          <aside
            className="border-navy-700 bg-navy-950/60 max-w-3xl space-y-3 rounded-2xl border p-5"
            data-testid="workmanship-legal-notice"
          >
            <p className="text-silver-200 text-sm text-pretty">
              {content.legalReviewNotice}
            </p>
            <p className="text-silver-300 text-sm text-pretty">
              {content.warrantyDisclaimer}
            </p>
            <p className="text-silver-300 text-sm text-pretty">
              {content.coverageDisclaimer}
            </p>
          </aside>
        </Container>
      </Section>

      {content.sections.map((section) => (
        <ContentSection key={section.id} id={section.id} title={section.title}>
          <div className="space-y-3">
            {section.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="text-silver-300 text-pretty"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </ContentSection>
      ))}

      <Section>
        <Container>
          <div className="flex flex-wrap gap-3">
            <Link
              href={localePath(locale, routes.contact.path)}
              className="border-navy-600 focus-visible:ring-electric-500 inline-flex rounded-full border px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:outline-none"
              data-testid="workmanship-contact-cta"
            >
              {copy.contactCta}
            </Link>
            <Link
              href={localePath(locale, routes.estimateRequest.path)}
              className="bg-electric-500 focus-visible:ring-electric-500 inline-flex rounded-full px-4 py-2 text-sm font-medium text-white focus-visible:ring-2 focus-visible:outline-none"
              data-testid="workmanship-estimate-cta"
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
