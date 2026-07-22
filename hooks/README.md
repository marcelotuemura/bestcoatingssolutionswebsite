# `hooks/`

Reusable **Client Component** React hooks (`useXxx.ts`). Examples that will live
here: `useMediaQuery`, `useScrollProgress`, `useReducedMotion`, form helpers.

Rules:

- Every file starts with `'use client'` — hooks run on the client.
- Keep hooks focused and composable (single responsibility / SOLID).
- No direct network calls; depend on `services/` abstractions instead.
- Co-locate unit tests as `useXxx.test.ts`.
