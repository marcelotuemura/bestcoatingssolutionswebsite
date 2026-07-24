import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import {
  evaluateMediaAccessGate,
  mediaIntelligenceConfig,
} from '@/config/media-intelligence';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';

/**
 * Call at the top of every authenticated `/media` page (not login).
 * Layout + middleware are additional layers — not sufficient alone.
 */
export async function requireMediaPageAccess(): Promise<void> {
  const gate = evaluateMediaAccessGate();
  if (!gate.ok) {
    if (gate.status === 404) notFound();
    // Misconfigured secrets in development → login with error messaging.
    redirect(mediaIntelligenceConfig.loginPath);
  }

  const session = await resolveMediaTrustedActor();
  if (!session.ok) {
    redirect(mediaIntelligenceConfig.loginPath);
  }
}

export async function isMediaLoginPath(): Promise<boolean> {
  const headerStore = await headers();
  const path =
    headerStore.get('x-pathname') ||
    headerStore.get('next-url') ||
    headerStore.get('x-invoke-path') ||
    '';
  return path.includes('/media/login');
}
