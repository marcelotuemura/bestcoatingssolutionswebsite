import { CraftPrinciplesSection } from '@/components/home/CraftPrinciplesSection';
import { EstimateCtaSection } from '@/components/home/EstimateCtaSection';
import { FeaturedProjectSection } from '@/components/home/FeaturedProjectSection';
import { HeroSection } from '@/components/home/HeroSection';
import { MarineSection } from '@/components/home/MarineSection';
import { PhilosophySection } from '@/components/home/PhilosophySection';
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
 * Phase 4 Trust Experience — trust before services.
 * Aviation and placeholder before/after stay off the homepage.
 */
export function HomePage({ locale, dictionary }: HomePageProps) {
  return (
    <main id="main-content">
      <HeroSection locale={locale} dictionary={dictionary} />
      <WhoWeAreSection locale={locale} dictionary={dictionary} />
      <PhilosophySection dictionary={dictionary} />
      <WhyBcsSection dictionary={dictionary} />
      <CraftPrinciplesSection dictionary={dictionary} />
      <ProcessSection dictionary={dictionary} />
      <FeaturedProjectSection locale={locale} dictionary={dictionary} />
      <MarineSection locale={locale} dictionary={dictionary} />
      <ServiceAreaSection locale={locale} dictionary={dictionary} />
      <EstimateCtaSection locale={locale} dictionary={dictionary} />
    </main>
  );
}
