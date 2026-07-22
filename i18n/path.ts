import type { Locale } from '@/i18n/config';

/**
 * Build a locale-prefixed pathname.
 * Home is `/en` or `/es` (no trailing slash).
 */
export function localePath(locale: Locale, path: string = '/'): string {
  const normalized =
    path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

/**
 * Strip a leading locale segment from a pathname.
 */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first === 'en' || first === 'es') {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/**
 * Swap locale while preserving the path after the locale prefix.
 */
export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  return localePath(nextLocale, stripLocale(pathname));
}
