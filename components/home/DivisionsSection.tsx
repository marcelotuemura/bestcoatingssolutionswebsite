import Image from 'next/image';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import { homePlaceholders } from '@/config/home-placeholders';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Signature Marine + Aviation editorial strip.
 * Differentiates through photography/atmosphere — not separate color systems or cards.
 */
export function DivisionsSection({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.divisions;
  const marine = dictionary.home.marine;
  const aviation = dictionary.home.aviation;

  return (
    <Section
      id="divisions"
      className="py-16 sm:py-24 lg:py-28"
      aria-labelledby="divisions-heading"
    >
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-accent mb-3 text-sm tracking-[0.16em] uppercase">
            {copy.eyebrow}
          </p>
          <Heading as="h2" id="divisions-heading">
            {copy.title}
          </Heading>
          <p className="text-text-secondary mt-5 text-lg text-pretty">
            {copy.lead}
          </p>
        </Reveal>
      </Container>

      <div className="mt-16 space-y-0 sm:mt-20">
        <article
          id="marine"
          className="bcs-marine-texture border-border/60 border-y"
          aria-labelledby="marine-heading"
          data-testid="division-marine"
        >
          <Container className="py-14 sm:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-5">
                <p className="text-text-muted mb-3 text-sm tracking-[0.14em] uppercase">
                  {copy.marineLabel}
                </p>
                <Heading
                  as="h3"
                  id="marine-heading"
                  className="font-display text-3xl font-medium tracking-tight sm:text-4xl"
                >
                  {marine.title}
                </Heading>
                <p className="text-text-secondary mt-5 text-lg text-pretty">
                  {marine.body}
                </p>
                <p className="text-text-muted mt-4 text-sm text-pretty">
                  {copy.marineAtmosphere}
                </p>
                <div className="mt-8">
                  <ButtonLink href={localePath(locale, routes.marine.path)}>
                    {dictionary.cta.exploreMarine}
                  </ButtonLink>
                </div>
              </Reveal>
              <Reveal className="relative lg:col-span-7">
                <div className="border-border relative aspect-[16/10] overflow-hidden rounded-[var(--radius-media)] border sm:aspect-[21/11]">
                  <Image
                    src={homePlaceholders.marineVisual.src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d18]/55 via-transparent to-transparent"
                  />
                  <p className="bg-bg-primary/80 text-text-muted absolute right-3 bottom-3 rounded-[var(--radius-control)] px-2 py-1 text-xs">
                    {dictionary.placeholder.mediaLabel}
                  </p>
                </div>
              </Reveal>
            </div>
          </Container>
        </article>

        <article
          id="aviation"
          className="bcs-aviation-texture"
          aria-labelledby="aviation-heading"
          data-testid="division-aviation"
        >
          <Container className="py-14 sm:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <Reveal className="relative order-2 lg:order-1 lg:col-span-7">
                <div className="border-border relative aspect-[16/10] overflow-hidden rounded-[var(--radius-media)] border sm:aspect-[21/11]">
                  <Image
                    src={homePlaceholders.aviationVisual.src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover opacity-90"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d18]/60 via-transparent to-transparent"
                  />
                  <p className="bg-bg-primary/80 text-text-muted absolute right-3 bottom-3 rounded-[var(--radius-control)] px-2 py-1 text-xs">
                    {dictionary.placeholder.mediaLabel}
                  </p>
                </div>
              </Reveal>
              <Reveal className="order-1 lg:order-2 lg:col-span-5">
                <p className="text-text-muted mb-3 text-sm tracking-[0.14em] uppercase">
                  {copy.aviationLabel}
                </p>
                <Heading
                  as="h3"
                  id="aviation-heading"
                  className="font-display text-3xl font-medium tracking-tight sm:text-4xl"
                >
                  {aviation.title}
                </Heading>
                <p className="text-text-secondary mt-5 text-lg text-pretty">
                  {aviation.body}
                </p>
                <p className="text-text-muted mt-4 text-sm text-pretty">
                  {copy.aviationAtmosphere}
                </p>
                <p className="text-text-muted mt-3 text-sm text-pretty">
                  {aviation.notice}
                </p>
                <div className="mt-8">
                  <ButtonLink
                    href={localePath(locale, routes.aviation.path)}
                    variant="secondary"
                  >
                    {dictionary.cta.learnAviation}
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </Container>
        </article>
      </div>
    </Section>
  );
}
