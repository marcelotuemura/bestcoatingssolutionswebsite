import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { SiteShell } from '@/components/layout/SiteShell';
import { routes } from '@/config/routes';
import { getDictionarySync } from '@/i18n/get-dictionary';
import { defaultLocale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import './globals.css';

export default function RootNotFound() {
  const locale = defaultLocale;
  const dictionary = getDictionarySync(locale);
  const copy = dictionary.conversion.notFound;

  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <SiteShell locale={locale} dictionary={dictionary}>
          <main id="main-content">
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
        </SiteShell>
      </body>
    </html>
  );
}
