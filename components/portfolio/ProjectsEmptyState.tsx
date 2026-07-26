import { ButtonLink } from '@/components/ui/ButtonLink';
import { Heading } from '@/components/ui/Heading';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export function ProjectsEmptyState({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.phase5.projects;
  const links = [
    {
      href: routes.services.path,
      label: copy.linkServices,
      variant: 'secondary' as const,
    },
    {
      href: routes.estimateRequest.path,
      label: copy.linkEstimate,
      variant: 'primary' as const,
    },
    {
      href: routes.contact.path,
      label: copy.linkContact,
      variant: 'secondary' as const,
    },
    {
      href: routes.resources.path,
      label: copy.linkResources,
      variant: 'ghost' as const,
    },
  ] as const;

  return (
    <div
      className="border-border/80 bg-bg-secondary/40 max-w-3xl rounded-[var(--radius-card)] border p-6 sm:p-8"
      data-testid="projects-empty"
    >
      <Heading as="h2" id="projects-empty-heading">
        {copy.emptyTitle}
      </Heading>
      <p className="text-text-secondary mt-3 text-pretty">{copy.emptyBody}</p>
      <p className="text-text-primary mt-6 text-sm font-medium">
        {copy.emptyLinksHeading}
      </p>
      <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {links.map((link) => (
          <li key={link.href}>
            <ButtonLink
              href={localePath(locale, link.href)}
              variant={link.variant}
              size="sm"
            >
              {link.label}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
