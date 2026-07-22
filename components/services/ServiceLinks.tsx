import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import { routes } from '@/config/routes';
import type { MarineServiceSlug } from '@/config/marine-services';
import { getRelatedMarineServices } from '@/config/marine-services';
import { getMarineServiceContent } from '@/content/marine-services';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

/**
 * Contextual links so service detail pages are never dead ends.
 */
export function ServiceContextLinks({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const links = [
    {
      href: localePath(locale, routes.marine.path),
      label: dictionary.pages.services.links.marineDivision,
    },
    {
      href: localePath(locale, routes.services.path),
      label: dictionary.pages.services.links.servicesIndex,
    },
    {
      href: localePath(locale, routes.contact.path),
      label: dictionary.pages.services.links.contact,
    },
    {
      href: localePath(locale, routes.estimateRequest.path),
      label: dictionary.cta.estimate,
    },
  ];

  return (
    <Section
      id="service-context-links"
      className="py-6 sm:py-8"
      aria-labelledby="service-context-heading"
    >
      <Container>
        <Reveal>
          <h2 id="service-context-heading" className="sr-only">
            {dictionary.pages.services.links.heading}
          </h2>
          <ul className="text-silver-400 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-silver-100 focus-visible:ring-electric-500 rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                  data-testid="service-context-link"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}

export function RelatedServices({
  locale,
  dictionary,
  slug,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
  readonly slug: MarineServiceSlug;
}) {
  const related = getRelatedMarineServices(slug);
  if (related.length === 0) {
    return null;
  }

  return (
    <Section id="related-services" aria-labelledby="related-services-heading">
      <Container>
        <Reveal className="max-w-3xl">
          <Heading as="h2" id="related-services-heading">
            {dictionary.pages.services.relatedTitle}
          </Heading>
          <p className="text-silver-400 mt-3 text-pretty">
            {dictionary.pages.services.relatedBody}
          </p>
        </Reveal>
        <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((relatedSlug) => {
            const content = getMarineServiceContent(locale, relatedSlug);
            return (
              <RevealItem key={relatedSlug}>
                <Link
                  href={localePath(locale, `/services/${relatedSlug}`)}
                  className="border-navy-700 hover:border-electric-500/40 focus-visible:ring-electric-500 block h-full rounded-2xl border p-5 transition focus-visible:ring-2 focus-visible:outline-none"
                  data-testid={`related-service-${relatedSlug}`}
                >
                  <h3 className="text-lg font-medium text-white">
                    {content.title}
                  </h3>
                  <p className="text-silver-400 mt-2 text-sm text-pretty">
                    {content.heroLead}
                  </p>
                </Link>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </Container>
    </Section>
  );
}
