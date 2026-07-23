import { buttonClassName } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import {
  Breadcrumbs,
  BulletList,
  ContentSection,
  PageHero,
} from '@/components/marketing';
import { routes } from '@/config/routes';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ScheduleVisitPageView({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.conversion.schedule;

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.scheduleVisit },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <ContentSection id="process" title={copy.processTitle}>
        <ol className="text-silver-300 mt-6 list-decimal space-y-2 pl-5">
          {copy.process.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p
          className="text-silver-300 mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
          role="status"
          data-testid="schedule-no-confirm"
        >
          {copy.noConfirm}
        </p>
      </ContentSection>

      <ContentSection id="checklist" title={copy.checklistTitle}>
        <BulletList items={copy.checklist} />
      </ContentSection>

      <ContentSection
        id="access"
        title={copy.accessTitle}
        body={copy.accessBody}
      />

      <ContentSection
        id="photos"
        title={copy.photoTitle}
        body={copy.photoBody}
      />

      <Section>
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.contact.path)}
              variant="secondary"
            >
              {dictionary.cta.contactUs}
            </ButtonLink>
            <a
              href={`tel:${siteConfig.contact.phoneE164}`}
              className={buttonClassName({ variant: 'secondary' })}
            >
              {dictionary.cta.callBcs}
            </a>
          </div>
        </Container>
      </Section>
    </main>
  );
}
