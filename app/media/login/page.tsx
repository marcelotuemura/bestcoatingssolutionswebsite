import { MediaLoginForm } from '@/components/media-intelligence/MediaLoginForm';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import {
  evaluateMediaAccessGate,
  isMediaLocalAuthBypass,
} from '@/config/media-intelligence';
import { notFound, redirect } from 'next/navigation';
import { resolveMediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import { resolveMediaAuthProvider } from '@/lib/media-intelligence/supabase/config';

export const metadata = {
  title: 'Media Login | Best Coatings Solutions',
  robots: { index: false, follow: false },
};

export default async function MediaLoginPage() {
  const gate = evaluateMediaAccessGate();
  if (!gate.ok && gate.status === 404) {
    notFound();
  }

  if (isMediaLocalAuthBypass()) {
    redirect('/media');
  }

  const session = await resolveMediaTrustedActor();
  if (session.ok) {
    redirect('/media');
  }

  const authProvider = resolveMediaAuthProvider();

  return (
    <MediaShell
      title="Secure access"
      subtitle={
        authProvider === 'supabase'
          ? 'Supabase Auth for the internal Media Intelligence studio. Roles enforced server-side.'
          : 'Temporary shared-secret authentication (rollback path). Switch to MEDIA_AUTH_PROVIDER=supabase after acceptance tests.'
      }
      showNav={false}
      showLogout={false}
    >
      {!gate.ok ? (
        <p className="text-sm text-rose-200" role="alert">
          {gate.reason}
        </p>
      ) : (
        <MediaLoginForm authProvider={authProvider} />
      )}
    </MediaShell>
  );
}
