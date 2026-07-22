# Performance Budget

Measurable performance and quality goals for the BCS public website. Emotion on
the homepage is required; failing scores are not an acceptable trade.

Related: [`DEPLOYMENT.md`](./DEPLOYMENT.md), [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md),
[`ACCESSIBILITY.md`](./ACCESSIBILITY.md), [`SEO_STRATEGY.md`](./SEO_STRATEGY.md).

## Lighthouse targets (mobile, production or PR preview)

| Category | Target | Gate |
|----------|--------|------|
| **Performance** | **95+** | Must justify any score below 95 in the PR; below 90 is a blocker |
| **Accessibility** | **100** | Blocker if under 100 |
| **Best Practices** | **100** | Blocker if under 100 |
| **SEO** | **100** | Blocker if under 100 |

Run Lighthouse on:

1. Homepage `/` (or `/en`)  
2. One division page (e.g. `/marine`)  
3. One form page (e.g. `/estimate-request`)  

Record scores in the PR when claiming Phase 2+ or launch readiness.

## Core Web Vitals

| Metric | Target |
|--------|--------|
| LCP | < 2.5s (prefer < 2.0s on homepage LCP element) |
| CLS | < 0.1 |
| INP | < 200ms |
| TTFB | Keep low via static/ISR where possible |

## JavaScript budget

| Surface | Policy |
|---------|--------|
| Default | Server Components — no client JS unless required |
| Homepage | Client islands only for motion, parallax (desktop), before/after slider |
| Other routes | No page-level animation libraries |
| Forms | Client for RHF; submit via Server Actions |
| Analytics | Vercel Analytics; no extra heavy tag managers without approval |

Move Framer Motion to a **runtime dependency** when homepage motion ships.

Treat unexpected client-chunk growth as a review issue if Lighthouse Performance
drops below **95** without an approved exception.

## Asset budget

| Asset | Guidance |
|-------|----------|
| LCP | Prioritized still or SVG logo lockup — **not** video |
| Images | `next/image`, AVIF/WebP, explicit dimensions, lazy below fold |
| Hero video | Optional enhancement only; never required to understand content |
| Fonts | `next/font`, `display: swap`, subset for EN/ES |
| Icons | Inline SVG / minimal set |

## Animation budget

- Premium motion: homepage only ([`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md)).
- Transform/opacity preferred; no layout-thrashing animation.
- `prefers-reduced-motion: reduce` → static equivalents; same information.
- No scroll-jacking; no blocking multi-second load screens.

## Layout stability

- Width/height or aspect-ratio boxes for media and embeds.
- Reserve space for form status messages.
- No late-loading banners inserting above content.

## Anti-patterns (reject)

- WebGL / large 3D heroes  
- Autoplay full-bleed HD video backgrounds  
- Animation libraries in the root layout for all routes  
- Unsized images  
- Duplicate analytics stacks  
- Client fetching for static marketing copy  

## Measurement process

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Then production-mode Lighthouse (local `pnpm start` or Vercel preview), plus
Playwright for navigation/forms. Reduced-motion OS setting spot-check on home.

## Exceptions

Only with explicit product approval, written expiry, and a follow-up task.
Default: **hit the table** — Performance 95+, Accessibility 100, Best Practices
100, SEO 100.
