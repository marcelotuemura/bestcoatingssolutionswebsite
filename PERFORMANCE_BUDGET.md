# Performance Budget

Performance is a launch requirement for the BCS marketing site: mobile-first,
Server Components by default, animation only on the homepage, and no layout
shift from media or motion.

Related: [`DEPLOYMENT.md`](./DEPLOYMENT.md),
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md),
[`ACCESSIBILITY.md`](./ACCESSIBILITY.md),
[`SEO_STRATEGY.md`](./SEO_STRATEGY.md).

## Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Lighthouse Performance (mobile) | **90+** where practical | Home + key templates |
| LCP | < 2.5s | Mid-tier mobile, production or preview |
| CLS | < 0.1 | Explicit image dimensions; reserved space |
| INP | < 200ms | Limit client JS; defer non-critical work |
| TTFB | Keep low via static/ISR where possible | Vercel edge |

Accessibility and SEO audits are separate gates but often move with performance
(contrast, semantics, metadata do not excuse a heavy bundle).

## JavaScript budget

| Surface | Policy |
|---------|--------|
| Default | React **Server Components** — zero client JS unless required |
| Homepage | Client islands only for Framer Motion / division interaction |
| Other routes | **No** page-level animation libraries |
| Forms | Client only for RHF interaction; server actions for submit |
| Analytics | Prefer Vercel Analytics already wired; no extra heavy tags without approval |

Framer Motion must ship as a **runtime dependency** when the homepage is
implemented (not only a devDependency).

**Soft budget (guidance):** keep homepage hydrated JS lean; treat unexpected
growth in client chunks as a PR blocker if Lighthouse regresses below target
without justification.

## Asset budget

| Asset | Guidance |
|-------|----------|
| LCP image | One prioritized `next/image` (or logo SVG); no video as LCP |
| Images | AVIF/WebP; `sizes` set; lazy below fold |
| Hero video (if any) | Short, compressed, optional enhancement — never required for content |
| Fonts | `next/font` with `display: swap`; subset Latin (+ required Spanish glyphs) |
| Icons | Inline SVG or minimal set; no mega icon packs |

## Animation budget

- Homepage only; see [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md).
- Motion must not block content paint or trap focus.
- `prefers-reduced-motion: reduce` → static equivalent, same information.
- No scroll-jacking; smooth scroll disabled under reduced motion (globals).

## Layout stability

- Width/height (or aspect-ratio boxes) for all images and embeds.
- Skeletons/reserves for form status regions if they push content.
- Avoid inserting late-loading banners above existing content.

## Caching & rendering

- Marketing pages: static where possible.
- Sitemap/robots: generated, cheap.
- Forms: dynamic POST via server actions; success UI local.
- `NEXT_PUBLIC_SITE_URL` correct per environment so OG/canonical work without
  client fix-ups.

## Measurement process

Before marking Phase 2+ complete and before production approval:

1. `pnpm build` and serve production locally or use Vercel preview.
2. Lighthouse mobile on `/`, a division page, and a form page.
3. Confirm LCP element is intentional.
4. Spot-check throttling (Slow 4G) on homepage hero.
5. Re-run with reduced-motion enabled (OS setting).

Record scores in the PR description when claiming a phase complete.

## Anti-patterns (reject in review)

- WebGL / large 3D heroes
- Autoplay full-bleed HD video backgrounds
- Animation libraries imported from the root layout for all routes
- Unsized images or CSS that shifts on font load
- Duplicate analytics/GTM stacks
- Client-side fetching for static marketing copy

## Relationship to quality gates

Every phase still requires:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Performance budget checks are **additional** for homepage and launch (Phase 2,
Phase 6, Phase 7). A green unit suite does not waive a failed LCP/CLS on the
hero.

## When to break a target

Only with explicit product approval (e.g. a temporary media placeholder that is
oversized). Document the exception, the expiry condition, and the follow-up
task. Default is: **fix within budget**.
