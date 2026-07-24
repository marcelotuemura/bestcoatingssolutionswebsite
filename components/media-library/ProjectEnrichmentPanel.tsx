import type { ProjectEnrichmentSuggestion } from '@/lib/media-intelligence/vision/schema';

/**
 * Suggestions only — never auto-applies project grouping changes.
 */
export function ProjectEnrichmentPanel({
  suggestion,
}: {
  readonly suggestion: ProjectEnrichmentSuggestion;
}) {
  return (
    <section
      className="border-navy-700 bg-navy-900/40 media-light:border-slate-200 media-light:bg-white rounded-2xl border p-4 text-sm"
      data-testid="project-enrichment-panel"
    >
      <h3 className="media-light:text-slate-900 font-medium text-white">
        AI project suggestions
      </h3>
      <p className="text-silver-500 media-light:text-slate-500 mt-1 text-xs">
        Suggestions only — grouping is never altered automatically.
      </p>

      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-silver-500 text-xs uppercase">Missing stages</dt>
          <dd className="text-silver-100 media-light:text-slate-900">
            {suggestion.missingStages.length > 0
              ? suggestion.missingStages.join(', ')
              : 'None detected'}
          </dd>
        </div>
        <div>
          <dt className="text-silver-500 text-xs uppercase">Suggested cover</dt>
          <dd className="text-silver-100 media-light:text-slate-900 break-all">
            {suggestion.suggestedCoverAssetId ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-silver-500 text-xs uppercase">Related media</dt>
          <dd className="text-silver-100 media-light:text-slate-900">
            {suggestion.relatedAssetIds.length} candidate
            {suggestion.relatedAssetIds.length === 1 ? '' : 's'}
          </dd>
        </div>
        <div>
          <dt className="text-silver-500 text-xs uppercase">Timeline order</dt>
          <dd className="text-silver-100 media-light:text-slate-900">
            {suggestion.suggestedTimelineOrder.length} assets suggested
          </dd>
        </div>
      </dl>

      {suggestion.similarityNotes.length > 0 ? (
        <ul className="text-silver-400 media-light:text-slate-600 mt-3 list-disc space-y-1 pl-4 text-xs">
          {suggestion.similarityNotes.slice(0, 6).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
