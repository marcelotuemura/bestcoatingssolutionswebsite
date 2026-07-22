import { AviationSection } from '@/components/home/AviationSection';
import { BeforeAfterSection } from '@/components/home/BeforeAfterSection';
import { EstimateCtaSection } from '@/components/home/EstimateCtaSection';
import { FeaturedProjectSection } from '@/components/home/FeaturedProjectSection';
import { HeroSection } from '@/components/home/HeroSection';
import { MarineSection } from '@/components/home/MarineSection';
import { ProcessSection } from '@/components/home/ProcessSection';
import { ServiceAreaSection } from '@/components/home/ServiceAreaSection';
import { WhoWeAreSection } from '@/components/home/WhoWeAreSection';
import { WhyBcsSection } from '@/components/home/WhyBcsSection';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

export interface HomePageProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

/**
 * Premium homepage composition — story order per HOME_EXPERIENCE.md /
 * Phase 2 authorization (portal teaser omitted while disabled).
 */
export function HomePage({ locale, dictionary }: HomePageProps) {
  return (
    <main id="main-content">
      <HeroSection locale={locale} dictionary={dictionary} />
      <WhoWeAreSection locale={locale} dictionary={dictionary} />
      <MarineSection locale={locale} dictionary={dictionary} />
      <AviationSection locale={locale} dictionary={dictionary} />
      <WhyBcsSection dictionary={dictionary} />
      <FeaturedProjectSection locale={locale} dictionary={dictionary} />
      <BeforeAfterSection dictionary={dictionary} />
      <ProcessSection dictionary={dictionary} />
      <ServiceAreaSection locale={locale} dictionary={dictionary} />
      <EstimateCtaSection locale={locale} dictionary={dictionary} />
    </main>
  );
}
