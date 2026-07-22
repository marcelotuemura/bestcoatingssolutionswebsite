# Testing Strategy

A pragmatic testing pyramid: many fast unit/component tests, a focused set of
end-to-end tests for critical user journeys.

## Tooling

| Layer            | Tool                                   | Location            |
| ---------------- | -------------------------------------- | ------------------- |
| Unit / component | Vitest + Testing Library (jsdom)       | `tests/unit/**`     |
| End-to-end       | Playwright (real browser)              | `tests/e2e/**`      |
| Types            | `tsc --noEmit`                         | whole repo          |
| Lint             | ESLint (flat) incl. `jsx-a11y`         | whole repo          |

Config: `vitest.config.ts`, `playwright.config.ts`, shared setup in
`tests/setup.ts`. The `@/*` alias works in both runners.

## Commands

```bash
pnpm test            # unit/component (CI mode)
pnpm test:watch      # watch mode
pnpm test:coverage   # coverage report (coverage/)
pnpm test:e2e        # Playwright (builds + starts the app automatically)
pnpm test:e2e:ui     # Playwright UI mode
```

Playwright's `webServer` runs `pnpm build && pnpm start`, so E2E always tests a
production build. Install browsers once with
`pnpm exec playwright install --with-deps chromium`.

## What to test

- **Unit:** pure logic and data — helpers (`utils/`), config/derived data
  (`config/`), SEO builders (`lib/seo/`), and hooks (`hooks/`). Current suite
  covers `cn` and the route/service registries.
- **Component:** rendering, props, accessibility roles, and interaction for
  reusable components (added with Phase 1 UI).
- **E2E:** critical journeys — page loads/status, navigation, SEO endpoints
  (`sitemap.xml`, `robots.txt`), and (later) estimate/schedule/contact form
  submission and portal auth.

## Conventions

- Co-locate or mirror source structure under `tests/`.
- Test behavior, not implementation details; query by role/label (a11y-first).
- Deterministic tests only — no reliance on network or real third parties; mock
  via `services/` fakes.
- Add/adjust tests for the behavior you change; keep the suite green before push
  (enforced by the `pre-push` hook).

## Coverage

Coverage is collected for `lib/`, `utils/`, `config/`, `hooks/` (see
`vitest.config.ts`). Thresholds will be introduced as the domain logic grows to
avoid gaming coverage on presentational code.
