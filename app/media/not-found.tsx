import Link from 'next/link';
import { MediaShell } from '@/components/media-intelligence/MediaShell';

/**
 * Media-scoped 404 — never fall through to the marketing locale 404 shell.
 */
export default function MediaNotFound() {
  return (
    <MediaShell
      title="Not found"
      subtitle="This media page or publication job does not exist."
      readOnlyBanner={false}
    >
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-silver-300 media-light:text-slate-600 text-sm">
          The requested media resource could not be found.
        </p>
        <Link
          href="/media/publications"
          className="text-electric-300 mt-6 inline-block text-sm underline"
          data-testid="media-not-found-publications"
        >
          Back to publications
        </Link>
      </div>
    </MediaShell>
  );
}
