import Link from 'next/link';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { requireMediaPermission } from '@/lib/media-intelligence/auth/guards';
import {
  ROLE_PERMISSIONS,
  MEDIA_ROLES,
} from '@/lib/media-intelligence/auth/roles';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Media Users | Best Coatings Solutions',
  robots: { index: false, follow: false },
};

/**
 * Owner-only user/role management surface.
 * Live user directory requires Supabase; matrix is always visible for review.
 */
export default async function MediaUsersPage() {
  const gate = await requireMediaPermission('manage_users');
  if (!gate.ok) {
    if (gate.status === 401) redirect('/media/login');
    redirect('/media');
  }

  return (
    <MediaShell
      title="Users & roles"
      subtitle="Owner-only. UI hiding is not authorization — mutations are server-enforced."
    >
      <p
        className="text-silver-400 mb-6 text-sm"
        data-testid="media-users-actor"
      >
        Signed in as {gate.actor.email ?? gate.actor.id} · role{' '}
        {gate.actor.role}
      </p>

      <section data-testid="role-permission-matrix">
        <h2 className="media-light:text-slate-900 mb-3 text-lg font-semibold text-white">
          Role permission matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="text-silver-200 w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="text-silver-500 border-b border-white/10 text-xs uppercase">
                <th className="py-2 pr-4">Permission</th>
                {MEDIA_ROLES.map((role) => (
                  <th key={role} className="px-2 py-2">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(
                new Set(
                  MEDIA_ROLES.flatMap((role) => [...ROLE_PERMISSIONS[role]]),
                ),
              ).map((permission) => (
                <tr key={permission} className="border-b border-white/5">
                  <td className="py-2 pr-4 font-mono text-xs">{permission}</td>
                  {MEDIA_ROLES.map((role) => (
                    <td key={role} className="px-2 py-2 text-center">
                      {ROLE_PERMISSIONS[role].includes(permission) ? '✓' : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-silver-500 mt-8 text-xs">
        Assign roles in Supabase via <code>media_user_roles</code> (owner-only
        RLS). See{' '}
        <Link
          href="/media/reports"
          className="text-electric-400 hover:underline"
        >
          reports
        </Link>{' '}
        and docs/MEDIA_SUPABASE_PHASE5.md.
      </p>
    </MediaShell>
  );
}
