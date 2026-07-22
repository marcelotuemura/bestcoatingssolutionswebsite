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
    <Section id="request-estimate" aria-labelledby="estimate-heading">
      <Container>
        <Reveal className="border-electric-500/20 from-navy-900/80 to-navy-950 rounded-3xl border bg-gradient-to-br px-6 py-12 sm:px-10 sm:py-14">
          <Heading as="h2" id="estimate-heading">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-4 max-w-2xl text-lg text-pretty">
            {copy.body}
          </p>
          <p className="text-silver-500 mt-4 max-w-2xl text-sm text-pretty">
            {copy.notice}
          </p>
          <p className="sr-only">{estimatePolicy.publicNotice}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.scheduleVisit.path)}
              variant="secondary"
            >
              {dictionary.cta.schedule}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
