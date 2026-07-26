import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import { estimatePolicy } from '@/config/estimate-policy';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function EstimateCtaSection({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.estimate;
  return (
    <Section
      id="request-estimate"
      className="py-16 sm:py-24"
      aria-labelledby="estimate-heading"
    >
      <Container>
        <Reveal className="border-border/80 from-bg-secondary/80 to-bg-primary mx-auto max-w-3xl rounded-[var(--radius-card)] border bg-gradient-to-br px-6 py-12 text-center sm:px-12 sm:py-16">
          <Heading as="h2" id="estimate-heading">
            {copy.title}
          </Heading>
          <p className="text-text-secondary mx-auto mt-4 max-w-xl text-lg text-pretty">
            {copy.body}
          </p>
          <p className="text-text-muted mx-auto mt-4 max-w-xl text-sm text-pretty">
            {copy.notice}
          </p>
          <p className="sr-only">{estimatePolicy.publicNotice}</p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
