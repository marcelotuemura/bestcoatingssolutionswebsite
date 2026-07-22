# `components/`

Reusable React components. **Server Components by default**; a component only
becomes a Client Component (`'use client'`) when it needs interactivity, browser
APIs or animation.

Recommended organisation as the UI grows:

- `components/ui/` — primitive, presentational building blocks (Button, Card, Input).
- `components/layout/` — Header, Footer, navigation, section shells.
- `components/sections/` — page-specific composed sections.
- `components/forms/` — form fields wired to React Hook Form + Zod.

Conventions:

- One component per file, `PascalCase.tsx`; co-locate `*.test.tsx`.
- Props typed with an exported `interface`; no `any`.
- Style with Tailwind utilities and the brand tokens from `app/globals.css`.
- Keep components pure and presentational; data fetching belongs in Server
  Components / `services/`.
