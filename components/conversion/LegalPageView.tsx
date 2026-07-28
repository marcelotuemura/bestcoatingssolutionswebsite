import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, PageHero } from '@/components/marketing';
import { legalConfig } from '@/config/legal';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

export function LegalPageView({
  locale,
  dictionary,
  kind,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly kind: 'privacy' | 'terms';
}) {
  const copy = dictionary.conversion[kind];

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              {
                label:
                  kind === 'privacy'
                    ? dictionary.nav.privacy
                    : dictionary.nav.terms,
              },
            ]}
          />
        </Container>
      </Section>

      <PageHero title={copy.title} lead={copy.lead}>
        <p
          className="text-text-secondary text-sm"
          data-testid="legal-last-updated"
        >
          {copy.lastUpdatedLabel}: {legalConfig.documentsLastUpdated}
        </p>
      </PageHero>

      <Section>
        <Container narrow>
          <div className="space-y-10">
            {copy.sections.map((section) => (
              <section key={section.title} aria-labelledby={section.title}>
                <Heading as="h2" id={section.title}>
                  {section.title}
                </Heading>
                <p className="text-text-secondary mt-3 text-pretty">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
