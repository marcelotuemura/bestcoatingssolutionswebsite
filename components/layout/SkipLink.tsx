import type { Dictionary } from '@/i18n/get-dictionary';

export interface SkipLinkProps {
  readonly label: Dictionary['a11y']['skipToContent'];
  readonly href?: string;
}

export function SkipLink({ label, href = '#main-content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="bg-electric-500 focus:ring-offset-navy-950 sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none"
    >
      {label}
    </a>
  );
}
