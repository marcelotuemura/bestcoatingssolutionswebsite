# AGENTS.md

Operating guide for agents working in this repository.

## Project

Single **Next.js (App Router)** application — the Best Coatings Solutions
marketing site (and future customer portal). See `README.md` and
`PROJECT_OVERVIEW.md` for scope and `docs/architecture` for design.

The repository is in the **foundation phase**: tooling, CI, testing and SEO
scaffolding are complete; the `/` route is an intentional minimal placeholder.
Do not build marketing pages/components unless the roadmap phase calls for it
(`ROADMAP.md`).

## Standard commands

All commands are defined in `package.json` scripts (package manager: **pnpm**).
Common ones: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`,
`pnpm typecheck`, `pnpm test`, `pnpm test:e2e`. Full quality gate before a PR:
`pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

## Cursor Cloud specific instructions

- **Service:** one Next.js app. Run it with `pnpm dev` (Turbopack) on
  `http://localhost:3000`. There is no database/backend to start in the
  foundation phase.
- **Dependencies** are refreshed automatically by the startup update script
  (`pnpm install`). You normally don't need to run it manually.
- **E2E browsers are not installed by the update script.** Before running
  `pnpm test:e2e` on a fresh VM, run once:
  `pnpm exec playwright install --with-deps chromium`. Playwright's config boots
  its own server via `pnpm build && pnpm start`, so don't expect it to reuse
  `pnpm dev`; if port 3000 is already busy it will reuse the running server
  locally (`reuseExistingServer`).
- **Git hooks are active (Husky).** Commits must follow Conventional Commits
  (commit-msg → commitlint) and `pre-push` runs `typecheck` + `test`. Keep the
  suite green or pushes will be blocked. Never use `--no-verify` to bypass.
- **Do not run production build against a running dev server simultaneously** —
  both write `.next/`. Stop `pnpm dev` before `pnpm build`, or vice versa.
- **Env:** copy `.env.example` to `.env.local` if needed. Only `NEXT_PUBLIC_*`
  vars reach the browser; no secrets are required to run the foundation locally.
