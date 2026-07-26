'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { NavLink } from '@/components/layout/NavLink';
import { isContactPrimaryPath } from '@/config/cta-hierarchy';
import { primaryNav, routes, type RouteKey } from '@/config/routes';
import { siteConfig } from '@/config/site';
import { useLockedBody } from '@/hooks/use-locked-body';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export interface MobileNavProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function navLabel(dictionary: Dictionary, key: RouteKey): string {
  return dictionary.nav[key as keyof typeof dictionary.nav] ?? key;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.tabIndex !== -1,
  );
}

export function MobileNav({ locale, dictionary }: MobileNavProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const contactPrimary = isContactPrimaryPath(pathname);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  useLockedBody(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        triggerRef.current?.focus();
      }
      return;
    }

    wasOpenRef.current = true;
    closeRef.current?.focus();

    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeMenu]);

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeMenu();
    }
  };

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="text-text-primary hover:bg-surface focus-visible:ring-focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] focus-visible:ring-2 focus-visible:outline-none"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        data-testid="mobile-nav-open"
        onClick={openMenu}
      >
        <span className="sr-only">{dictionary.a11y.openMenu}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span className="bg-text-primary block h-0.5 w-5" />
          <span className="bg-text-primary block h-0.5 w-5" />
          <span className="bg-text-primary block h-0.5 w-5" />
        </span>
      </button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 lg:hidden"
              data-testid="mobile-nav-panel"
            >
              <button
                type="button"
                className="bg-bg-primary/80 absolute inset-0"
                aria-label={dictionary.a11y.closeMenu}
                tabIndex={-1}
                onClick={closeMenu}
              />

              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-label={dictionary.a11y.mobileNav}
                className="border-border bg-bg-primary absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col border-l shadow-2xl"
                onKeyDown={onPanelKeyDown}
              >
                <div className="border-border flex items-center justify-between border-b px-4 py-3">
                  <p className="text-text-primary text-sm font-medium">
                    {siteConfig.name}
                  </p>
                  <button
                    ref={closeRef}
                    type="button"
                    className="text-text-primary hover:bg-surface focus-visible:ring-focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] focus-visible:ring-2 focus-visible:outline-none"
                    data-testid="mobile-nav-close"
                    onClick={closeMenu}
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
                      const href = localePath(locale, routes[key].path);
                      return (
                        <li key={key}>
                          <NavLink
                            href={href}
                            exact={key === 'home'}
                            onClick={closeMenu}
                            className="w-full justify-start text-base"
                          >
                            {navLabel(dictionary, key)}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-border flex flex-col gap-2 border-t p-4">
                  <ButtonLink
                    href={localePath(
                      locale,
                      contactPrimary
                        ? routes.contact.path
                        : routes.estimateRequest.path,
                    )}
                    onClick={closeMenu}
                    data-testid="mobile-primary-cta"
                    data-cta-mode={contactPrimary ? 'contact' : 'estimate'}
                  >
                    {contactPrimary
                      ? dictionary.cta.contactUs
                      : dictionary.cta.estimate}
                  </ButtonLink>
                  <ButtonLink
                    href={localePath(
                      locale,
                      contactPrimary
                        ? routes.estimateRequest.path
                        : routes.contact.path,
                    )}
                    variant="secondary"
                    onClick={closeMenu}
                  >
                    {contactPrimary
                      ? dictionary.cta.estimate
                      : dictionary.cta.contactUs}
                  </ButtonLink>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
