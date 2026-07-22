# `styles/`

Home for additional global or modular CSS beyond the Tailwind entrypoint.

- The Tailwind v4 entrypoint and brand `@theme` tokens live in
  `app/globals.css` (imported by the root layout).
- Use this folder for anything that cannot be expressed as a utility: complex
  keyframes, print styles, third-party style overrides, or CSS Modules
  (`*.module.css`) scoped to a component.

Prefer Tailwind utilities first; only reach for custom CSS when necessary (DRY).
