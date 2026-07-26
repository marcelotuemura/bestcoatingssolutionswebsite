import { getApprovedAboutFacts } from '@/config/about';
import { getAboutContent } from '@/content/about';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import {
  Breadcrumbs,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

/**
 * Phase 5G — About as craftsman culmination.
 * Deepens trust already built on the site; company stays center, Marcelo reinforces credibility.
 */
export function AboutPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const content = getAboutContent(locale);
  const approvedFacts = getApprovedAboutFacts();

  return (
    <main id="main-content" data-testid="about-page">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.about },
            ]}
          />
        </Container>
      </Section>

      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <Section aria-labelledby="about-photo-heading" className="pt-0">
        <Container>
          <Reveal>
            <div
              className="bcs-marine-texture border-border relative flex min-h-[16rem] items-end overflow-hidden rounded-[var(--radius-media)] border p-6 sm:min-h-[22rem] sm:p-8"
              data-testid="about-photo-slot"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d18]/85 via-[#050d18]/30 to-transparent"
              />
              <div className="relative">
                <h2 id="about-photo-heading" className="sr-only">
                  {content.title}
                </h2>
                <p className="text-text-muted max-w-xl text-sm text-pretty">
                  {content.photoNote}
                </p>
              </div>
            </div>
          </Reveal>
          {approvedFacts.length === 0 ? (
            <p
              className="text-text-muted mt-4 max-w-3xl text-sm text-pretty"
              data-testid="about-owner-facts-pending"
            >
              {dictionary.phase5.about.ownerFactsPending}
            </p>
          ) : (
            <ul className="text-text-secondary mt-4 max-w-3xl space-y-2 text-sm">
              {approvedFacts.map((fact) => (
                <li key={fact.id}>
                  <span className="text-text-primary">{fact.label}:</span>{' '}
                  {fact.value}
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <ContentSection id="where-it-began" title={content.beganTitle}>
        <div className="mt-5 space-y-4">
          {content.began.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-text-secondary text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        id="experience-across-industries"
        title={content.industriesTitle}
      >
        <div className="mt-5 space-y-4">
          {content.industries.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-text-secondary text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </ContentSection>

      <Section
        id="why-bcs-exists"
        className="py-16 sm:py-24"
        aria-labelledby="why-bcs-exists-heading"
      >
        <Container>
          <Reveal className="max-w-3xl">
            <Heading as="h2" id="why-bcs-exists-heading">
              {content.whyExistsTitle}
            </Heading>
            <div className="mt-6 space-y-5">
              {content.whyExists.map((paragraph, index) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className={
                    index === 0
                      ? 'text-text-primary text-xl text-pretty sm:text-2xl'
                      : 'text-text-secondary text-lg text-pretty'
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section
        id="standards"
        aria-labelledby="about-standards-heading"
        data-testid="about-standards"
      >
        <Container>
          <Reveal className="max-w-3xl">
            <Heading as="h2" id="about-standards-heading">
              {content.standardsTitle}
            </Heading>
            <p className="text-text-secondary mt-4 text-pretty">
              {content.standardsIntro}
            </p>
          </Reveal>
          <RevealStagger className="divide-border/70 border-border/70 mt-10 max-w-3xl divide-y border-y">
            {content.standards.map((standard, index) => (
              <RevealItem key={standard.id}>
                <div className="py-6 sm:py-7">
                  <p className="text-accent text-xs tracking-[0.2em] uppercase">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-text-primary mt-2 text-lg font-medium tracking-tight">
                    {standard.title}
                  </h3>
                  <p className="text-text-secondary mt-2 text-sm text-pretty">
                    {standard.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      <Section
        id="professional-background"
        aria-labelledby="professional-background-heading"
        data-testid="about-professional-background"
      >
        <Container>
          <Reveal className="max-w-3xl">
            <Heading as="h2" id="professional-background-heading">
              {content.backgroundTitle}
            </Heading>
            <p className="text-text-muted mt-4 text-sm text-pretty">
              {content.backgroundIntro}
            </p>
            <ol className="mt-8 space-y-6">
              {content.backgroundEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="border-border/80 border-l pl-5"
                  data-testid={`about-background-${entry.id}`}
                >
                  <p className="text-text-muted text-xs tracking-[0.14em] uppercase">
                    {entry.label}
                  </p>
                  <p className="text-text-secondary mt-2 text-sm text-pretty">
                    {entry.detail}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      <Section
        id="employer-disclaimer"
        aria-labelledby="employer-disclaimer-heading"
        className="pt-0"
      >
        <Container>
          <h2 id="employer-disclaimer-heading" className="sr-only">
            {content.disclaimerHeading}
          </h2>
          <p
            className="text-text-muted max-w-3xl text-sm text-pretty italic"
            data-testid="about-employer-disclaimer"
          >
            {content.disclaimer}
          </p>
        </Container>
      </Section>

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={content.invitationTitle}
        body={content.invitationBody}
        mode="contact"
      />
    </main>
  );
}
