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
import {
  RelatedServices,
  ServiceContextLinks,
} from '@/components/services/ServiceLinks';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import type { MarineServiceSlug } from '@/config/marine-services';
import type { ServicePageContent } from '@/content/marine-services-en';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

/**
 * Canonical marine service page section order:
 * Hero → Overview → Common Problems → Our Process → Why Choose BCS → FAQ → Related → Estimate CTA
 */
export function MarineServicePage({
  locale,
  dictionary,
  content,
  slug,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly content: ServicePageContent;
  readonly slug: MarineServiceSlug;
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
              { label: dictionary.nav.marine, href: '/marine' },
              { label: dictionary.nav.services, href: '/services' },
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

      <ServiceContextLinks locale={locale} dictionary={dictionary} />

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

      <ContentSection id="why-choose-bcs" title={content.whyTitle}>
        <BulletList items={content.whyPoints} />
      </ContentSection>

      <FaqSection title={content.faqTitle} items={content.faqs} />

      <RelatedServices locale={locale} dictionary={dictionary} slug={slug} />

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
