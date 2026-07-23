import { buttonClassName } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs, ContentSection, PageHero } from '@/components/marketing';
import { routes } from '@/config/routes';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export type ThankYouType = 'contact' | 'estimate' | 'fallback';
export type ThankYouStatus = 'prepared' | 'delivered';

export function ThankYouPageView({
  locale,
  dictionary,
  type,
  status = 'prepared',
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly type: ThankYouType;
  readonly status?: ThankYouStatus;
}) {
  const copy = dictionary.conversion.thankYou;
  const delivered = status === 'delivered';

  const title =
    type === 'contact'
      ? delivered
        ? copy.contactDeliveredTitle
        : copy.contactTitle
      : type === 'estimate'
        ? delivered
          ? copy.estimateDeliveredTitle
          : copy.estimateTitle
        : copy.fallbackTitle;
  const body =
    type === 'contact'
      ? delivered
        ? copy.contactDeliveredBody
        : copy.contactBody
      : type === 'estimate'
        ? delivered
          ? copy.estimateDeliveredBody
          : copy.estimateBody
        : copy.fallbackBody;

  const nextSteps = delivered ? copy.nextSteps : copy.nextStepsDemo;

  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: dictionary.nav.thankYou },
            ]}
          />
        </Container>
      </Section>

      <PageHero title={title} lead={body} />

      <ContentSection id="next" title={copy.nextTitle}>
        <ol className="text-silver-300 mt-6 list-decimal space-y-2 pl-5">
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="text-silver-500 mt-4 text-sm">{copy.noFixedTime}</p>
      </ContentSection>

      <Section>
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${siteConfig.contact.phoneE164}`}
              className={buttonClassName({ variant: 'primary' })}
            >
              {dictionary.cta.callBcs}
            </a>
            <ButtonLink href={localePath(locale)} variant="secondary">
              {dictionary.nav.home}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.services.path)}
              variant="secondary"
            >
              {dictionary.cta.viewServices}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
