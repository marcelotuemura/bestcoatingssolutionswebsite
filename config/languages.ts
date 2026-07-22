/**
 * Spoken languages (business capability) vs site UI locales.
 * UI locales live in `i18n/config.ts`.
 */
export const spokenLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
] as const;

export type SpokenLanguageCode = (typeof spokenLanguages)[number]['code'];
