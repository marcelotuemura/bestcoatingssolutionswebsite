import { buttonClassName } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import {
  Breadcrumbs,
  ContentSection,
  EstimateCtaBand,
  PageHero,
} from '@/components/marketing';
import { ContactForm } from '@/components/forms/ContactForm';
import { businessHours } from '@/config/business-hours';
import { estimatePolicy } from '@/config/estimate-policy';
import { routes } from '@/config/routes';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ContactPageView({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.conversion.contact;
  const hoursLabels = {
    weekdays: copy.weekdays,
    saturday: copy.saturday,
    sunday: copy.sunday,
  } as const;

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.contact },
            ]}
          />
        </Container>
      </Section>

      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <ContentSection id="direct-contact" title={copy.directTitle}>
        <ul className="mt-6 space-y-3">
          <li>
            <a
              href={`tel:${siteConfig.contact.phoneE164}`}
              className={buttonClassName({ variant: 'secondary' })}
              data-testid="contact-phone"
            >
              {dictionary.cta.callBcs}: {siteConfig.contact.phone}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-electric-400 focus-visible:ring-electric-500 rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
              data-testid="contact-email"
            >
              {siteConfig.contact.email}
            </a>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="hours" title={copy.hoursTitle}>
        <ul className="text-silver-300 mt-6 space-y-2 text-sm sm:text-base">
          {businessHours.days.map((day) => (
            <li key={day.id}>
              <span className="text-silver-100">
                {hoursLabels[day.daysKey]}
              </span>
              {': '}
              {day.open && day.close
                ? `${day.open} – ${day.close} (${businessHours.timezoneLabel})`
                : copy.closed}
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection
        id="service-area"
        title={copy.areaTitle}
        body={copy.areaBody}
      >
        <p className="text-silver-500 mt-4 text-sm">
          {estimatePolicy.publicNotice}
        </p>
      </ContentSection>

      <Section id="contact-form" aria-labelledby="contact-form-heading">
        <Container>
          <Heading as="h2" id="contact-form-heading">
            {copy.formTitle}
          </Heading>
          <p className="text-silver-300 mt-4 max-w-2xl text-pretty">
            {copy.formLead}
          </p>
          <div className="mt-8 max-w-2xl">
            <ContactForm locale={locale} dictionary={dictionary} />
          </div>
        </Container>
      </Section>

      <ContentSection id="map" title={copy.mapTitle}>
        <div
          className="border-navy-700 bg-navy-950 mt-6 flex aspect-[16/9] max-w-3xl items-center justify-center rounded-2xl border border-dashed p-6 text-center"
          data-testid="map-placeholder"
        >
          <p className="text-silver-500 text-sm">{copy.mapPlaceholder}</p>
        </div>
      </ContentSection>

      <ContentSection id="what-next" title={copy.nextTitle}>
        <ol className="text-silver-300 mt-6 list-decimal space-y-2 pl-5">
          {copy.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="mt-8">
          <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
            {dictionary.cta.estimate}
          </ButtonLink>
        </div>
      </ContentSection>

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={dictionary.pages.estimateShared.title}
        body={dictionary.pages.estimateShared.body}
        notice={dictionary.pages.estimateShared.notice}
        mode="estimate"
      />
    </main>
  );
}
