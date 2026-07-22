# Contributing

Thanks for contributing to the Best Coatings Solutions website. This guide keeps
the codebase consistent, reviewable and safe to evolve for years.

## Prerequisites

- Node ≥ 20.11, pnpm ≥ 9 (`corepack enable` uses the pinned version).
- Run `pnpm install` once; Husky git hooks are installed automatically.

## Branching strategy

Trunk-based with short-lived branches off `main`:

- `main` — always deployable; protected. Every merge produces a Vercel
  production deploy.
- Feature branches: `feat/<scope>-<short-desc>`
- Fixes: `fix/<scope>-<short-desc>`
- Chores/tooling: `chore/<scope>-<short-desc>`
- Docs: `docs/<short-desc>`

Open a Pull Request early (draft is fine). Every PR gets a **Vercel Preview
Deployment** and must pass CI before merge. Prefer **squash merge** to keep a
clean, linear history.

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org/), enforced by
commitlint via the `commit-msg` hook.

```
<type>(<optional scope>): <description>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`.

Examples:

```
feat(marine): add services overview section
fix(seo): correct canonical URL on gallery
chore(deps): bump next to 15.5.4
```

## Local quality gates

Git hooks (Husky) run automatically:

- **pre-commit** → `lint-staged` (ESLint + Prettier on staged files).
- **commit-msg** → commitlint.
- **pre-push** → `pnpm typecheck` + `pnpm test`.

Before opening a PR, the full gate is:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

For UI/route work, also run E2E: `pnpm test:e2e`.

## Coding standards

- **TypeScript strict**; no `any`. Prefer types inferred from Zod schemas.
- **Server Components by default**; add `'use client'` only when necessary.
- Keep third-party access inside `services/`; keep components presentational.
- Follow SOLID/DRY/KISS; don't add dependencies without clear justification.
- Style with Tailwind utilities and brand tokens (see `DESIGN_SYSTEM.md`).
- Meet accessibility AA (`ACCESSIBILITY.md`) and respect `prefers-reduced-motion`.
- Co-locate tests; add/adjust tests for the behavior you change (`TESTING.md`).

## Pull request checklist

The PR template captures the full list. At minimum: typecheck, lint, unit tests
and build pass; a11y and SEO considered; docs updated when relevant.
