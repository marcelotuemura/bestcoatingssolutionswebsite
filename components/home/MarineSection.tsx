import Image from 'next/image';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import { homePlaceholders } from '@/config/home-placeholders';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function MarineSection({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.marine;
  return (
    <Section
      id="marine"
      className="bg-navy-900/40"
      aria-labelledby="marine-heading"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Heading as="h2" id="marine-heading">
              {copy.title}
            </Heading>
            <p className="text-silver-300 mt-5 text-lg text-pretty">
              {copy.body}
            </p>
            <RevealStagger className="mt-6 space-y-2">
              {copy.points.map((point) => (
                <RevealItem key={point}>
                  <p className="text-silver-100 border-electric-500/40 border-l pl-3 text-sm sm:text-base">
                    {point}
                  </p>
                </RevealItem>
              ))}
            </RevealStagger>
            <div className="mt-8">
              <ButtonLink href={localePath(locale, routes.marine.path)}>
                {dictionary.cta.exploreMarine}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal className="border-navy-700 bg-navy-950 relative aspect-[16/10] overflow-hidden rounded-2xl border">
            <Image
              src={homePlaceholders.marineVisual.src}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <p className="bg-navy-950/80 text-silver-500 absolute right-3 bottom-3 rounded-lg px-2 py-1 text-xs">
              {dictionary.placeholder.mediaLabel}
            </p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
