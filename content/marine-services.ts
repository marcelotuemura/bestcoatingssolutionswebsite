import {
  marineServices,
  type MarineServiceSlug,
} from '@/config/marine-services';
import {
  marineServiceContentEn,
  type ServicePageContent,
} from '@/content/marine-services-en';
import { marineServiceContentEs } from '@/content/marine-services-es';
import type { Locale } from '@/i18n/config';

const byLocale = {
  en: marineServiceContentEn,
  es: marineServiceContentEs,
} as const;

export function getMarineServiceContent(
  locale: Locale,
  slug: MarineServiceSlug,
): ServicePageContent {
  const definition = marineServices.find((service) => service.slug === slug);
  if (!definition) {
    throw new Error(`Unknown marine service slug: ${slug}`);
  }
  return byLocale[locale][definition.contentKey];
}

export function listMarineServiceSummaries(locale: Locale): readonly {
  readonly slug: MarineServiceSlug;
  readonly title: string;
  readonly lead: string;
}[] {
  return marineServices.map((service) => {
    const content = byLocale[locale][service.contentKey];
    return {
      slug: service.slug,
      title: content.title,
      lead: content.heroLead,
    };
  });
}

export type { ServicePageContent, MarineServiceSlug };
