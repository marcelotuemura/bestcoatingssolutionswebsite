import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { recommendContentCalendar } from '@/lib/media-intelligence/social';

export default function MediaCalendarPage() {
  const recommendations = recommendContentCalendar();

  return (
    <MediaShell
      title="Content Calendar"
      subtitle="Recommended weekly posts, monthly articles, seasonal campaigns, insurance tips, and before/after campaigns. Never auto-publish."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((item) => (
          <article
            key={item.title}
            className="border-navy-700 bg-navy-900/50 rounded-2xl border p-5"
          >
            <p className="text-electric-400 text-xs tracking-wide uppercase">
              {item.kind.replace(/_/g, ' ')}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              {item.title}
            </h2>
            <p className="text-silver-400 mt-2 text-sm">{item.rationale}</p>
            <p className="text-silver-500 mt-3 text-xs">
              autoPublish: {String(item.autoPublish)}
            </p>
          </article>
        ))}
      </div>
    </MediaShell>
  );
}
