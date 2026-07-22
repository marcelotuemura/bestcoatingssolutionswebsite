# Case Studies Guide

Project showcase on the BCS site is **case studies**, not a shallow photo dump
labeled “Projects.” Each published job is a persuasive story that moves visitors
from curiosity to trust ([`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md)).

Route label in the UI may still say “Projects” for brevity; the **content model
and page design are case studies**. Prefer `/projects` as the index URL unless
product later renames to `/case-studies` (keep redirects if renamed).

Related: [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md), [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md),
[`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md), [`SEO_STRATEGY.md`](./SEO_STRATEGY.md).

## Why stories beat galleries

Captains and owners buy confidence. A story answers:

- What was wrong?
- What did BCS do?
- How careful was the process?
- What did it look like after?
- How long did it take?
- Can I trust them with my asset?

A grid of unlabeled gloss photos cannot.

## Story structure (required chapters)

Every case study uses this narrative spine:

| Chapter | Intent | Guidance |
|---------|--------|----------|
| **Problem** | Empathy | Damage, oxidation, mismatch, wear — factual, not dramatic clickbait |
| **Repair** | Scope | What BCS was engaged to fix (services tagged from `config/services.ts`) |
| **Process** | Craft & care | High-level steps; mobile/dock/hangar context; no proprietary dump |
| **Photos** | Proof | Mix of context, macro, process, reflection per photography guide |
| **Time** | Expectations | Duration or range when accurate (“three days on-site”); never invent |
| **Result** | Outcome | Finish quality, readiness, protection — visible in After shots |
| **Customer** | Social proof | Role only by default (“yacht manager”, “aircraft owner”); name/company **only with written permission** |

Optional chapters: challenges (weather, access), materials, division-specific notes.

## Homepage featured project

The homepage **Featured Project** section teases **one** case study:

- One strong After (or Before/After pair)
- One-line Problem → Result
- CTA into the full case study

Do not stack three weak teasers — one memorable story beats noise.

## Content model

```ts
CaseStudy {
  id: string
  slug: string
  title: string
  division: 'marine' | 'aviation'
  problem: string
  repair: string
  process: string
  time?: string
  result: string
  customer?: {
    label: string           // “Yacht captain”, “FBO partner”
    name?: string           // only if permitted
    attributionPermitted: boolean
  }
  location?: string         // city/region; avoid exact berth/hangar IDs
  services: string[]        // service slugs
  photos: MediaAsset[]
  beforeAfter?: BeforeAfterPair[]
  video?: MediaAsset[]
  timelapse?: MediaAsset[]
  featured?: boolean
  published: boolean
  seoDescription?: string
}
```

Index page: curated cards with Problem one-liner + After thumbnail.  
Detail page: full chapter sequence, media, CTAs (Estimate / Schedule).

## Truthfulness & privacy

1. Only real BCS work (or clearly disclosed collaboration).  
2. No fake reviews, stars, or invented metrics.  
3. No prices or insurance figures.  
4. Blur registrations/people/documents when needed.  
5. `published: true` only after permission sanity check.  
6. Placeholders labeled — never cosplay as finished case studies.

## Division balance

Do not erase Marine or Aviation. If one side has fewer approved stories at
launch, publish what is real and say more photography is coming — never pad with
stock.

## Interaction patterns

- Before/After: accessible slider on detail + homepage teaser rules in
  [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md).
- Galleries: keyboard operable; no hover-only captions on touch.
- Video/timelapse: user-initiated play preferred; muted autoplay only if tiny and
  non-essential.

## SEO

- Unique title/description per case study detail.  
- `alt` describes outcome and chapter context.  
- EN/ES when copy exists; no thin duplicate locales.  
- Sitemap includes published case studies only.

## Editorial workflow

1. Select job + permissions.  
2. Shoot per [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md).  
3. Draft seven chapters (EN; ES when reviewed).  
4. Privacy pass.  
5. Publish → index, sitemap, optional homepage feature.

## Launch minimum

- Homepage: one featured story **or** an owner-approved honest empty/placeholder
  state.
- `/projects`: case-study index ready; empty state truthful if assets pending.
- At least one complete seven-chapter study before calling proof “done.”

## Naming in navigation

| Surface | Preferred label |
|---------|-----------------|
| Primary nav | Projects *(or Case Studies if approved)* |
| Homepage section | Featured Project |
| Detail H1 | Case study title |
| Docs / CMS | Case study |

## Out of scope (v1)

- Private client galleries behind login (portal — [`FUTURE.md`](./FUTURE.md))  
- PDF report downloads  
- Live Instagram as source of truth  
- Fake “200 projects completed” counters without verification  
