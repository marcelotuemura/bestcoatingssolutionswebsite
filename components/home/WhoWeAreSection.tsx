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
    <Section
      id="who-we-are"
      className="py-16 sm:py-24"
      aria-labelledby="who-we-are-heading"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <div
              className="bcs-marine-texture border-border relative flex min-h-[20rem] items-end overflow-hidden rounded-[var(--radius-media)] border p-6 sm:min-h-[26rem] sm:p-8"
              data-testid="meet-marcelo-photo-slot"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d18]/85 via-[#050d18]/25 to-transparent"
              />
              <p className="text-text-muted relative max-w-sm text-sm text-pretty">
                {copy.photoNote}
              </p>
            </div>
          </Reveal>
          <Reveal className="max-w-xl lg:col-span-6">
            <Heading as="h2" id="who-we-are-heading">
              {copy.title}
            </Heading>
            <p className="text-text-secondary mt-5 text-lg text-pretty">
              {copy.body}
            </p>
            <p className="text-text-muted mt-4 text-sm">{copy.languages}</p>
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
        </div>
      </Container>
    </Section>
  );
}
