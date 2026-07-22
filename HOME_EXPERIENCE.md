# Home Experience

The homepage is the **only** animated surface in the first release. Its job is not
to list features — it is to create a **WOW** moment, then guide emotion into
trust and action.

Customers do not buy technical excellence alone. They buy how BCS makes them
**feel**: impressed, safe, understood, and ready to request work.

Related: [`BRAND_GUIDE.md`](./BRAND_GUIDE.md), [`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md),
[`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md), [`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md).

## Emotional arc

```
Awe (hero) → Clarity (who we are) → Desire (Marine / Aviation)
  → Trust (Why BCS) → Proof (featured project + before/after)
  → Confidence (process + area) → Action (estimate) → Continuity (portal tease + footer)
```

Every section and every motion exists to support that arc. If an animation does
not serve emotion or clarity, cut it.

## First-viewport hero budget

Allowed:

- BCS brand / logo at **hero level** (not a nav-only mark)
- One headline
- One short supporting sentence
- One CTA group (Request estimate + Schedule visit)
- One dominant full-bleed visual plane (atmosphere + silhouette / imagery)

Not allowed in the first viewport: stats strips, card grids, floating badges,
promo chips, address blocks, or secondary marketing modules.

**Brand test:** remove the nav — the viewport must still feel unmistakably BCS.

## Homepage section order (story flow)

| #  | Section | Emotional job | Primary content |
| -- | ------- | ------------- | --------------- |
| 1  | **Hero** | Awe / WOW | Logo reveal, light, atmosphere, CTAs |
| 2  | **Who We Are** | Orientation | Premium mobile marine & aviation specialist |
| 3  | **Marine** | Desire (boats) | Division story + link to `/marine` |
| 4  | **Aviation** | Desire (aircraft) | Division story + link to `/aviation` |
| 5  | **Why BCS** | Trust | Real trust pillars — not fake reviews |
| 6  | **Featured Project** | Proof | One case-study story teaser |
| 7  | **Before & After** | Proof (visual) | Interactive slider (accessible) |
| 8  | **Our Process** | Confidence | Clear steps from contact → finish |
| 9  | **Service Area** | Fit | Jupiter southward; travel by arrangement |
| 10 | **Request Estimate** | Action | Strong CTA + Fort Lauderdale free-estimate policy |
| 11 | **Portal preview** | Modern continuity | “Coming Soon” dashboard mock — not a real portal |
| 12 | **Footer** | Closure | Contact, social, legal, languages spoken cue |

Languages spoken (EN / ES / PT / JA) and social links may live in Who We Are,
Why BCS, and/or Footer — do not invent a cluttered extra section if the story
already covers them.

Phone and contact strip belong in header/footer and the estimate section; do not
break the emotional arc with a redundant mid-page contact dump.

## Trust pillars (Why BCS)

Real reasons to trust — **never fabricated reviews**:

- Mobile Service
- Professional Finish
- Marine Specialists
- Aircraft Specialists
- Modern Equipment
- Fair Pricing *(message value/clarity — **never show prices**)*
- Fast Response
- Attention to Detail
- Multilingual Team

Present as a refined grid or horizontal statement set — premium, not icon soup.

## Portal preview (“Coming Soon”)

Even though the customer portal is **not** built in v1, the homepage may include
**one** restrained preview panel that signals BCS invests in modern operations:

- Label: **Coming Soon — Customer Portal**
- Capabilities teased (copy only / static UI mock):
  - Track your project
  - View invoices
  - Approve estimates
  - Photos
  - Timeline
  - Payments
- Single composed image or lightweight CSS mock — not a working app shell
- No login, no fake data that looks like a live account
- Optional only if approved; omit entirely if brand prefers silence on portal

See [`FUTURE.md`](./FUTURE.md) for the real portal scope later.

---

## Animation catalogue (implementers must follow)

Centralize variants in `animations/`. Homepage-only imports. Honour
`prefers-reduced-motion: reduce` with a static equivalent for every effect.

### A. Logo animation

- **Intent:** Brand arrives with precision — the WOW open.
- **Technique:** SVG path draw and/or mask reveal of the BCS mark; settle into
  lockup with short overshoot ≤ 1.05 then rest.
- **Duration:** ~1.2–1.8s; easing premium (ease-out / custom cubic).
- **Reduced motion:** Instant final lockup, no path draw.

### B. Light sweep

- **Intent:** Electric-blue craftsmanship cue (coatings / reflection).
- **Technique:** CSS or Motion gradient/glare translating across logo or hero
  plane once (or very rarely on idle — never strobing).
- **Color:** `electric-400` / `electric-500` at low opacity over navy.
- **Reduced motion:** Omit sweep; keep static highlight if needed for legibility.

### C. Ocean / reflective texture

- **Intent:** Marine atmosphere without heavy video.
- **Technique:** Subtle CSS noise / soft caustic gradient / lightweight looping
  still treatment; optional very short muted WebM only if it beats CSS **and**
  stays in budget.
- **Avoid:** Full-bleed HD video loops, WebGL oceans, 3D water.
- **Reduced motion:** Static graded still.

### D. Glass effects

- **Intent:** Luxury depth (Apple-adjacent), used sparingly.
- **Technique:** Translucent surfaces (`navy` + alpha), light blur, hairline
  border `navy-700` / silver.
- **Where:** Division panels, trust module, portal preview — **not** on every
  block.
- **Perf:** Prefer pre-blurred assets over huge live `backdrop-filter` regions on
  mobile if CLS/LCP suffer.

### E. Marine → Aviation transition

- **Intent:** Dual-expertise story in one beat.
- **Technique:** Crossfade or silhouette morph between yacht and aircraft visual
  planes; optional soft horizontal wipe with electric accent line.
- **Timing:** Part of hero sequence or Who We Are → division handoff.
- **Reduced motion:** Static dual mark or simple side-by-side without morph.

### F. Section transitions

- **Intent:** Continuity while scrolling — not scroll-jacking.
- **Technique:** Fade / slight Y translate (8–24px) on enter; optional gentle
  parallax on background planes only.
- **Rules:** Transform/opacity only; no layout-affecting top animations; do not
  delay content readability.
- **Reduced motion:** Sections appear static at rest positions.

### G. Button hover / press

- **Intent:** Tactile premium CTAs.
- **Technique:** Color shift `electric-500` → `electric-400`, 1px lift or soft
  glow ≤ subtle; press scale ~0.98.
- **Keyboard:** Visible focus ring always (`electric-500`); hover styles must not
  be the only affordance.
- **Touch:** No hover-dependent discovery; use `:active` feedback.

### H. Card hover

- **Intent:** Division / trust / project tiles feel alive when cards are used.
- **Rule:** Cards only when they containerize interaction or navigation — default
  is **no cards** (see brand guide).
- **Technique:** Border brighten, slight translate, image subtle scale 1.02
  inside overflow-hidden.
- **Reduced motion:** Color/border change only.

### I. Image reveal

- **Intent:** Photography feels curated, not dumped.
- **Technique:** Clip-path wipe, opacity + scale from 1.04 → 1, or mask reveal
  on scroll into view (once).
- **Must:** Explicit width/height to protect CLS.
- **Reduced motion:** Instant opacity 1.

### J. Before / After slider

- **Intent:** Proof you can feel.
- **Technique:** Accessible range input or pointer-drag divider; keyboard
  operable; aria labels for Before/After.
- **Motion:** Divider moves with input; images do not animate independently in a
  misleading way.
- **Reduced motion:** Static side-by-side or slider without animated autoplay.

### K. Mouse parallax

- **Intent:** Depth in hero / featured project only.
- **Technique:** Low amplitude (2–8px) on silhouette or light layer; pointer
  move; ignore on touch devices.
- **Cap:** One parallax context max on the page.
- **Reduced motion / touch:** Off.

### L. Loading animation

- **Intent:** First paint feels intentional if a brief brand intro is used.
- **Technique:** Optional ≤1.5s logo + light sweep splash **only if** it does
  not delay LCP content; prefer integrating reveal into hero instead of a
  blocking splash.
- **Never:** Multi-second forced gate, sound, or progress bar theater.
- **Reduced motion:** Skip intro; show final hero.

### M. Featured project / case teaser

- **Intent:** Story magnetism before the full case studies index.
- **Technique:** Image reveal + staggered text (problem → result line).
- **CTA:** “View case study” / “See projects”.

### N. Portal preview entrance

- **Intent:** Quiet futurism — BCS is building.
- **Technique:** Soft fade/slide of a single mock frame; no fake cursors typing.
- **Reduced motion:** Static mock.

---

## Hero timing (default, interruptible)

Approximate 4–6s sequence if the visitor stays put:

1. Atmosphere + reflective texture  
2. Logo animation + light sweep  
3. Marine visual beat  
4. Aviation transition  
5. Headline + sentence + CTAs settle  

Scroll or interaction cancels leftover choreography and shows the settled state.

## Technical constraints

- CSS / SVG / Framer Motion / optimized stills (or tiny video) only.
- No custom 3D models, large WebGL, or heavy video backgrounds.
- Server Components by default; client islands for motion and slider only.
- Meet [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md) — emotion cannot cost
  a failed Lighthouse score.

## Copy guardrails

- No prices.
- Free estimates **only** in the Fort Lauderdale area — state near estimate CTA.
- No fake reviews or invented project claims.
- Placeholders labeled until real assets arrive.

## Definition of done

- Section order matches the story flow above.
- Every animation in the catalogue is either implemented per spec or explicitly
  deferred in the PR with rationale (no silent improvisation).
- Reduced-motion path verified.
- Portal preview omitted or “Coming Soon” mock only — not a functional portal.
- Quality gates green; Playwright covers load, CTAs, before/after keyboard use,
  and reduced-motion.
