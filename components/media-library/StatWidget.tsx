export function StatWidget({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
}) {
  return (
    <div
      className="border-navy-700 bg-navy-900/60 media-light:border-slate-200 media-light:bg-white rounded-2xl border p-4"
      data-testid="stat-widget"
    >
      <p className="text-silver-500 media-light:text-slate-500 text-xs tracking-wide uppercase">
        {label}
      </p>
      <p className="media-light:text-slate-900 mt-2 text-3xl font-semibold text-white">
        {value}
      </p>
      {hint ? (
        <p className="text-silver-500 media-light:text-slate-500 mt-1 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function DistributionList({
  title,
  buckets,
}: {
  readonly title: string;
  readonly buckets: readonly {
    readonly label: string;
    readonly count: number;
  }[];
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <section
      className="border-navy-700 bg-navy-900/40 media-light:border-slate-200 media-light:bg-white rounded-2xl border p-5"
      aria-label={title}
    >
      <h2 className="media-light:text-slate-900 text-lg font-semibold text-white">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {buckets.map((bucket) => (
          <li key={bucket.label}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="text-silver-300 media-light:text-slate-700 truncate">
                {bucket.label}
              </span>
              <span className="text-silver-500 media-light:text-slate-500 tabular-nums">
                {bucket.count}
              </span>
            </div>
            <div
              className="bg-navy-800 media-light:bg-slate-100 h-2 overflow-hidden rounded-full"
              role="presentation"
            >
              <div
                className="bg-electric-500 h-full rounded-full"
                style={{ width: `${(bucket.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
        {buckets.length === 0 ? (
          <li className="text-silver-500 text-sm">No data</li>
        ) : null}
      </ul>
    </section>
  );
}

export function ScoreChip({
  label,
  score,
}: {
  readonly label: string;
  readonly score: number;
}) {
  const tone =
    score >= 75
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10 media-light:text-emerald-800 media-light:border-emerald-300 media-light:bg-emerald-50'
      : score >= 55
        ? 'text-amber-200 border-amber-500/30 bg-amber-500/10 media-light:text-amber-800 media-light:border-amber-300 media-light:bg-amber-50'
        : 'text-rose-200 border-rose-500/30 bg-rose-500/10 media-light:text-rose-800 media-light:border-rose-300 media-light:bg-rose-50';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${tone}`}
    >
      <span className="opacity-70">{label}</span>
      <strong>{Math.round(score)}</strong>
    </span>
  );
}
