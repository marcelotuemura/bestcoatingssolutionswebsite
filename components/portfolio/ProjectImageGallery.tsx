import Image from 'next/image';
import type { ProjectImage } from '@/config/projects';
import { Heading } from '@/components/ui/Heading';

export function ProjectImageGallery({
  title,
  images,
  placeholderLabel,
}: {
  readonly title: string;
  readonly images: readonly ProjectImage[];
  readonly placeholderLabel: string;
}) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div data-testid="project-image-gallery">
      <Heading as="h2" id="gallery-heading">
        {title}
      </Heading>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <li
            key={image.id}
            className="border-navy-700 overflow-hidden rounded-2xl border"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-auto w-full object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
            {image.placeholder ? (
              <p className="text-silver-500 px-3 py-2 text-xs">
                {placeholderLabel}
              </p>
            ) : null}
            {image.caption ? (
              <p className="text-silver-400 px-3 py-2 text-sm">
                {image.caption}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
