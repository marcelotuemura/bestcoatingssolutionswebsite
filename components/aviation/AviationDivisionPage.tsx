import {
  Breadcrumbs,
  BulletList,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

/**
 * Aviation division — publicly visible, carefully scoped cosmetic refinishing.
 * Contact for inquiries. Does not claim FAA / structural / mechanical work.
 */
export function AviationDivisionPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.pages.aviation;

  return (
    <main id="main-content" data-testid="aviation-division-page">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.aviation },
            ]}
          />
        </Container>
      </Section>

      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        imageSrc={marketingPlaceholders.aviationHero.src}
        imageLabel={dictionary.placeholder.mediaLabel}
      >
        <p
          className="text-text-secondary border-border bg-surface/60 max-w-xl rounded-[var(--radius-control)] border px-4 py-3 text-sm"
          role="note"
          data-testid="aviation-scope-note"
        >
          {copy.notice}
        </p>
      </PageHero>

      <ContentSection
        id="overview"
        title={copy.overviewTitle}
        body={copy.overview}
      />

      <ContentSection id="capabilities" title={copy.capabilitiesTitle}>
        <BulletList items={copy.capabilities} />
      </ContentSection>

      <ContentSection
        id="quality"
        title={copy.qualityTitle}
        body={copy.quality}
      />

      <ContentSection id="scope" title={copy.scopeTitle} body={copy.scope} />

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={copy.contactTitle}
        body={copy.contactBody}
        notice={copy.contactNotice}
        mode="contact"
      />
    </main>
  );
}
