import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import {
  evaluateMediaAccessGate,
  isMediaLocalAuthBypass,
  mediaIntelligenceConfig,
} from '@/config/media-intelligence';
import {
  primaryRole,
  type MediaAccessRole,
} from '@/lib/media-intelligence/auth/roles';
import { resolveMediaAuthProvider } from '@/lib/media-intelligence/supabase/config';

/**
 * Trusted actor — server-derived only. Never accept role/id from the client.
 */
export interface MediaTrustedActor {
  readonly id: string;
  readonly role: MediaAccessRole;
  readonly roles: readonly MediaAccessRole[];
  readonly email?: string;
  readonly source:
    'temporary-media-session' | 'local-dev-bypass' | 'supabase-auth';
}

export interface MediaSessionPayload {
  readonly id: string;
  readonly role: MediaAccessRole;
  readonly roles?: readonly MediaAccessRole[];
  readonly iat: number;
  readonly exp: number;
  readonly nonce: string;
}

function getSessionSecret(): string {
  const secret = process.env.MEDIA_INTELLIGENCE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error('MEDIA_INTELLIGENCE_SESSION_SECRET is not configured.');
  }
  return secret;
}

function getAccessSecret(): string {
  const secret = process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error('MEDIA_INTELLIGENCE_ACCESS_SECRET is not configured.');
  }
  return secret;
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function verifyAccessSecret(candidate: string): boolean {
  const expected = getAccessSecret();
  return safeEqual(candidate, expected);
}

export function createSignedSessionToken(
  payload: MediaSessionPayload,
  secret = getSessionSecret(),
): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url',
  );
  const signature = sign(body, secret);
  return `${body}.${signature}`;
}

export function parseSignedSessionToken(
  token: string,
  secret = getSessionSecret(),
): MediaSessionPayload | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = sign(body, secret);
  if (!safeEqual(signature, expected)) return null;
  try {
    const json = Buffer.from(body, 'base64url').toString('utf8');
    const payload = JSON.parse(json) as MediaSessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
      return null;
    }
    if (typeof payload.id !== 'string' || payload.id.length < 1) return null;
    const roles = payload.roles?.length
      ? payload.roles
      : ([payload.role] as MediaAccessRole[]);
    if (!roles.includes(payload.role)) return null;
    return { ...payload, roles };
  } catch {
    return null;
  }
}

export function issueOwnerSessionToken(): string {
  const now = Math.floor(Date.now() / 1000);
  return createSignedSessionToken({
    id: `owner-${randomBytes(8).toString('hex')}`,
    role: 'owner',
    roles: ['owner'],
    iat: now,
    exp: now + mediaIntelligenceConfig.sessionTtlSeconds,
    nonce: randomBytes(12).toString('hex'),
  });
}

export function sessionCookieOptions(
  maxAge = mediaIntelligenceConfig.sessionTtlSeconds,
) {
  const secure =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict' as const,
    path: '/media',
    maxAge,
  };
}

export async function readMediaSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(mediaIntelligenceConfig.sessionCookieName)?.value;
}

export async function setMediaSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(
    mediaIntelligenceConfig.sessionCookieName,
    token,
    sessionCookieOptions(),
  );
}

export async function clearMediaSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(mediaIntelligenceConfig.sessionCookieName, '', {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
}

export type MediaSessionResult =
  | { readonly ok: true; readonly actor: MediaTrustedActor }
  | { readonly ok: false; readonly error: string; readonly status: number };

async function resolveTemporarySession(): Promise<MediaSessionResult> {
  const gate = evaluateMediaAccessGate();
  if (!gate.ok) {
    return { ok: false, error: gate.reason, status: gate.status };
  }

  if (gate.mode === 'local-bypass' || isMediaLocalAuthBypass()) {
    return {
      ok: true,
      actor: {
        id: 'local-dev-owner',
        role: 'owner',
        roles: ['owner'],
        source: 'local-dev-bypass',
      },
    };
  }

  const token = await readMediaSessionCookie();
  if (!token) {
    return {
      ok: false,
      error: 'Authentication required.',
      status: 401,
    };
  }

  let payload: MediaSessionPayload | null = null;
  try {
    payload = parseSignedSessionToken(token);
  } catch {
    payload = null;
  }
  if (!payload) {
    return {
      ok: false,
      error: 'Invalid or expired session.',
      status: 401,
    };
  }

  const roles = payload.roles ?? [payload.role];
  return {
    ok: true,
    actor: {
      id: payload.id,
      role: primaryRole(roles),
      roles,
      source: 'temporary-media-session',
    },
  };
}

/**
 * Establish trusted actor from server session (temporary HMAC or Supabase Auth).
 * Never trusts client-supplied actor fields.
 *
 * Rollback: set MEDIA_AUTH_PROVIDER=temporary (default) to use Phase 1 gate.
 */
export async function resolveMediaTrustedActor(): Promise<MediaSessionResult> {
  const provider = resolveMediaAuthProvider();
  if (provider === 'supabase') {
    const { resolveSupabaseMediaActor } =
      await import('@/lib/media-intelligence/auth/supabase-auth');
    return resolveSupabaseMediaActor();
  }
  return resolveTemporarySession();
}
