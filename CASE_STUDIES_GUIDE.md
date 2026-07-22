# Case Studies Guide

How BCS presents project results on the public website without overclaiming,
leaking sensitive details, or inventing social proof.

Related: [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md),
[`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md),
[`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md),
[`SEO_STRATEGY.md`](./SEO_STRATEGY.md).

## Purpose

Case studies and project entries exist to help qualified buyers **evaluate
craftsmanship and fit**. They are not a CRM, not an invoice archive, and not a
place for prices.

Primary surfaces:

- Homepage before/after teaser
- `/projects`
- Optional `/before-after`
- Division pages (featured excerpts)

## Truthfulness rules

1. Only publish work BCS actually performed (or clearly co-performed with
   permission).
2. No fake reviews, star ratings, or invented testimonials.
3. No fabricated metrics (“200+ yachts”, “#1 in Florida”) unless verified and
   approved.
4. Placeholders for missing media must be labeled as such in docs and alt text —
   never dressed up as real results.
5. Never show prices, invoice amounts, or insurance settlement figures.

## Suggested content model

```ts
Project {
  id: string
  slug: string
  title: string
  division: 'marine' | 'aviation'
  summary: string          // 1–3 sentences, outcome-focused
  location?: string        // city/region only unless client approves more
  services: string[]       // slugs from config/services.ts
  media: MediaAsset[]
  beforeAfter?: BeforeAfterPair[]
  featured?: boolean
  published: boolean
  seoDescription?: string
}
```

Keep entries in typed content modules so `/projects`, homepage teasers, and
structured data stay consistent.

## Narrative structure (per project)

| Block | Guidance |
|-------|----------|
| Title | Asset type + work type (e.g. “Gelcoat restoration — express cruiser”) |
| Context | One line on setting (marina, hangar, mobile) without sensitive identifiers |
| Challenge | What was wrong or needed (cosmetic damage, oxidation, spot repair) |
| Approach | High-level method — not a proprietary process dump |
| Result | Visible outcome; optional before/after |
| Services tagged | Link to catalogue entries |

Avoid long blog essays in v1; clarity beats volume.

## Privacy & permissions

- Prefer non-identifying titles (“52' motor yacht”) over vessel/aircraft names
  unless the owner approves.
- Blur or crop registration marks, people, and documents when needed.
- Airside / secure facility shots require explicit clearance.
- Maintain an internal permission note (not necessarily public) before
  `published: true`.

## Division balance

Aim for a portfolio that does not erase Aviation or Marine. If one division has
fewer approved assets at launch:

- Feature what is real.
- Do not pad with stock.
- Use honest copy on the thinner division page (“Selected work — more photography
  coming soon”) rather than fake depth.

## Before & after presentation

- Follow matching rules in [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md).
- Slider or side-by-side both acceptable; keyboard accessible; labels for each
  state.
- Do not autoplay misleading transitions that exaggerate change.

## SEO

- Unique title/description per project detail route if/when detail pages ship.
- Image `alt` describes the work outcome.
- Optional `ImageObject` / project-related structured data later; do not spam
  schema.
- Locale: EN/ES project copy when available; do not duplicate-index identical
  thin pages.

## Editorial workflow

1. Owner selects candidate jobs and grants permission.
2. Photos processed per photography guide.
3. Draft entry in content module (English; Spanish when reviewed).
4. Legal/privacy sanity check for identifiable assets.
5. `published: true` → appears in grids and sitemap (if detail URLs exist).

## Launch minimum

- Homepage teaser: at least one real pair **or** a clearly documented
  placeholder state approved by the owner.
- `/projects`: grid ready for real entries; empty/honest state if assets are
  pending — never fake cards.

## Out of scope for v1 case studies

- Downloadable PDF reports
- Client login to see private jobs (portal — future)
- Live Instagram scraping as the portfolio source of truth
