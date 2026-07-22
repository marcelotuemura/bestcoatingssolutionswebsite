import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function WhoWeAreSection({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.whoWeAre;
  return (
    <Section id="who-we-are" aria-labelledby="who-we-are-heading">
      <Container>
        <Reveal className="max-w-3xl">
          <Heading as="h2" id="who-we-are-heading">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-5 text-lg text-pretty">
            {copy.body}
          </p>
          <p className="text-silver-500 mt-4 text-sm">{copy.languages}</p>
          <div className="mt-8">
            <ButtonLink
              href={localePath(locale, routes.about.path)}
              variant="secondary"
              size="sm"
            >
              {dictionary.nav.about}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
