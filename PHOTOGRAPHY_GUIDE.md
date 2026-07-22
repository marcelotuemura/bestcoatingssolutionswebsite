# Photography Guide

Complete photography and motion-media standard for Best Coatings Solutions.
This is not a short “media requirements” list — it is the rulebook so the brand
still looks coherent years from now.

Related: [`BRAND_GUIDE.md`](./BRAND_GUIDE.md), [`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md),
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md), [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md).

## Principles

1. **Real work only.** No stock implying BCS did the job. Placeholders must be
   documented and labeled until replaced.
2. **Emotion + craft.** Images should make a captain or owner feel relief and
   desire — quiet luxury, precision, protected assets.
3. **Brand grade.** Cool-neutral grade on navy/silver/electric UI; avoid heavy
   orange warmth and oversaturated tourist blues.
4. **Permission first.** Owner/captain/FBO clearance before publishing
   identifiable vessels, aircraft, people, or locations.
5. **Safety & legality.** No unauthorized airside ops imagery; no readable
   personal data, documents, or security credentials.

## Shot catalogue (required vocabulary)

Every major campaign or case study should pull from this vocabulary. Not every
project needs every shot — but naming stays consistent in folders and metadata.

### Aerial / context

| Type | Purpose | Notes |
|------|---------|-------|
| **Drone** | Sense of place, yacht in marina, facility context | Follow local drone law; no reckless low passes over people |
| **Exterior wide** | Asset in environment | Keep horizon level; avoid chaotic backgrounds for heroes |
| **Waterline** | Marine truth — hull meet water | Reflections, fairness, boot stripe, repair zones |
| **Night** | Premium atmosphere | Controlled light; no noisy underexposure as “moody” |

### Craft & detail

| Type | Purpose | Notes |
|------|---------|-------|
| **Macro** | Texture of finish | Sharp plane of focus; show quality |
| **Gelcoat close-up** | Color match, gloss, orange peel control | Polarizer optional to manage glare intentionally |
| **Reflection shots** | Luxury read — sky/water in gloss | Hero-capable; pair with navy UI |
| **Interior** | Cabins, panels, aviation interior components | Tidy staging; accurate white balance |
| **Painter working** | Human craft (trust) | Respect PPE; faces optional with consent; avoid staged cheesiness |

### Narrative / proof

| Type | Purpose | Notes |
|------|---------|-------|
| **Before** | Problem state | Match framing to After |
| **After** | Result state | Same angle, lens, light as Before whenever possible |
| **Process mid** | Fairing, masking, spray, sanding | Supports case-study “Process” chapter |
| **Timelapse** | Transformation over time | Stable tripod/interval; short web export |
| **Video** | Atmosphere or process | Muted by default on web; poster frame required |

### Social & product crops

| Type | Aspect / use |
|------|----------------|
| **Horizontal** | Site heroes, case study headers, YouTube-style (16:9) |
| **Vertical** | Instagram Stories/Reels, TikTok-ready future (9:16) |
| **Instagram feed** | 1:1 or 4:5 preferred for brand grid |
| **Thumbnail** | 1:1 or 4:3 for project grids; readable at 160px width |
| **OG / social preview** | 1200×630 (or site standard) brand-safe still |

Tag each asset with intended `usage`: `hero` | `case` | `detail` | `social` |
`og` | `thumb`.

## Before & After protocol

1. Lock camera position (tape marks / tripod).  
2. Match focal length, aperture intent, white balance.  
3. Shoot Before; perform work; shoot After.  
4. Export pair with identical crop aspect.  
5. Store as typed `BeforeAfterPair` — UI must never orphan one side.  
6. Do not “enhance” After more than Before in grading in a way that fakes the
   repair.

## Division guidance

### Marine

Prioritize waterline, gelcoat macro, reflection, dockside mobile context, drone
when permitted. Avoid junkyard chaos as homepage hero unless the story is
explicitly process-grit (secondary pages only).

### Aviation

Hangar/partner-facility exteriors and interiors, composite/paint detail,
metallic and ceramic protection close-ups. Never imply unauthorized ramp work.

## Technical delivery

| Spec | Standard |
|------|----------|
| Masters | High-res JPEG or lossless; archive outside `public/` |
| Web | `next/image` → AVIF/WebP; explicit dimensions |
| Hero | Enough res for 2× large viewports; still preferred for LCP |
| Video | Short, compressed, poster required; lazy; no autoplay audio |
| Timelapse | ≤15–30s web cut unless story needs more |
| Color space | sRGB for web |
| Naming | `division-subject-shottype-state.ext` e.g. `marine-hull-waterline-after.jpg` |
| Alt text | Outcome + context; never “IMG_2034” |

## Instagram & social pipeline

- Shoot with vertical and horizontal in mind when on-site (one extra frame costs
  little; reshooting costs a lot).
- Maintain a brand grid: dark, glossy, sparse text overlays.
- Site may deep-link to Instagram/Facebook; do not depend on live API embeds for
  launch.
- TikTok and others: prepare vertical masters; enable channels in config later
  ([`FUTURE.md`](./FUTURE.md)).

## Homepage media rules

- Full-bleed hero plane; no inset cards in the first viewport.
- No badges/stickers on hero media.
- Prefer stills + SVG silhouettes + CSS atmosphere over heavy video.
- Provide reduced-motion static frames for every motion-enhanced image.

## Metadata model (engineering)

Typed structures for:

- Project photos  
- Before/after pairs  
- Videos  
- Timelapses  
- Marine projects  
- Aviation projects  
- Social crops / thumbnails  

Include: `id`, `src`, `alt`, `width`, `height`, `type`, `shotType`, `division`,
`orientation`, `usage[]`, optional `credit`, `takenAt`, `permissionRef`.

## On-site shoot checklist (print/save)

- [ ] Permissions confirmed  
- [ ] Before locked  
- [ ] Process mid (optional but valuable)  
- [ ] After matched  
- [ ] Macro / gelcoat / reflection  
- [ ] Context wide or drone (if allowed)  
- [ ] Painter working (optional)  
- [ ] Vertical social frame  
- [ ] Horizontal hero frame  
- [ ] Thumbnail-safe crop mentally noted  
- [ ] Night only if lighting supports quality  

## Owner asset checklist (P0 launch)

Document outstanding items in `docs/assets/` until delivered:

- [ ] Logo masters (SVG/PNG)  
- [ ] Favicons / app icons  
- [ ] Default OG image  
- [ ] Homepage marine hero (or silhouette source)  
- [ ] Homepage aviation hero (or silhouette source)  
- [ ] ≥1 featured case study set (before/after + process + result)  
- [ ] ≥3 matched before/after pairs  
- [ ] ≥6 project images mixed divisions if possible  
- [ ] Optional timelapse / process clip  
- [ ] Instagram + Facebook profile URLs  

## Forbidden

- Fake or misattributed work  
- Prices, invoices, or claim amounts visible in frame  
- Unoptimized multi‑MB heroes that break the performance budget  
- Third-party watermarks in production  
- Deceptive grading that invents a repair  

## Longevity

Two years from now, a new photographer should read this file and match BCS
without inventing a new visual dialect. When adding a shot type, update this
catalogue first — then the content model.
