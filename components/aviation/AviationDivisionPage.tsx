import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import {
  Breadcrumbs,
  BulletList,
  ComingSoonBadge,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import { divisions } from '@/config/divisions';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function AviationDivisionPage({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.pages.aviation;
  const status = divisions.aviation.status;

  return (
    <main id="main-content">
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
        badge={<ComingSoonBadge label={dictionary.divisionStatus[status]} />}
        imageSrc={marketingPlaceholders.aviationHero.src}
        imageLabel={dictionary.placeholder.mediaLabel}
      >
        <p
          className="text-silver-300 max-w-xl rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
          role="status"
          data-testid="aviation-coming-soon"
        >
          {copy.notice}
        </p>
      </PageHero>

      <ContentSection
        id="overview"
        title={copy.overviewTitle}
        body={copy.overview}
      />

      <ContentSection id="future-capabilities" title={copy.futureTitle}>
        <BulletList items={copy.future} />
      </ContentSection>

      <ContentSection
        id="quality-philosophy"
        title={copy.qualityTitle}
        body={copy.quality}
      />

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={copy.contactTitle}
        body={copy.contactBody}
      />

      <Section className="pt-0">
        <Container>
          <ButtonLink href={localePath(locale, routes.contact.path)}>
            {dictionary.cta.contactUs}
          </ButtonLink>
        </Container>
      </Section>
    </main>
  );
}
