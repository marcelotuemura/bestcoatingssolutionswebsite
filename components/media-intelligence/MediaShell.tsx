import Link from 'next/link';
import type { ReactNode } from 'react';
import { mediaLogoutAction } from '@/app/media/actions';
import { ThemeToggle } from '@/components/media-library/ThemeToggle';
import { mediaIntelligenceConfig } from '@/config/media-intelligence';

const nav = [
  { href: '/media', label: 'Dashboard' },
  { href: '/media/library', label: 'Gallery' },
  { href: '/media/projects', label: 'Projects' },
  { href: '/media/duplicates', label: 'Duplicates' },
  { href: '/media/heroes', label: 'Hero Center' },
  { href: '/media/reports', label: 'Reports' },
  { href: '/media/import', label: 'Import (meta)' },
  { href: '/media/approvals', label: 'Approvals' },
  { href: '/media/users', label: 'Users' },
] as const;

export function MediaShell({
  title,
  subtitle,
  children,
  showNav = true,
  showLogout = true,
  readOnlyBanner = true,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly showNav?: boolean;
  readonly showLogout?: boolean;
  readonly readOnlyBanner?: boolean;
}) {
  return (
    <div className="bg-navy-950 text-silver-100 media-light:bg-slate-50 media-light:text-slate-900 min-h-screen">
      <div className="border-navy-700 media-light:border-slate-200 media-light:bg-white media-light:bg-none border-b bg-[linear-gradient(135deg,#050d18_0%,#0a1a2f_45%,#0f2340_100%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-electric-400 text-xs font-medium tracking-[0.2em] uppercase">
                Best Coatings Solutions · Media Intelligence
              </p>
              <h1 className="media-light:text-slate-900 mt-2 text-3xl font-semibold text-white sm:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-silver-300 media-light:text-slate-600 mt-2 max-w-3xl text-sm text-pretty sm:text-base">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              {readOnlyBanner ? (
                <p
                  className="media-light:border-amber-300 media-light:bg-amber-50 media-light:text-amber-900 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
                  role="status"
                >
                  Internal · Read-only catalog · Never modify originals · Never
                  auto-publish
                </p>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <ThemeToggle />
                {showLogout ? (
                  <form action={mediaLogoutAction}>
                    <button
                      type="submit"
                      className="border-navy-700 text-silver-300 hover:border-electric-500 media-light:border-slate-300 media-light:text-slate-700 rounded-lg border px-3 py-1.5 text-xs"
                      data-testid="media-logout"
                    >
                      Log out
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
          {showNav ? (
            <nav
              aria-label="Media Intelligence"
              className="flex flex-wrap gap-2"
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-navy-700 bg-navy-900/70 text-silver-300 hover:border-electric-500 focus-visible:ring-electric-500 media-light:border-slate-300 media-light:bg-slate-100 media-light:text-slate-700 media-light:hover:text-slate-900 rounded-lg border px-3 py-1.5 text-sm transition hover:text-white focus-visible:ring-2 focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <p className="text-silver-500 media-light:text-slate-500 text-xs">
            Internal route {mediaIntelligenceConfig.routePrefix} · authenticated
            sessions only · catalog datasource · robots.txt is not an access
            control
          </p>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
