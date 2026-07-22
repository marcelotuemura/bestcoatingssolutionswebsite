'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { divisions } from '@/config/divisions';
import { primaryNav, routes, type RouteKey } from '@/config/routes';
import { useLockedBody } from '@/hooks/use-locked-body';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { cn } from '@/utils/cn';

export interface MobileNavProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

function navLabel(dictionary: Dictionary, key: RouteKey): string {
  return dictionary.nav[key as keyof typeof dictionary.nav] ?? key;
}

export function MobileNav({ locale, dictionary }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useLockedBody(open);

  useEffect(() => {
    if (!open) {
      return;
    }
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="text-silver-100 hover:bg-navy-800 focus-visible:ring-electric-500 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:outline-none"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">{dictionary.a11y.openMenu}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span className="bg-silver-100 block h-0.5 w-5" />
          <span className="bg-silver-100 block h-0.5 w-5" />
          <span className="bg-silver-100 block h-0.5 w-5" />
        </span>
      </button>

      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          className={cn(
            'bg-navy-950/80 absolute inset-0 transition-opacity motion-reduce:transition-none',
            open ? 'opacity-100' : 'opacity-0',
          )}
          aria-label={dictionary.a11y.closeMenu}
          onClick={() => setOpen(false)}
        />

        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={dictionary.a11y.mobileNav}
          className={cn(
            'border-navy-700 bg-navy-950 absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col border-l shadow-2xl transition-transform duration-200 motion-reduce:transition-none',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="border-navy-800 flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium text-white">
              Best Coatings Solutions
            </p>
            <button
              ref={closeRef}
              type="button"
              className="text-silver-100 hover:bg-navy-800 focus-visible:ring-electric-500 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">{dictionary.a11y.closeMenu}</span>
              <span aria-hidden className="text-2xl leading-none">
                ×
              </span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {primaryNav.map((key) => {
                const route = routes[key];
                const aviationSoon =
                  key === 'aviation' &&
                  divisions.aviation.status === 'coming-soon';
                return (
                  <li key={key}>
                    <Link
                      href={localePath(locale, route.path)}
                      className="hover:bg-navy-800 focus-visible:ring-electric-500 text-silver-100 flex min-h-12 items-center justify-between rounded-xl px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
                      onClick={() => setOpen(false)}
                    >
                      <span>{navLabel(dictionary, key)}</span>
                      {aviationSoon ? (
                        <span className="text-silver-500 text-xs">
                          {dictionary.divisionStatus[divisions.aviation.status]}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-navy-800 flex flex-col gap-2 border-t p-4">
            <ButtonLink
              href={localePath(locale, routes.estimateRequest.path)}
              onClick={() => setOpen(false)}
            >
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.scheduleVisit.path)}
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {dictionary.cta.schedule}
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
