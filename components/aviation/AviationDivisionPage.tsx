import { DivisionHero } from '@/components/divisions/DivisionHero';
import { DivisionProcess } from '@/components/divisions/DivisionProcess';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import {
  Breadcrumbs,
  ContentSection,
  EstimateCtaBand,
} from '@/components/marketing';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Phase 5F — Aviation division.
 * Same design language as Marine; atmosphere through aviation materials/content.
 * Cosmetic refinishing only — no FAA / structural / mechanical claims.
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

      <DivisionHero
        atmosphere="aviation"
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        imageSrc={marketingPlaceholders.aviationHero.src}
        imageLabel={dictionary.placeholder.mediaLabel}
      >
        <p
          className="text-text-secondary border-border bg-surface/50 max-w-xl rounded-[var(--radius-control)] border px-4 py-3 text-sm text-pretty"
          role="note"
          data-testid="aviation-scope-note"
        >
          {copy.notice}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={localePath(locale, routes.contact.path)}>
            {dictionary.cta.contactUs}
          </ButtonLink>
          <ButtonLink
            href={localePath(locale, routes.marine.path)}
            variant="secondary"
          >
            {dictionary.cta.exploreMarine}
          </ButtonLink>
        </div>
      </DivisionHero>

      <ContentSection
        id="overview"
        title={copy.overviewTitle}
        body={copy.overview}
      >
        <p className="text-text-muted mt-5 text-sm text-pretty">
          {copy.atmosphere}
        </p>
      </ContentSection>

      <DivisionProcess
        eyebrow={copy.processEyebrow}
        title={copy.processTitle}
        lead={copy.processLead}
        steps={copy.processSteps}
      />

      <Section
        id="capabilities"
        className="py-16 sm:py-24"
        aria-labelledby="capabilities-heading"
      >
        <Container>
          <Reveal className="max-w-3xl">
            <Heading as="h2" id="capabilities-heading">
              {copy.capabilitiesTitle}
            </Heading>
            <p className="text-text-secondary mt-5 text-lg text-pretty">
              {copy.capabilitiesLead}
            </p>
          </Reveal>
          <RevealStagger className="divide-border/70 border-border/70 mt-12 divide-y border-y">
            {copy.capabilities.map((item) => (
              <RevealItem key={item}>
                <div className="py-5 sm:py-6">
                  <p className="text-text-primary text-lg font-medium tracking-tight">
                    {item}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

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
