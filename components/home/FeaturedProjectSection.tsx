import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function FeaturedProjectSection({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.featured;
  return (
    <Section id="featured-project" aria-labelledby="featured-heading">
      <Container>
        <Reveal className="max-w-3xl">
          <Badge tone="accent" className="mb-4">
            {dictionary.placeholder.projectLabel}
          </Badge>
          <p className="text-electric-400 mb-2 text-sm tracking-wide uppercase">
            {copy.eyebrow}
          </p>
          <Heading as="h2" id="featured-heading">
            {copy.title}
          </Heading>
          <h3 className="mt-6 text-xl font-medium text-white">
            {copy.projectTitle}
          </h3>
          <ul className="text-silver-300 mt-5 space-y-3 text-pretty">
            <li>{copy.problem}</li>
            <li>{copy.repair}</li>
            <li>{copy.process}</li>
            <li>{copy.time}</li>
            <li>{copy.result}</li>
            <li>{copy.customer}</li>
          </ul>
          <div className="mt-8">
            <ButtonLink
              href={localePath(locale, routes.projects.path)}
              variant="secondary"
            >
              {copy.cta}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
