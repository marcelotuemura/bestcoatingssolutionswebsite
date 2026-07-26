import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, PageHero } from '@/components/marketing';
import { EstimateRequestForm } from '@/components/forms/EstimateRequestForm';
import { estimatePolicy } from '@/config/estimate-policy';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

export function EstimateRequestPageView({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.conversion.estimate;

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.estimateRequest },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <Section>
        <Container>
          <p className="text-text-muted max-w-2xl text-sm text-pretty">
            {copy.policyNote}
          </p>
          <p className="sr-only">{estimatePolicy.publicNotice}</p>
          <p
            className="text-text-secondary border-border mt-4 max-w-2xl rounded-[var(--radius-control)] border px-4 py-3 text-sm"
            role="status"
            data-testid="estimate-no-aviation-notice"
          >
            {copy.noAviation}
          </p>
          <div className="mt-10 max-w-2xl">
            <Heading as="h2" className="sr-only">
              {copy.title}
            </Heading>
            <EstimateRequestForm locale={locale} dictionary={dictionary} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
