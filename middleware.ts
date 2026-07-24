import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, isLocale } from '@/i18n/config';

/**
 * Locale routing: ensure every marketing path is under `/en` or `/es`.
 * Bare `/` and unprefixed paths redirect to the default (or Accept-Language) locale.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next();
  }

  // Internal Media Intelligence Platform (DAMS) — not locale-prefixed.
  if (pathname === '/media' || pathname.startsWith('/media/')) {
    return NextResponse.next();
  }

  const segment = pathname.split('/').filter(Boolean)[0];
  if (segment && isLocale(segment)) {
    return NextResponse.next();
  }

  const preferred = negotiateLocale(request.headers.get('accept-language'));
  const url = request.nextUrl.clone();
  url.pathname =
    pathname === '/' ? `/${preferred}` : `/${preferred}${pathname}`;
  return NextResponse.redirect(url);
}

function negotiateLocale(header: string | null): string {
  if (!header) {
    return defaultLocale;
  }
  const candidates = header
    .split(',')
    .map((part) => part.trim().split(';')[0]?.toLowerCase() ?? '');
  for (const candidate of candidates) {
    if (isLocale(candidate)) {
      return candidate;
    }
    const base = candidate.split('-')[0];
    if (base && isLocale(base)) {
      return base;
    }
  }
  return defaultLocale;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
