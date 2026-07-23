import Image from 'next/image';
import type { ProjectImage } from '@/config/projects';

/**
 * Accessible side-by-side before/after — usable without JavaScript.
 * Labels remain visible; meaning is not conveyed by imagery alone.
 */
export function BeforeAfterPair({
  before,
  after,
  beforeLabel,
  afterLabel,
  pairLabel,
  caption,
  placeholderLabel,
}: {
  readonly before: ProjectImage;
  readonly after: ProjectImage;
  readonly beforeLabel: string;
  readonly afterLabel: string;
  readonly pairLabel: string;
  readonly caption?: string;
  readonly placeholderLabel: string;
}) {
  return (
    <figure
      className="space-y-3"
      data-testid="before-after-pair"
      aria-label={pairLabel}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border-navy-700 overflow-hidden rounded-2xl border">
          <p className="bg-navy-900 px-3 py-2 text-xs font-medium tracking-wide text-white uppercase">
            {beforeLabel}
          </p>
          <Image
            src={before.src}
            alt={before.alt}
            width={before.width}
            height={before.height}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {before.placeholder ? (
            <p className="text-silver-500 px-3 py-2 text-xs">
              {placeholderLabel}
            </p>
          ) : null}
          {before.caption ? (
            <figcaption className="text-silver-400 px-3 py-2 text-sm">
              {before.caption}
            </figcaption>
          ) : null}
        </div>
        <div className="border-navy-700 overflow-hidden rounded-2xl border">
          <p className="bg-navy-900 px-3 py-2 text-xs font-medium tracking-wide text-white uppercase">
            {afterLabel}
          </p>
          <Image
            src={after.src}
            alt={after.alt}
            width={after.width}
            height={after.height}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {after.placeholder ? (
            <p className="text-silver-500 px-3 py-2 text-xs">
              {placeholderLabel}
            </p>
          ) : null}
          {after.caption ? (
            <figcaption className="text-silver-400 px-3 py-2 text-sm">
              {after.caption}
            </figcaption>
          ) : null}
        </div>
      </div>
      {caption ? (
        <p className="text-silver-400 text-sm text-pretty">{caption}</p>
      ) : null}
    </figure>
  );
}
