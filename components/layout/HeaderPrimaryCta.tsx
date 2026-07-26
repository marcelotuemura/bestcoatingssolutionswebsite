'use client';

import { usePathname } from 'next/navigation';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { isContactPrimaryPath } from '@/config/cta-hierarchy';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Header primary CTA follows approved hierarchy:
 * Contact on Aviation / About; Estimate elsewhere.
 */
export function HeaderPrimaryCta({
  locale,
  dictionary,
  className,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly className?: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const contactPrimary = isContactPrimaryPath(pathname);

  return (
    <ButtonLink
      href={localePath(
        locale,
        contactPrimary ? routes.contact.path : routes.estimateRequest.path,
      )}
      size="sm"
      className={className}
      data-testid="header-primary-cta"
      data-cta-mode={contactPrimary ? 'contact' : 'estimate'}
    >
      {contactPrimary ? dictionary.cta.contactUs : dictionary.cta.estimate}
    </ButtonLink>
  );
}
