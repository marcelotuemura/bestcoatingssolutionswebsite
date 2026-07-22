import type { Locale } from '@/i18n/config';
import type { DictionaryShape } from '@/i18n/dictionary-types';
import { en } from '@/i18n/dictionaries/en';
import { es } from '@/i18n/dictionaries/es';

export type Dictionary = DictionaryShape<typeof en>;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

export function getDictionarySync(locale: Locale): Dictionary {
  return dictionaries[locale];
}
