# SEO Strategy

SEO is a first-class constraint. BCS is a **local, mobile service** business, so
local + intent-driven SEO matters most, backed by fast, accessible pages.

## Technical foundations (implemented in the foundation)

- **Metadata API** — site-wide defaults built in `lib/seo/metadata.ts` with a
  title template (`%s | BCS`), description, keywords, canonical, Open Graph and
  Twitter cards. `metadataBase` (from `NEXT_PUBLIC_SITE_URL`) makes all relative
  URLs absolute for valid social previews.
- **Dynamic sitemap** — `app/sitemap.ts` generates `/sitemap.xml` from the typed
  route registry (`config/routes.ts`); new public routes appear automatically.
- **robots.txt** — `app/robots.ts` allows the marketing site and disallows
  `/portal` and `/api`; references the sitemap and host.
- **Structured data (JSON-LD)** — `lib/seo/structured-data.ts` emits
  `WebSite` and `ProfessionalService` schema in the root layout; per-page schema
  (Service, BreadcrumbList, Article, ImageObject) added as pages land.
- **Performance = SEO** — Server Components, `next/image` (AVIF/WebP), minimal
  client JS, and Core Web Vitals budgets (see `DEPLOYMENT.md`).

## Per-page metadata pattern

Each route exports `metadata` (or `generateMetadata`) that overrides only what
changes, spreading shared defaults. Every page sets a unique title, description
and canonical.

## Local SEO (business priority)

- `ProfessionalService` schema with `areaServed` = "Jupiter south to the Florida
  Keys"; expand as the service area grows.
- Google Business Profile alignment; NAP (name/address/phone) consistency once
  contact details are finalized (`config/site.ts`).
- Location + service landing pages (e.g. Marine ⨉ region) considered in Phase 3.
- Google Reviews integration (Phase 6) for ratings-rich results.

## Content & keywords

- Intent clusters per division: e.g. "yacht gelcoat repair South Florida",
  "aircraft ceramic coating FBO". Drive from `config/services.ts`.
- Blog (Phase 5) targets informational intent with Article structured data.

## Governance

- Titles ≤ ~60 chars, descriptions ≤ ~155 chars.
- One `<h1>` per page; logical heading order (also an a11y requirement).
- Canonicals on every page; avoid duplicate content.
- Validate with Rich Results Test and Lighthouse before launch of each page.
