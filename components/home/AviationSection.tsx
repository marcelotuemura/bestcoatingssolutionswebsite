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

export function AviationSection({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.aviation;

  return (
    <Section id="aviation" aria-labelledby="aviation-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="border-border bg-bg-primary bcs-aviation-texture relative order-2 aspect-[16/10] overflow-hidden rounded-[var(--radius-media)] border lg:order-1">
            <Image
              src={homePlaceholders.aviationVisual.src}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-80"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <p className="bg-bg-primary/80 text-text-muted absolute right-3 bottom-3 rounded-[var(--radius-control)] px-2 py-1 text-xs">
              {dictionary.placeholder.mediaLabel}
            </p>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <Heading as="h2" id="aviation-heading">
              {copy.title}
            </Heading>
            <p className="text-text-secondary mt-5 text-lg text-pretty">
              {copy.body}
            </p>
            <p className="text-text-muted mt-4 text-sm text-pretty">
              {copy.notice}
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
    </Section>
  );
}
