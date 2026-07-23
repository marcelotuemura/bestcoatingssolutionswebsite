import {
  faqCategories,
  isFaqCategoryId,
  type FaqCategoryId,
} from '@/config/faq';
import {
  faqContentEn,
  type FaqCategoryContent,
  type FaqItem,
} from '@/content/faq-en';
import { faqContentEs } from '@/content/faq-es';
import type { Locale } from '@/i18n/config';

const byLocale = {
  en: faqContentEn,
  es: faqContentEs,
} as const;

export function getFaqCategories(
  locale: Locale,
): readonly FaqCategoryContent[] {
  return byLocale[locale];
}

export function getFaqCategory(
  locale: Locale,
  id: FaqCategoryId,
): FaqCategoryContent | undefined {
  return byLocale[locale].find((category) => category.id === id);
}

export function getAllFaqItems(locale: Locale): readonly FaqItem[] {
  return byLocale[locale].flatMap((category) => category.items);
}

export function getFaqItemsByIds(
  locale: Locale,
  ids: readonly string[],
): readonly FaqItem[] {
  const all = getAllFaqItems(locale);
  return ids
    .map((id) => all.find((item) => item.id === id))
    .filter((item): item is FaqItem => item !== undefined);
}

export function assertFaqLocaleParity(): void {
  const enIds = faqContentEn.map((c) => c.id).join(',');
  const esIds = faqContentEs.map((c) => c.id).join(',');
  if (enIds !== esIds) {
    throw new Error('FAQ category id parity mismatch between en and es');
  }
  for (const category of faqContentEn) {
    const es = faqContentEs.find((c) => c.id === category.id);
    if (!es) {
      throw new Error(`Missing Spanish FAQ category: ${category.id}`);
    }
    const enItemIds = category.items.map((i) => i.id).join(',');
    const esItemIds = es.items.map((i) => i.id).join(',');
    if (enItemIds !== esItemIds) {
      throw new Error(`FAQ item id parity mismatch in category ${category.id}`);
    }
  }
  for (const definition of faqCategories) {
    if (!isFaqCategoryId(definition.id)) {
      throw new Error(`Invalid FAQ category definition: ${definition.id}`);
    }
  }
}

export type { FaqCategoryContent, FaqItem, FaqCategoryId };
