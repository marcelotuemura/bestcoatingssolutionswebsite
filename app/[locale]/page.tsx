import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { divisions } from '@/config/divisions';
import { routes } from '@/config/routes';
import { siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { notFound } from 'next/navigation';

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <main id="main-content">
      <Section className="pt-16 sm:pt-24">
        <Container className="text-center">
          <Badge tone="accent" className="mb-6">
            {dictionary.placeholder.phaseBadge}
          </Badge>
          <Heading as="h1" className="mx-auto max-w-3xl">
            {dictionary.placeholder.homeTitle}
          </Heading>
          <p className="text-silver-500 mx-auto mt-6 max-w-2xl text-pretty sm:text-lg">
            {dictionary.placeholder.homeLead}
          </p>
          <p className="text-silver-500 mt-4 text-sm">
            {siteConfig.serviceArea.range}. {siteConfig.contact.phone}
          </p>
          {divisions.aviation.status !== 'active' ? (
            <p className="text-silver-500 mt-2 text-sm">
              {dictionary.nav.aviation}:{' '}
              {dictionary.divisionStatus[divisions.aviation.status]}
            </p>
          ) : null}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.scheduleVisit.path)}
              variant="secondary"
            >
              {dictionary.cta.schedule}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
