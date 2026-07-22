# Design System

The BCS visual identity: **Apple meets Feadship meets Gulfstream** — dark,
premium, minimal, technical. No template appearance.

Strategic identity and usage rules: [`BRAND_GUIDE.md`](./BRAND_GUIDE.md) (full
brand manual). Homepage WOW + motion catalogue:
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md). Postponed product work:
[`FUTURE.md`](./FUTURE.md).

The machine-readable source of truth is the Tailwind v4 `@theme` block in
[`app/globals.css`](./app/globals.css); this document explains intent and usage.

## Palette

| Token            | Hex       | Usage                                   |
| ---------------- | --------- | --------------------------------------- |
| `navy-950`       | `#050d18` | Page background (near-black navy)       |
| `navy-900`       | `#0a1a2f` | Primary dark surfaces / theme color     |
| `navy-800`       | `#0f2340` | Raised surfaces / cards                 |
| `navy-700`       | `#163254` | Borders on dark, hovers                 |
| `electric-400`   | `#3b9dff` | Accent hover / highlights               |
| `electric-500`   | `#0a84ff` | Primary accent (CTAs, focus)            |
| `electric-600`   | `#0066cc` | Accent pressed                          |
| `silver-100`     | `#f4f6f8` | Primary text on dark                    |
| `silver-300`     | `#cbd3dc` | Secondary text                          |
| `silver-500`     | `#9aa7b5` | Muted text / captions                   |
| White            | `#ffffff` | Emphasis text, gradients                |

Aesthetic modifiers: **glass** (subtle translucency + blur), **metal**
(gradients from silver→white), used sparingly for luxury.

Utilities are generated from tokens, e.g. `bg-navy-900`, `text-electric-500`,
`border-navy-700`.

## Typography

- Sans: **Inter** via `next/font` (`--font-inter`), mapped to `--font-sans`.
- Scale: fluid, restrained; large confident headings, generous line-height for
  body. Use `text-balance`/`text-pretty` for headlines.
- Weight: prefer 400–600; avoid heavy weights except for hero moments.

## Spacing, radius, elevation

- Spacing: Tailwind's 4px scale; generous whitespace is part of the luxury feel.
- Radius: soft, consistent (`rounded-xl`/`rounded-2xl` for cards/pills).
- Elevation: prefer border + subtle gradient over heavy shadows on dark UI.

## Motion

- **Homepage only.** All other pages are static and fast.
- Library: **Framer Motion**; variants centralized in `animations/`.
- Principles: purposeful, subtle, physical easing; short durations; no motion
  that blocks content. GSAP only if an effect is impossible in Framer Motion.
- **Accessibility:** always honour `prefers-reduced-motion` (globals.css already
  disables smooth scroll under it); provide reduced/no-motion variants.

## Iconography & imagery

- Icons: minimal line style; consistent stroke weight.
- Imagery: high-end marine/aviation photography; always via `next/image` with
  explicit dimensions and AVIF/WebP.

## Components (Phase 1)

Primitives to build in `components/ui`: `Button`, `Container`, `Section`, `Card`,
`Input`, `Badge`. Each: typed props, AA contrast, visible focus ring
(`electric-500`), keyboard support.
