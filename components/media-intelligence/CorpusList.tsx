import Link from 'next/link';
import type { MediaCorpus } from '@/lib/media-intelligence/corpora';

export function CorpusList({
  corpora,
}: {
  readonly corpora: readonly MediaCorpus[];
}) {
  if (corpora.length === 0) {
    return (
      <p className="text-silver-300 text-sm" data-testid="corpus-list-empty">
        No corpora yet. Create a draft to begin governed dataset selection.
      </p>
    );
  }

  return (
    <ul className="space-y-3" data-testid="corpus-list">
      {corpora.map((corpus) => (
        <li
          key={corpus.id}
          className="border-navy-700 media-light:border-slate-200 rounded-xl border px-4 py-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link
              href={`/media/corpora/${corpus.id}`}
              className="text-electric-400 font-medium hover:underline"
              data-testid={`corpus-link-${corpus.id}`}
            >
              {corpus.name}
            </Link>
            <span
              className="text-silver-400 text-xs tracking-wide uppercase"
              data-testid={`corpus-status-${corpus.id}`}
            >
              {corpus.status}
            </span>
          </div>
          <p className="text-silver-300 media-light:text-slate-600 mt-1 text-sm">
            {corpus.intendedUse} · {corpus.externalId}
          </p>
        </li>
      ))}
    </ul>
  );
}
