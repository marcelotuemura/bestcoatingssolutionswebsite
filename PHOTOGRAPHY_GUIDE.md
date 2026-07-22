# Photography Guide

Standards for stills, video, and before/after media on the BCS public website.
Photography is a primary credibility asset — treat it as product, not decoration.

Related: [`BRAND_GUIDE.md`](./BRAND_GUIDE.md),
[`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md),
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md),
[`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md).

## Principles

1. **Real work only.** No stock that implies BCS completed the job. Placeholders
   must be explicitly documented and visually/alt-text labeled until replaced.
2. **High-end atmosphere.** Quiet luxury, technical craft, clean environments —
   marinas, decks, hangars, controlled work zones.
3. **Brand-aligned grade.** Cool-neutral balance that sits on navy / silver /
   electric UI; avoid heavy orange warm filters and oversaturated blues.
4. **Respect privacy & permits.** No readable personal data, security badges, or
   restricted airside details without clearance. Obtain owner/captain/FBO
   permission before publishing identifiable vessels or aircraft.

## Subject matter by division

### Marine

- Fiberglass / gelcoat / paint / metallic / ceramic results.
- Mobile work context: dockside, boatyard, trailer, residential where tasteful.
- Details: fairing, color match, gloss reflection, hardware adjacency.
- Avoid cluttered yards as hero subjects unless storytelling needs process grit
  (then keep it secondary, not homepage hero).

### Aviation

- Spot repair, refinishing, composite, metallic, ceramic protection, interior
  components where allowed.
- Hangar or partner-facility context; emphasize care and precision.
- Never imply unauthorized ramp operations.

## Shot types

| Type | Use | Notes |
|------|-----|-------|
| Hero / atmosphere | Homepage full-bleed plane | Edge-to-edge; silhouette or premium still; not an inset card |
| Detail macro | Services / case studies | Finish quality, edge work, reflections |
| Context wide | About / process / mobile advantage | Team or setup without cluttered branding overload |
| Before / after | Homepage teaser, `/before-after`, projects | Matched framing (see below) |
| Process / time-lapse | Optional proof | Short, optimized; never autoplay sound |

## Before & after standards

- Same angle, focal length, framing, and lighting conditions as far as practical.
- Identical crop aspect for pairs in UI.
- Label clearly; do not imply a longer scope of work than shown.
- Store as a typed `BeforeAfterPair` so UI cannot orphan one side.

## Technical delivery specs

| Spec | Guidance |
|------|----------|
| Master files | High-resolution JPEG or lossless; keep masters off the web root |
| Web derivatives | AVIF/WebP via `next/image`; explicit width/height |
| Hero stills | Enough resolution for 2x large viewports; prioritize LCP candidate |
| Thumbnails | Consistent aspect per collection (e.g. 4:3 projects, 16:9 heroes) |
| Video | Short, compressed; poster frame required; lazy load; no autoplay audio |
| Alt text | Describe the work outcome and context; never “image1” |
| Filename | Stable slugs: `marine-gelcoat-foredeck-after.jpg` |

## Homepage media rules

- Dominant visual plane only — full bleed / background treatment.
- No floating stickers, badges, or info chips on top of hero media.
- Prefer stills or SVG silhouettes over heavy video backgrounds.
- Provide a reduced-motion static frame equivalent.

## Social & OG

- Default Open Graph / social preview image: brand-safe still or logo lockup on
  navy (placeholder until final asset).
- Social feed embeds are optional later; do not hard-depend on Instagram API for
  launch.

## Typed content structures (engineering)

Prepare TypeScript models for:

- Project photos
- Before/after pairs
- Videos
- Time-lapses
- Marine projects
- Aviation projects

Keep media metadata in content modules (`config/` / `content/`), not hard-coded
in JSX.

## Owner asset checklist (P0)

Document outstanding real assets in `docs/assets/` until delivered:

- [ ] Logo SVG/PNG (light/dark as needed)
- [ ] Favicon / app icons
- [ ] Default OG image
- [ ] Homepage marine hero still or silhouette source
- [ ] Homepage aviation hero still or silhouette source
- [ ] ≥6 project photos (mixed divisions preferred)
- [ ] ≥3 matched before/after pairs
- [ ] Optional process clip / time-lapse

## Forbidden

- Fake project photography or misattributed work.
- Watermarks from unrelated vendors in production.
- Unoptimized multi‑MB heroes that break the performance budget.
- Prices, quote amounts, or insurance claim data visible in frame.
