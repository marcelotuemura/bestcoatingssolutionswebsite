import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, PageHero } from '@/components/marketing';
import { EstimateRequestForm } from '@/components/forms/EstimateRequestForm';
import { estimatePolicy } from '@/config/estimate-policy';
import { isDemoSubmissionMode } from '@/config/launch';
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
  const demoMode = isDemoSubmissionMode();
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;

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
          <p className="text-silver-400 max-w-2xl text-sm text-pretty">
            {copy.policyNote}
          </p>
          <p className="sr-only">{estimatePolicy.publicNotice}</p>
          <p
            className="text-silver-300 mt-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
            role="status"
          >
            {copy.noAviation}
          </p>
          <div className="mt-10 max-w-2xl">
            <Heading as="h2" className="sr-only">
              {copy.title}
            </Heading>
            <EstimateRequestForm
              locale={locale}
              dictionary={dictionary}
              demoMode={demoMode}
              turnstileSiteKey={turnstileSiteKey}
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
