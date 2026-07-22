import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

/*
 * FOUNDATION PLACEHOLDER.
 *
 * This is intentionally NOT the designed premium homepage. During the
 * foundation phase the project ships a single minimal, static landing page so
 * the toolchain (build / lint / test / dev server / deploy) is verifiable
 * end-to-end. The real homepage and all other routes are built in later phases
 * per ROADMAP.md.
 */
export const metadata: Metadata = {
  title: 'Foundation Ready',
  description: `${siteConfig.name} website — engineering foundation.`,
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <span className="border-electric-500/40 bg-electric-500/10 text-electric-400 mb-6 rounded-full border px-4 py-1 text-sm font-medium tracking-wide uppercase">
        {siteConfig.shortName} · Engineering Foundation
      </span>
      <h1 className="to-silver-300 max-w-3xl bg-gradient-to-b from-white bg-clip-text text-4xl font-semibold text-transparent sm:text-6xl">
        {siteConfig.name}
      </h1>
      <p className="text-silver-500 mt-6 max-w-xl text-balance sm:text-lg">
        Premium marine &amp; aviation coatings. {siteConfig.serviceArea.range}.
      </p>
      <p className="text-silver-500 mt-10 text-sm">
        Project foundation is in place. Pages and premium experiences are
        shipped in later phases.
      </p>
    </main>
  );
}
