import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
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
  const stages = [
    { key: 'before', label: copy.stageBefore, note: copy.stageBeforeNote },
    { key: 'during', label: copy.stageDuring, note: copy.stageDuringNote },
    { key: 'after', label: copy.stageAfter, note: copy.stageAfterNote },
  ] as const;

  return (
    <Section
      id="featured-project"
      className="py-16 sm:py-24"
      aria-labelledby="featured-heading"
    >
      <Container>
        <Reveal className="max-w-3xl">
          <p className="text-accent mb-3 text-sm tracking-[0.16em] uppercase">
            {copy.eyebrow}
          </p>
          <Heading as="h2" id="featured-heading">
            {copy.title}
          </Heading>
          <p className="text-text-secondary mt-5 text-lg text-pretty">
            {copy.lead}
          </p>
        </Reveal>

        <RevealStagger className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {stages.map((stage) => (
            <RevealItem key={stage.key}>
              <figure
                className="border-border bg-surface/40 flex h-full min-h-[14rem] flex-col overflow-hidden rounded-[var(--radius-media)] border"
                data-testid={`featured-stage-${stage.key}`}
              >
                <div className="bcs-marine-texture relative flex flex-1 items-end p-5">
                  <figcaption>
                    <p className="font-display text-text-primary text-2xl">
                      {stage.label}
                    </p>
                    <p className="text-text-muted mt-2 text-sm text-pretty">
                      {stage.note}
                    </p>
                  </figcaption>
                </div>
                <p className="text-text-muted border-border border-t px-4 py-2 text-xs">
                  {dictionary.placeholder.mediaLabel}
                </p>
              </figure>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal className="mt-12 max-w-2xl">
          <h3 className="text-text-primary text-xl font-medium tracking-tight">
            {copy.projectTitle}
          </h3>
          <ul className="text-text-secondary mt-5 space-y-3 text-pretty">
            <li>{copy.problem}</li>
            <li>{copy.repair}</li>
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
