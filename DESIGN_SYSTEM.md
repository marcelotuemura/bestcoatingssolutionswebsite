# Design System

Best Coatings Solutions visual identity: **craftsmanship, precision, dual Marine & Aviation** — dark, calm, editorial. Not a SaaS template.

**Phase 5B source of truth:** [`docs/brand-transformation/PHASE5B_VISUAL_IDENTITY.md`](./docs/brand-transformation/PHASE5B_VISUAL_IDENTITY.md)

Machine-readable tokens: [`app/globals.css`](./app/globals.css) (`@theme`).  
Controlled preview: `/en/design-system` (noindex, not in primary nav).

Strategic manuals: [`BRAND_GUIDE.md`](./BRAND_GUIDE.md), [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md).

---

## Semantic color

Prefer semantic utilities over raw palette names in new work.

| Token | CSS variable | Role |
|-------|--------------|------|
| `bg-bg-primary` | `--color-bg-primary` | Page background |
| `bg-bg-secondary` | `--color-bg-secondary` | Alternate bands |
| `bg-surface` | `--color-surface` | Cards / raised |
| `bg-accent` / `text-accent` | `--color-accent` | CTA / links (spare) |
| `bg-accent-hover` | `--color-accent-hover` | Hover |
| `text-text-primary` | `--color-text-primary` | Primary copy |
| `text-text-secondary` | `--color-text-secondary` | Supporting |
| `text-text-muted` | `--color-text-muted` | Captions |
| `border-border` | `--color-border` | Borders |
| `border-divider` | `--color-divider` | Quiet rules |

Primitives (`navy-*`, `electric-*`, `silver-*`) remain for compatibility.

Electric blue is **accent only**.

---

## Typography

| Role | Family | Notes |
|------|--------|-------|
| Display (H1/H2) | **Newsreader** | `--font-display` · OFL · Google Fonts |
| Body / UI / buttons | **Manrope** | `--font-sans` · OFL · Google Fonts |
| Captions | Manrope | Smaller, muted, tracking-wide |

Loaded in `app/[locale]/layout.tsx` via `next/font` (swap, latin + latin-ext).

Weights: prefer 400–600. Avoid ultra-black display weights.

---

## Spacing

Documented scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96px (`--space-*` in `:root`).  
Section rhythm: generous (desktop ~64–96px vertical). Calm over dense.

---

## Radius

| Token | Use |
|-------|-----|
| `--radius-control` | Buttons, inputs |
| `--radius-media` | Photography (near-square, editorial) |
| `--radius-card` | Editorial cards |

Avoid pill-heavy SaaS chrome.

---

## Buttons

`components/ui/Button.tsx` + `ButtonLink.tsx`:

- **Primary** — accent fill  
- **Secondary** — surface + border  
- Ghost / link — sparse supporting actions  

One system. Clear focus rings. `prefers-reduced-motion` safe press scale.

---

## Cards & media

- `EditorialCard` — imagery-led, minimal border, subtle inset highlight  
- `MediaFrame` — aspect ratios, division atmosphere classes, honest captions, restrained hover scale  

---

## Motion

Ease: `--ease-premium` = `cubic-bezier(0.16, 1, 0.3, 1)`.  
Durations: fast 150ms · base 280ms · slow 500ms.  
Think Apple / Porsche / Feadship — not gaming or crypto UI.

---

## Marine vs Aviation

Same type, spacing, and controls. Personality via imagery and sparse atmosphere:

- **Marine** — `.bcs-marine-texture` · water depth, hull reflections, fiberglass  
- **Aviation** — `.bcs-aviation-texture` · steel/graphite wash, precision surfaces  

---

## Logo

`config/brand-logo.ts` · `components/brand/BrandLogoMark.tsx` · `public/brand/README.md`

Header still uses the text `Logo` until Phase 5C evaluates the official file in chrome. Full mark preview lives on `/design-system`.
