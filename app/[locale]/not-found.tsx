import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { routes } from '@/config/routes';
import { getDictionarySync } from '@/i18n/get-dictionary';
import { defaultLocale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Locale-segment 404. Uses default-locale copy when params are unavailable.
 * Spanish users still receive branded recovery links under their locale prefix
 * when middleware kept them on `/es/...` before `notFound()`.
 */
export default function LocaleNotFound() {
  const locale = defaultLocale;
  const dictionary = getDictionarySync(locale);
  const copy = dictionary.conversion.notFound;

  return (
    <main id="main-content" data-testid="locale-not-found">
      <Section>
        <Container narrow className="text-center">
          <p className="text-electric-400 text-sm tracking-wide uppercase">
            404
          </p>
          <Heading as="h1" className="mt-3">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-4 text-pretty">{copy.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale)}>
              {dictionary.nav.home}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.services.path)}
              variant="secondary"
            >
              {dictionary.nav.services}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.contact.path)}
              variant="secondary"
            >
              {dictionary.nav.contact}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.estimateRequest.path)}
              variant="secondary"
            >
              {dictionary.cta.estimate}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
