import Link from 'next/link';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Concise consent notice near public form submit controls.
 * Links Privacy Policy and Terms of Use — no marketing/newsletter consent.
 */
export function FormLegalConsent({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.conversion.formConsent;

  return (
    <p
      className="text-text-secondary text-sm text-pretty"
      data-testid="form-legal-consent"
    >
      {copy.before}{' '}
      <Link
        href={localePath(locale, routes.privacy.path)}
        className="text-accent-hover focus-visible:ring-focus-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
        data-testid="form-consent-privacy"
      >
        {copy.privacy}
      </Link>
      {copy.and}
      <Link
        href={localePath(locale, routes.terms.path)}
        className="text-accent-hover focus-visible:ring-focus-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
        data-testid="form-consent-terms"
      >
        {copy.terms}
      </Link>
      {copy.after}
    </p>
  );
}
