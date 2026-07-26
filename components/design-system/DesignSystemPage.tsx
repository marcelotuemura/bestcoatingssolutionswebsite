import { BrandLogoMark } from '@/components/brand/BrandLogoMark';
import { EditorialCard } from '@/components/ui/EditorialCard';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { Section } from '@/components/ui/Section';
import { brandLogo } from '@/config/brand-logo';
import { homePlaceholders } from '@/config/home-placeholders';
import { routes } from '@/config/routes';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

function TokenSwatch({
  name,
  cssVar,
  note,
}: {
  readonly name: string;
  readonly cssVar: string;
  readonly note?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="border-border size-12 shrink-0 rounded-[var(--radius-control)] border"
        style={{ background: `var(${cssVar})` }}
        aria-hidden
      />
      <div>
        <p className="text-text-primary text-sm font-medium">{name}</p>
        <p className="text-text-muted font-mono text-xs">{cssVar}</p>
        {note ? (
          <p className="text-text-secondary mt-1 text-xs">{note}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Controlled Phase 5B preview — visual identity only.
 * Not linked from primary navigation; sitemap excluded.
 */
export function DesignSystemPage({ locale }: { readonly locale: Locale }) {
  return (
    <main id="main-content" data-testid="design-system-page">
      <Section className="pt-14">
        <Container>
          <p className="text-accent-hover mb-3 text-sm tracking-[0.18em] uppercase">
            Phase 5B · Visual identity
          </p>
          <Heading as="h1">Premium Visual Identity System</Heading>
          <p className="text-text-secondary mt-5 max-w-2xl text-lg text-pretty">
            A timeless language for craftsmanship, precision, and dual Marine /
            Aviation identity. Subsequent pages inherit this system rather than
            inventing their own style.
          </p>
          {brandLogo.officialFilePending ? (
            <p
              className="border-border bg-surface text-text-secondary mt-6 max-w-2xl rounded-[var(--radius-control)] border px-4 py-3 text-sm text-pretty"
              role="status"
              data-testid="logo-file-pending"
            >
              Official logo file pending. Header/footer use a calm text wordmark
              — not the temporary letterform SVG. Add{' '}
              <code className="text-text-primary">bcs-logo-official.svg</code>{' '}
              (preferred) or optimized{' '}
              <code className="text-text-primary">.webp</code> /{' '}
              <code className="text-text-primary">.png</code> under{' '}
              <code className="text-text-primary">public/brand/</code>. Preserve
              masters in{' '}
              <code className="text-text-primary">
                docs/branding/originals/
              </code>
              .
            </p>
          ) : null}
        </Container>
      </Section>

      <Section id="logo" aria-labelledby="logo-heading">
        <Container className="space-y-10">
          <div className="max-w-2xl">
            <Heading as="h2" id="logo-heading">
              Logo usage
            </Heading>
            <p className="text-text-secondary mt-4 text-pretty">
              Full-color mark for hero and footer where space allows. Header
              evaluation below — if the full logo is too tall for navigation,
              propose (do not ship) a simplified horizontal variant.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="bg-bg-secondary border-border rounded-[var(--radius-card)] border p-6">
              <p className="text-text-muted mb-4 text-xs tracking-wide uppercase">
                Hero · {brandLogo.recommendedMaxHeightPx.hero}px
              </p>
              <BrandLogoMark
                maxHeightPx={brandLogo.recommendedMaxHeightPx.hero}
                priority
              />
            </div>
            <div className="bg-bg-secondary border-border rounded-[var(--radius-card)] border p-6">
              <p className="text-text-muted mb-4 text-xs tracking-wide uppercase">
                Footer · {brandLogo.recommendedMaxHeightPx.footer}px
              </p>
              <BrandLogoMark
                maxHeightPx={brandLogo.recommendedMaxHeightPx.footer}
              />
            </div>
            <div
              className="bg-bg-secondary border-border flex h-16 items-center rounded-[var(--radius-card)] border px-4"
              data-testid="logo-header-eval"
            >
              <BrandLogoMark
                maxHeightPx={brandLogo.recommendedMaxHeightPx.header}
              />
              <p className="text-text-muted ml-4 hidden text-xs sm:block">
                Header mock · 40px max height in 64px bar
              </p>
            </div>
          </div>

          <div className="border-border bg-surface/50 max-w-3xl rounded-[var(--radius-card)] border border-dashed p-5">
            <Heading as="h3">
              Proposed (not implemented): header variant
            </Heading>
            <p className="text-text-secondary mt-3 text-sm text-pretty">
              If the full official logo crowds the primary nav on laptop widths,
              prepare a simplified horizontal lockup (mark + wordmark on one
              line, reduced clear-space) for owner review. Do not redesign the
              boat/jet artwork. Do not deploy without approval.
            </p>
          </div>
        </Container>
      </Section>

      <Section
        id="color"
        className="bg-bg-secondary/50"
        aria-labelledby="color-heading"
      >
        <Container>
          <Heading as="h2" id="color-heading">
            Color tokens
          </Heading>
          <p className="text-text-secondary mt-4 max-w-2xl text-pretty">
            Semantic names preferred. Electric blue is accent only — never the
            dominant interface color.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TokenSwatch
              name="Background Primary"
              cssVar="--color-bg-primary"
            />
            <TokenSwatch
              name="Background Secondary"
              cssVar="--color-bg-secondary"
            />
            <TokenSwatch name="Surface" cssVar="--color-surface" />
            <TokenSwatch
              name="Accent"
              cssVar="--color-accent"
              note="CTA / focus"
            />
            <TokenSwatch name="Accent Hover" cssVar="--color-accent-hover" />
            <TokenSwatch name="Text Primary" cssVar="--color-text-primary" />
            <TokenSwatch
              name="Text Secondary"
              cssVar="--color-text-secondary"
            />
            <TokenSwatch name="Border" cssVar="--color-border" />
            <TokenSwatch name="Divider" cssVar="--color-divider" />
          </div>
        </Container>
      </Section>

      <Section id="typography" aria-labelledby="type-heading">
        <Container className="space-y-10">
          <div className="max-w-2xl">
            <Heading as="h2" id="type-heading">
              Typography
            </Heading>
            <p className="text-text-secondary mt-4 text-pretty">
              Display: Newsreader (OFL). Body / UI: Manrope (OFL). Loaded via{' '}
              <code className="text-text-primary">next/font</code> — two
              families, limited weights.
            </p>
          </div>
          <div className="space-y-8">
            <div>
              <p className="text-text-muted mb-2 text-xs tracking-wide uppercase">
                Display · H1
              </p>
              <p className="font-display text-text-primary text-5xl font-medium tracking-tight">
                Craftsmanship That Shows
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-2 text-xs tracking-wide uppercase">
                Section · H2
              </p>
              <p className="font-display text-text-primary text-3xl font-medium tracking-tight">
                Quality Is Built Before the Paint Is Applied
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-2 text-xs tracking-wide uppercase">
                Body
              </p>
              <p className="text-text-secondary max-w-xl text-base leading-relaxed text-pretty">
                We inspect the damaged area, identify what sits beneath the
                surface, prepare the repair correctly, and match the surrounding
                finish before the final polish.
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-2 text-xs tracking-wide uppercase">
                UI / Button / Caption
              </p>
              <p className="text-text-primary text-sm font-medium tracking-wide">
                Request an Estimate
              </p>
              <p className="text-text-muted mt-2 text-xs tracking-wide">
                Placeholder image — not a BCS project photo
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section
        id="buttons"
        className="bg-bg-secondary/40"
        aria-labelledby="buttons-heading"
      >
        <Container>
          <Heading as="h2" id="buttons-heading">
            Buttons
          </Heading>
          <p className="text-text-secondary mt-4 max-w-2xl text-pretty">
            One primary system and one secondary system. No competing styles.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Request an Estimate</Button>
            <Button variant="secondary">View Our Work</Button>
            <Button variant="ghost">Learn About Our Process</Button>
            <ButtonLink
              href={localePath(locale, routes.contact.path)}
              variant="link"
            >
              Tell Us About Your Project
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section id="cards-media" aria-labelledby="cards-heading">
        <Container>
          <Heading as="h2" id="cards-heading">
            Cards & imagery
          </Heading>
          <p className="text-text-secondary mt-4 max-w-2xl text-pretty">
            Editorial cards: large imagery, minimal borders, subtle inset light.
            Image radius stays tight so photography feels architectural, not
            app-like.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <EditorialCard
              media={
                <MediaFrame
                  src={homePlaceholders.marineVisual.src}
                  alt=""
                  aspect="landscape"
                  division="marine"
                  caption="Marine atmosphere — silhouette placeholder until hero photography arrives."
                />
              }
            >
              <Heading as="h3">Marine</Heading>
              <p className="text-text-secondary mt-3 text-sm text-pretty">
                Water, hull reflections, fiberglass and gelcoat finishes. Calm
                depth; blue used sparingly in atmosphere, not as chrome.
              </p>
            </EditorialCard>
            <EditorialCard
              media={
                <MediaFrame
                  src={homePlaceholders.aviationVisual.src}
                  alt=""
                  aspect="landscape"
                  division="aviation"
                  caption="Aviation atmosphere — silhouette placeholder until approved aviation stills arrive."
                />
              }
            >
              <Heading as="h3">Aviation</Heading>
              <p className="text-text-secondary mt-3 text-sm text-pretty">
                Clean surfaces, precision, metallic reflections, composite
                materials. Cooler graphite wash; same type and spacing family.
              </p>
            </EditorialCard>
          </div>
        </Container>
      </Section>

      <Section
        id="motion"
        className="bg-bg-secondary/40"
        aria-labelledby="motion-heading"
      >
        <Container className="max-w-2xl">
          <Heading as="h2" id="motion-heading">
            Motion
          </Heading>
          <p className="text-text-secondary mt-4 text-pretty">
            Restrained: fade and gentle rise, image reveal, button press scale,
            filter transitions. Ease{' '}
            <code className="text-text-primary">
              cubic-bezier(0.16, 1, 0.3, 1)
            </code>
            . Honor{' '}
            <code className="text-text-primary">prefers-reduced-motion</code>.
            Avoid parallax noise, glow storms, and gaming motion.
          </p>
        </Container>
      </Section>

      <Section id="spacing" aria-labelledby="spacing-heading">
        <Container className="max-w-2xl">
          <Heading as="h2" id="spacing-heading">
            Spacing
          </Heading>
          <p className="text-text-secondary mt-4 text-pretty">
            Scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96px.
            Sections prefer 64–96px vertical rhythm on desktop so the site feels
            calm and premium — never dense dashboard packing.
          </p>
          <div className="mt-8 flex flex-wrap items-end gap-3">
            {[4, 8, 12, 16, 24, 32, 48, 64].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div
                  className="bg-accent/80 w-4 rounded-sm"
                  style={{ height: n }}
                  aria-hidden
                />
                <span className="text-text-muted text-xs">{n}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
