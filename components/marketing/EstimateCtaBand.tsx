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

export function EstimateCtaBand({
  locale,
  dictionary,
  title,
  body,
  notice,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly title: string;
  readonly body: string;
  readonly notice?: string;
}) {
  return (
    <Section id="estimate-cta" aria-labelledby="estimate-cta-heading">
      <Container>
        <Reveal className="border-electric-500/20 from-navy-900/80 to-navy-950 rounded-3xl border bg-gradient-to-br px-6 py-12 sm:px-10 sm:py-14">
          <Heading as="h2" id="estimate-cta-heading">
            {title}
          </Heading>
          <p className="text-silver-300 mt-4 max-w-2xl text-lg text-pretty">
            {body}
          </p>
          {notice ? (
            <p className="text-silver-500 mt-4 max-w-2xl text-sm text-pretty">
              {notice}
            </p>
          ) : null}
          <p className="sr-only">{estimatePolicy.publicNotice}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.contact.path)}
              variant="secondary"
            >
              {dictionary.nav.contact}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
