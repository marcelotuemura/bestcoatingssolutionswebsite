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
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
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
                {copy.cta}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal>
            <div
              className="relative flex min-h-[16rem] items-end overflow-hidden rounded-sm bg-[radial-gradient(ellipse_at_30%_20%,rgba(10,132,255,0.16),transparent_55%),linear-gradient(160deg,#0a1a2f_0%,#07101c_55%,#050d18_100%)] p-6 sm:min-h-[20rem]"
              data-testid="meet-marcelo-photo-slot"
            >
              <div
                aria-hidden
                className="bcs-ocean-texture pointer-events-none absolute inset-0 opacity-40"
              />
              <p className="text-silver-500 relative text-sm text-pretty">
                {copy.photoNote}
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
