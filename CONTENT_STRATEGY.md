# Content Strategy

## Brand voice

Confident, precise, understated — the language of aerospace and superyachts.
Short, declarative sentences. Emphasize craftsmanship, protection, restoration and
mobility. Avoid hype, clichés and generic contractor phrasing.

## Audiences

Two buyer contexts inform tone and proof:

- **Marine:** boat/yacht owners, captains, marinas, shipyards, yacht management
  companies, brokers, insurance companies.
- **Aviation:** aircraft owners, charter companies, FBOs.

Messaging leads with outcomes (finish quality, asset protection, minimal
downtime) and the **mobile service** advantage (we come to the vessel/aircraft).

See also [`BRAND_GUIDE.md`](./BRAND_GUIDE.md),
[`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md), and
[`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md).

## Content model (content-as-data)

Structured content lives in typed modules so it stays consistent across pages,
SEO and forms:

- **Services** — `config/services.ts` (division, slug, name; extend with
  summary, benefits, imagery).
- **Routes/navigation** — `config/routes.ts`.
- **Projects / Before & After** (Phase 3) — a typed `Project` model in `types/`
  feeding `/projects`, `/before-after`, `/gallery` and structured data.
- **Blog** (Phase 5) — MDX or headless CMS; Article schema.

## Page intent (from route registry)

| Route               | Primary intent                                  |
| ------------------- | ----------------------------------------------- |
| `/`                 | Brand + divisions + primary CTAs                |
| `/marine`           | Marine services overview & proof                |
| `/aviation`         | Aviation services overview & proof              |
| `/services`         | Full capability catalogue                       |
| `/projects`         | Portfolio / case studies                        |
| `/before-after`     | Visual proof of results                         |
| `/process`          | How the mobile service works                    |
| `/about`            | Company story & credibility                     |
| `/gallery`          | Curated imagery                                 |
| `/blog`             | Education & SEO                                 |
| `/schedule-visit`   | Book an on-site visit                           |
| `/estimate-request` | Request a quote                                 |
| `/contact`          | General contact                                 |

## Calls to action

Two primary conversions everywhere: **Request an Estimate** and **Schedule a
Visit**. Keep CTA language consistent and outcome-oriented.

## Media guidelines

- High-end, real project photography; consistent color grade matching the dark
  brand. Always `next/image`, explicit dimensions, descriptive `alt` text (a11y +
  SEO).
- Before/after pairs are core proof; store as a typed pair to guarantee labeling.
