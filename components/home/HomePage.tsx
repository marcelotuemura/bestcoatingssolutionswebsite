import { DivisionsSection } from '@/components/home/DivisionsSection';
import { EstimateCtaSection } from '@/components/home/EstimateCtaSection';
import { FeaturedProjectSection } from '@/components/home/FeaturedProjectSection';
import { HeroSection } from '@/components/home/HeroSection';
import { PhilosophySection } from '@/components/home/PhilosophySection';
import { ProcessSection } from '@/components/home/ProcessSection';
import { WhoWeAreSection } from '@/components/home/WhoWeAreSection';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

export interface HomePageProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

/**
 * Phase 5D — Premium Homepage Experience.
 * Every section must build trust, explain capability, show proof, or encourage contact.
 */
export function HomePage({ locale, dictionary }: HomePageProps) {
  return (
    <main id="main-content">
      <HeroSection locale={locale} dictionary={dictionary} />
      <DivisionsSection locale={locale} dictionary={dictionary} />
      <WhoWeAreSection locale={locale} dictionary={dictionary} />
      <PhilosophySection dictionary={dictionary} />
      <FeaturedProjectSection locale={locale} dictionary={dictionary} />
      <ProcessSection dictionary={dictionary} />
      <EstimateCtaSection locale={locale} dictionary={dictionary} />
    </main>
  );
}
