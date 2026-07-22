# Deployment

## Platform

Deployed on **Vercel** (first-class Next.js App Router support, edge network,
image optimization, preview deployments, and Vercel Analytics).

## Environments

| Environment | Trigger                    | URL                          |
| ----------- | -------------------------- | ---------------------------- |
| Production  | Merge/push to `main`       | Primary domain               |
| Preview     | Every pull request         | Auto per-PR preview URL      |
| Local       | `pnpm dev`                 | `http://localhost:3000`      |

Set `NEXT_PUBLIC_SITE_URL` per environment so canonical URLs, Open Graph tags and
the sitemap resolve correctly (production domain, preview URL, or localhost).

## CI/CD

- **CI (GitHub Actions, `.github/workflows/ci.yml`):** on every PR and push to
  `main` — install (frozen lockfile) → `typecheck` → `lint` → `test` → `build`,
  then a separate **E2E** job runs Playwright and uploads the report.
- **CD (Vercel):** Vercel builds and deploys previews for PRs and production on
  `main`. Keep Vercel's build command as `next build` and install with pnpm.

Recommended branch protection on `main`: require the CI checks above and at least
one review (CODEOWNERS).

## Environment variables

Configure in Vercel Project Settings (and GitHub Actions secrets where CI needs
them). See `.env.example` for the full list. Never commit real secrets. Only
`NEXT_PUBLIC_*` variables are exposed to the browser.

## Build & run locally (production parity)

```bash
pnpm build      # optimized production build
pnpm start      # serve the production build on :3000
```

## Performance budgets (Core Web Vitals)

Full budget and anti-patterns: [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md).

Targets enforced via review (and Lighthouse/CI as pages land):

- **LCP** < 2.5s, **CLS** < 0.1, **INP** < 200ms on mid-tier mobile.
- Lighthouse Performance **90+** on mobile where practical.
- Ship minimal client JS (Server Components first); animation is homepage-only.
- Images via `next/image` (AVIF/WebP) with explicit dimensions.

## Rollback

Use Vercel's instant rollback to a previous production deployment; because `main`
is always deployable and history is linear (squash merges), reverting a PR is
also straightforward.
