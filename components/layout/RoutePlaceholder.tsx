import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { routes, type RouteKey } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export interface RoutePlaceholderProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly routeKey: RouteKey;
}

export function RoutePlaceholder({
  locale,
  dictionary,
  routeKey,
}: RoutePlaceholderProps) {
  const title =
    dictionary.nav[routeKey as keyof typeof dictionary.nav] ?? routeKey;

  return (
    <main id="main-content">
      <Section>
        <Container narrow className="text-center">
          <Badge className="mb-6">{dictionary.placeholder.phaseBadge}</Badge>
          <Heading as="h1">{title}</Heading>
          <p className="text-silver-500 mt-4 text-pretty">
            {dictionary.placeholder.pageLead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink href={localePath(locale)} variant="secondary">
              {dictionary.nav.home}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
