import { BrandLogoMark } from '@/components/brand/BrandLogoMark';
import { HeroSectionClient } from '@/components/home/HeroSectionClient';
import { brandLogo } from '@/config/brand-logo';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

export interface HeroSectionProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

/**
 * Phase 5D cinematic hero — server shell resolves the official mark,
 * client layer handles restrained motion.
 */
export function HeroSection({ locale, dictionary }: HeroSectionProps) {
  return (
    <HeroSectionClient
      locale={locale}
      dictionary={dictionary}
      brand={
        <BrandLogoMark
          maxHeightPx={brandLogo.recommendedMaxHeightPx.hero}
          priority
          className="max-w-[min(100%,22rem)]"
        />
      }
    />
  );
}
