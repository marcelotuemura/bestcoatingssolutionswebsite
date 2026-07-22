import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import { routes } from '@/config/routes';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ServiceAreaSection({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.serviceArea;
  return (
    <Section
      id="service-area"
      className="bg-navy-900/35"
      aria-labelledby="service-area-heading"
    >
      <Container>
        <Reveal className="max-w-3xl">
          <Heading as="h2" id="service-area-heading">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-4 text-lg text-pretty">
            {copy.body}
          </p>
          <p className="text-silver-500 mt-3 text-sm">{copy.travel}</p>
          <p className="text-silver-300 mt-4 text-sm">
            {siteConfig.serviceArea.primary} · {siteConfig.serviceArea.range}
          </p>
          <div className="mt-8">
            <ButtonLink
              href={localePath(locale, routes.serviceArea.path)}
              variant="secondary"
            >
              {dictionary.nav.serviceArea}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
