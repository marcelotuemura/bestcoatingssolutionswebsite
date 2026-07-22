import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import { divisions } from '@/config/divisions';
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
  const status = divisions.aviation.status;

  return (
    <Section id="aviation" aria-labelledby="aviation-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="border-navy-700 bg-navy-950 relative order-2 aspect-[16/10] overflow-hidden rounded-2xl border lg:order-1">
            <Image
              src={homePlaceholders.aviationVisual.src}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-80"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <p className="bg-navy-950/80 text-silver-500 absolute right-3 bottom-3 rounded-lg px-2 py-1 text-xs">
              {dictionary.placeholder.mediaLabel}
            </p>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Heading as="h2" id="aviation-heading">
                {copy.title}
              </Heading>
              <Badge tone="warning">{dictionary.divisionStatus[status]}</Badge>
            </div>
            <p className="text-silver-300 text-lg text-pretty">{copy.body}</p>
            <p
              className="border-electric-500/30 bg-electric-500/5 text-silver-300 mt-5 rounded-xl border px-4 py-3 text-sm"
              role="status"
            >
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
