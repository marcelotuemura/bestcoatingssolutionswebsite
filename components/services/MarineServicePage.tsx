import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import {
  Breadcrumbs,
  BulletList,
  ContentSection,
  EstimateCtaBand,
  FaqSection,
  PageHero,
  ProcessSteps,
} from '@/components/marketing';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import type { ServicePageContent } from '@/content/marine-services-en';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

export function MarineServicePage({
  locale,
  dictionary,
  content,
  breadcrumbServicesLabel,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly content: ServicePageContent;
  readonly breadcrumbServicesLabel: string;
}) {
  return (
    <main id="main-content">
      <Section className="pt-10 pb-0 sm:pt-14">
        <Container>
          <Breadcrumbs
            locale={locale}
            ariaLabel={dictionary.a11y.breadcrumbs}
            items={[
              { label: dictionary.nav.home, href: '/' },
              { label: breadcrumbServicesLabel, href: '/services' },
              { label: content.title },
            ]}
          />
        </Container>
      </Section>

      <PageHero
        eyebrow={content.heroEyebrow}
        title={content.title}
        lead={content.heroLead}
        imageSrc={marketingPlaceholders.serviceHero.src}
        imageLabel={dictionary.placeholder.mediaLabel}
      />

      <ContentSection
        id="overview"
        title={dictionary.pages.marine.overviewTitle}
        body={content.overview}
      />

      <ContentSection id="common-problems" title={content.problemsTitle}>
        <BulletList items={content.problems} />
      </ContentSection>

      <ContentSection id="our-process" title={content.processTitle}>
        <ProcessSteps steps={content.processSteps} />
      </ContentSection>

      <ContentSection id="why-bcs" title={content.whyTitle}>
        <BulletList items={content.whyPoints} />
      </ContentSection>

      <FaqSection title={content.faqTitle} items={content.faqs} />

      <EstimateCtaBand
        locale={locale}
        dictionary={dictionary}
        title={dictionary.pages.estimateShared.title}
        body={dictionary.pages.estimateShared.body}
        notice={dictionary.pages.estimateShared.notice}
      />
    </main>
  );
}
