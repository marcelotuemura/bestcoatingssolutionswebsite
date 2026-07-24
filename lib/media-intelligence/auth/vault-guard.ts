import { evaluateMediaAccessGate } from '@/config/media-intelligence';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';

/**
 * Auth check for /media/vault route handlers.
 * Returns a Response when blocked; null when allowed.
 */
export async function requireMediaVaultAccess(): Promise<Response | null> {
  const gate = evaluateMediaAccessGate();
  if (!gate.ok) {
    return new Response('Not found', { status: gate.status });
  }
  const session = await resolveMediaTrustedActor();
  if (!session.ok) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
