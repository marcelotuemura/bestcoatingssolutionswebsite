import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';
import { summarizeAiForDisplay } from '@/lib/media-intelligence/vision/merge';

/**
 * Minimal Phase 4 surfacing of AI-generated metadata.
 * Deterministic catalog fields remain elsewhere on the page.
 */
export function AiAnalysisPanel({
  analysis,
}: {
  readonly analysis: AssetVisionAnalysis;
}) {
  const summary = summarizeAiForDisplay(analysis);

  return (
    <section
      className="border-navy-700 bg-navy-900/50 media-light:border-slate-200 media-light:bg-white space-y-3 rounded-2xl border p-4 text-sm"
      data-testid="ai-analysis-panel"
      aria-label="AI vision analysis"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="media-light:text-slate-900 font-medium text-white">
          AI vision analysis
        </h3>
        <span className="text-silver-500 media-light:text-slate-500 text-xs">
          {summary.provider} · v{analysis.analysisVersion}
        </span>
      </div>
      <p className="text-silver-500 media-light:text-slate-500 text-xs">
        Overlay only — deterministic catalog metadata is unchanged. Analysis
        never modifies originals or publishes.
      </p>

      <dl className="space-y-2">
        {(
          [
            ['Confidence', `${Math.round(summary.confidence * 100)}%`],
            ['Analyzed', new Date(summary.analyzedAt).toLocaleString()],
            ['AI manufacturer', summary.manufacturer ?? '—'],
            ['AI model', summary.model ?? '—'],
            ['Hull color', summary.hullColor ?? '—'],
            [
              'AI stage',
              `${summary.stage} (${Math.round(summary.stageConfidence * 100)}%)`,
            ],
            ['Services', summary.services.join(', ') || '—'],
            ['Quality', `${summary.qualityOverall}/100`],
            ['Marketing fit', `${summary.marketingSuitability}/100`],
            ['Hero fit', `${summary.heroSuitability}/100`],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="text-silver-500 media-light:text-slate-500 text-xs uppercase">
              {label}
            </dt>
            <dd className="text-silver-100 media-light:text-slate-900 mt-0.5">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {summary.privacyRequiresReview ? (
        <p
          className="media-light:text-amber-900 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
          data-testid="ai-privacy-flag"
        >
          Privacy review required before publication:{' '}
          {summary.privacyRisks.join(', ')}. Never auto-blurred.
        </p>
      ) : (
        <p className="text-silver-500 text-xs">
          No privacy risks flagged by vision analysis.
        </p>
      )}

      {summary.keywords.length > 0 ? (
        <div>
          <p className="text-silver-500 media-light:text-slate-500 text-xs uppercase">
            AI keywords
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {summary.keywords.slice(0, 16).map((keyword) => (
              <li
                key={keyword}
                className="border-navy-600 text-silver-200 media-light:border-slate-300 media-light:text-slate-700 rounded-md border px-2 py-0.5 text-xs"
              >
                {keyword}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.qualityExplanation.length > 0 ? (
        <details className="text-silver-400 media-light:text-slate-600 text-xs">
          <summary className="cursor-pointer">Quality explanation</summary>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {summary.qualityExplanation.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
