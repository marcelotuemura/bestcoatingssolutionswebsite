# `animations/`

Centralised motion tokens and Framer Motion variants.

- Tokens: `tokens.ts` (durations, easing, distances)
- Variants: `variants.ts` (+ reduced-motion presets)
- Catalogue / choreography: [`HOME_EXPERIENCE.md`](../HOME_EXPERIENCE.md)

Homepage is the **only** page with premium animation. Import variants only from
homepage client islands. Always honour `prefers-reduced-motion` via
`hooks/use-prefers-reduced-motion.ts` and CSS in `app/globals.css`.
