import Link from 'next/link';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { StatWidget } from '@/components/media-library/StatWidget';
import { requireMediaPageAccess } from '@/lib/media-intelligence/auth/page-guard';
import { getCatalogAssetById, getDuplicateGroups } from '@/lib/media-library';

export default async function DuplicateManagerPage() {
  await requireMediaPageAccess();
  const groups = await getDuplicateGroups();
  const exact = groups.filter((g) => g.kind === 'exact');
  const near = groups.filter((g) => g.kind === 'near');

  const enriched = await Promise.all(
    groups.map(async (group) => ({
      group,
      members: await Promise.all(
        group.members.map(async (member) => ({
          ...member,
          asset: await getCatalogAssetById(member.assetId),
        })),
      ),
    })),
  );

  return (
    <MediaShell
      title="Duplicate Manager"
      subtitle="Review exact and near-duplicate groups. No automatic deletion, movement, or renaming — owner approval required."
    >
      <p
        className="media-light:border-amber-300 media-light:bg-amber-50 media-light:text-amber-900 mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
        role="status"
        data-testid="duplicate-readonly-banner"
      >
        Read-only review. Recommended keep is advisory only. Never delete or
        move files from this screen.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatWidget label="Exact groups" value={exact.length} />
        <StatWidget label="Near groups" value={near.length} />
        <StatWidget label="Total groups" value={groups.length} />
      </div>

      <div className="space-y-6" data-testid="duplicate-groups">
        {enriched.map(({ group, members }) => (
          <section
            key={group.id}
            id={group.id}
            className="border-navy-700 bg-navy-900/40 media-light:border-slate-200 media-light:bg-white scroll-mt-8 rounded-2xl border p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="media-light:text-slate-900 text-lg font-semibold text-white">
                  {group.kind === 'exact' ? 'Exact' : 'Near'} duplicate ·{' '}
                  {group.id}
                </h2>
                <p className="text-silver-500 mt-1 text-sm">
                  Similarity {Math.round(group.similarity * 100)}%
                  {group.recommendedKeepAssetId
                    ? ` · Recommended keep: ${group.recommendedKeepAssetId}`
                    : ''}
                </p>
              </div>
              <span className="border-navy-700 rounded-lg border px-2 py-1 text-xs uppercase">
                {group.kind}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {members.map((member) => (
                <li
                  key={member.assetId}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <Link
                      href={`/media/catalog/${member.assetId}`}
                      className="text-electric-400 hover:underline"
                    >
                      {member.filename ?? member.assetId}
                    </Link>
                    <span className="text-silver-500 ml-2">
                      ({member.role}
                      {member.assetId === group.recommendedKeepAssetId
                        ? ' · recommended keep'
                        : ''}
                      )
                    </span>
                  </div>
                  {member.asset ? (
                    <span className="text-silver-500 text-xs">
                      Web {member.asset.scores.website} · Tech{' '}
                      {member.asset.scores.technical}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            {group.notes ? (
              <p className="text-silver-500 mt-3 text-xs">{group.notes}</p>
            ) : null}
          </section>
        ))}
      </div>
    </MediaShell>
  );
}
