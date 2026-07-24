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
  // Availability + cookie presence are checked here; Server Actions and pages
  // independently verify signed sessions. robots.txt is not access control.
  if (pathname === '/media' || pathname.startsWith('/media/')) {
    const enabled = process.env.MEDIA_INTELLIGENCE_ENABLED === 'true';
    if (!enabled) {
      const url = request.nextUrl.clone();
      url.pathname = '/media-not-found';
      // Let the app route return 404 via layout/notFound when hit directly.
      // Middleware cannot easily call notFound(); pass through and let layout gate.
      return NextResponse.next();
    }

    const isLogin = pathname === '/media/login';
    const hasCookie = Boolean(request.cookies.get('bcs_media_session')?.value);
    const localBypass =
      process.env.NODE_ENV !== 'production' &&
      process.env.VERCEL_ENV !== 'preview' &&
      process.env.VERCEL_ENV !== 'production' &&
      process.env.MEDIA_INTELLIGENCE_LOCAL_BYPASS === 'true';

    if (!isLogin && !hasCookie && !localBypass) {
      const url = request.nextUrl.clone();
      url.pathname = '/media/login';
      return NextResponse.redirect(url);
    }

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
