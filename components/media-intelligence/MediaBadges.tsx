export function StatCard({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
}) {
  return (
    <div className="border-navy-700 bg-navy-900/60 rounded-2xl border p-4">
      <p className="text-silver-500 text-xs tracking-wide uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="text-silver-500 mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

export function ScoreBadge({
  label,
  score,
}: {
  readonly label: string;
  readonly score: number;
}) {
  const tone =
    score >= 75
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
      : score >= 55
        ? 'text-amber-200 border-amber-500/30 bg-amber-500/10'
        : 'text-rose-200 border-rose-500/30 bg-rose-500/10';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${tone}`}
    >
      <span className="text-silver-500">{label}</span>
      <strong>{score}</strong>
    </span>
  );
}

export function StatusBadge({ status }: { readonly status: string }) {
  return (
    <span className="border-navy-700 bg-navy-800 text-silver-300 inline-flex rounded-lg border px-2 py-1 text-xs">
      {status.replace(/_/g, ' ')}
    </span>
  );
}
