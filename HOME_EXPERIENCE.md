# Home Experience

The homepage is the **only** animated surface in the first release. Every other
route is static, fast, and content-first. This document is the implementation
contract for `/` (and its locale variants).

Related: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md), [`BRAND_GUIDE.md`](./BRAND_GUIDE.md),
[`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md), [`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md).

## Intent

In one continuous composition, the visitor should:

1. Recognize **Best Coatings Solutions** as a premium marine & aviation specialist.
2. Understand the two divisions and the mobile-service model.
3. See credible proof (process + before/after), not hype.
4. Take a clear next step: **Request an estimate** or **Schedule a visit**.

The first viewport must read as **one brand composition**, not a dashboard of
cards, stats, or promo chips.

## First-viewport hero budget

Allowed in the first viewport:

- Brand / BCS logo (hero-level signal)
- One headline
- One short supporting sentence
- One CTA group (Estimate + Schedule)
- One dominant visual plane (edge-to-edge atmosphere + silhouette / imagery)

**Not** in the first viewport: stats strips, schedules, address blocks, secondary
promos, floating badges, overlays on hero media, or card grids.

## Section order (required)

| #  | Section                    | Purpose                                      | Motion                         |
| -- | -------------------------- | -------------------------------------------- | ------------------------------ |
| 1  | Animated hero              | Brand reveal + primary CTAs                  | Premium (see sequence below)   |
| 2  | Marine & Aviation          | Division selection into `/marine`, `/aviation` | Subtle entrance / crossfade  |
| 3  | Core services              | Capability snapshot (from `config/services`) | Light stagger on scroll        |
| 4  | Mobile service advantage   | We come to the vessel / aircraft             | Static or fade                 |
| 5  | Before & after             | Visual proof teaser → projects / before-after | Static pair or soft wipe     |
| 6  | Process                    | How engagement works (discover → finish)     | Static                         |
| 7  | Service area               | South Florida / Jupiter southward + travel   | Static                         |
| 8  | Languages spoken           | English, Spanish, Portuguese, Japanese       | Static                         |
| 9  | Estimate & scheduling CTAs  | Conversion reinforcement                     | Static                         |
| 10 | Social links               | Instagram, Facebook (TikTok prepared)        | Static                         |
| 11 | Contact information        | Phone, email, area                           | Static                         |
| 12 | Footer                     | Shared site footer                           | None                           |

One job per section: one headline, usually one short supporting sentence.

## Hero animation sequence

Lightweight techniques only: CSS, SVG, Framer Motion, optimized stills / short
clips. **No** custom 3D, large WebGL scenes, or heavy looping video backgrounds.

Suggested timeline (~4–6s, interruptible by scroll or reduced motion):

1. **Atmosphere** — dark navy field with subtle ocean / reflective texture.
2. **Logo reveal** — BCS mark path or mask reveal; electric-blue light sweep.
3. **Marine beat** — yacht silhouette or premium marine still (full-bleed plane).
4. **Aviation transition** — soft crossfade / silhouette shift to aircraft.
5. **Lockup** — brand + headline + sentence + CTA group.

Scroll transitions between sections may use restrained fade/slide. Motion must
never block content or delay LCP.

## Reduced motion

When `prefers-reduced-motion: reduce`:

- Skip the timed sequence; show a static hero (logo, copy, CTAs, still imagery).
- Disable autoplay motion and scroll-linked ornamentation.
- Keep focus order and CTAs identical to the animated path.

Motion tokens and variants live in `animations/` so static pages never import
homepage motion code.

## Technical constraints

- Server Components by default; client boundaries only for motion / interaction.
- LCP candidate: prioritized still (logo lockup or hero image), not a video.
- Images via `next/image` with explicit dimensions; lazy-load below the fold.
- Respect [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md).

## Copy & policy guardrails on the homepage

- Never display prices.
- Do **not** claim all estimates are free. Free estimates are available only in
  the Fort Lauderdale area; other locations may require review or travel
  arrangements.
- No fake reviews or fabricated project claims.
- Social: Instagram and Facebook live when URLs exist; TikTok and future channels
  may appear in types / config as disabled until approved.

## Definition of done

- All twelve sections present in order, mobile-first.
- Hero passes the brand test (remove nav → still unmistakably BCS).
- Reduced-motion path verified.
- Primary CTAs reach `/estimate-request` and `/schedule-visit` (locale-aware).
- Quality gates green; homepage Playwright smoke covers load, CTAs, and
  reduced-motion.
