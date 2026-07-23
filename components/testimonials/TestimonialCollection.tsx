import type { TestimonialRecord } from '@/config/testimonials';
import type { Locale } from '@/i18n/config';

export function TestimonialCard({
  testimonial,
  locale,
}: {
  readonly testimonial: TestimonialRecord;
  readonly locale: Locale;
}) {
  const copy = testimonial.copy[locale];
  return (
    <blockquote
      className="border-navy-700 border-t pt-4"
      data-testid="testimonial-card"
    >
      <p className="text-silver-200 text-pretty">&ldquo;{copy.quote}&rdquo;</p>
      <footer className="text-silver-500 mt-3 text-sm">
        <cite className="text-white not-italic">
          {copy.customerDisplayName}
        </cite>
        {testimonial.city ? <span> · {testimonial.city}</span> : null}
        {typeof testimonial.rating === 'number' ? (
          <span data-testid="testimonial-rating">
            {' '}
            · {testimonial.rating}/5
          </span>
        ) : null}
      </footer>
    </blockquote>
  );
}

export function FeaturedTestimonial({
  testimonial,
  locale,
}: {
  readonly testimonial: TestimonialRecord;
  readonly locale: Locale;
}) {
  return (
    <div data-testid="featured-testimonial">
      <TestimonialCard testimonial={testimonial} locale={locale} />
    </div>
  );
}

export function TestimonialCollection({
  testimonials,
  locale,
  heading,
  emptyNote,
}: {
  readonly testimonials: readonly TestimonialRecord[];
  readonly locale: Locale;
  readonly heading: string;
  readonly emptyNote: string;
}) {
  if (testimonials.length === 0) {
    return (
      <p className="text-silver-500 sr-only" data-testid="testimonials-empty">
        {emptyNote}
      </p>
    );
  }

  return (
    <section aria-labelledby="testimonials-heading" data-testid="testimonials">
      <h2
        id="testimonials-heading"
        className="text-xl font-semibold text-white"
      >
        {heading}
      </h2>
      <ul className="mt-6 space-y-6">
        {testimonials.map((item) => (
          <li key={item.id}>
            <TestimonialCard testimonial={item} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
