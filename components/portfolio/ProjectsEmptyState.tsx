import Link from 'next/link';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { Heading } from '@/components/ui/Heading';

export function ProjectsEmptyState({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.phase5.projects;
  const links = [
    { href: routes.services.path, label: copy.linkServices },
    { href: routes.estimateRequest.path, label: copy.linkEstimate },
    { href: routes.contact.path, label: copy.linkContact },
    { href: routes.resources.path, label: copy.linkResources },
  ] as const;

  return (
    <div
      className="border-navy-700 bg-navy-950/50 max-w-3xl rounded-2xl border p-6 sm:p-8"
      data-testid="projects-empty"
    >
      <Heading as="h2" id="projects-empty-heading">
        {copy.emptyTitle}
      </Heading>
      <p className="text-silver-400 mt-3 text-pretty">{copy.emptyBody}</p>
      <p className="mt-6 text-sm font-medium text-white">
        {copy.emptyLinksHeading}
      </p>
      <ul className="mt-3 flex flex-wrap gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={localePath(locale, link.href)}
              className="border-navy-600 text-silver-200 hover:border-electric-500 hover:text-electric-400 focus-visible:ring-electric-500 inline-flex rounded-full border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
