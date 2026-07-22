/**
 * Lightweight i18n — no third-party dependency for Phase 1.
 * Locales: English and Spanish. Paths: `/en/...`, `/es/...`.
 */
export const locales = ['en', 'es'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeHtmlLang: Record<Locale, string> = {
  en: 'en',
  es: 'es',
};

export const localeOpenGraph: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_US',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
