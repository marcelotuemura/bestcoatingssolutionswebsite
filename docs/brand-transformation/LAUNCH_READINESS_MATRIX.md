# Launch Readiness Matrix

**Single source of truth for public launch decisions.**  
**Phase:** 6 — Production Launch Readiness (**Approved**)  
**Release state:** **Release Candidate** — do not tag `v1.0.0` until this matrix is fully green  
**Updated:** 2026-07-26  
**Release target tag:** `v1.0.0` (Best Coatings Solutions Website)  
**Final human gate:** [`LAUNCH_ACCEPTANCE_REVIEW.md`](./LAUNCH_ACCEPTANCE_REVIEW.md)

Status legend: ✅ Ready · ⏳ Pending · 🔶 Partial · 🚫 Blocker · ➖ N/A

---

## Brand & visual assets

| Area | Status | Notes |
|------|--------|-------|
| Official logo (SVG/PNG/WebP) | 🚫 Blocker | Drop `public/brand/bcs-logo-official.{svg\|webp\|png}`; architecture already switches via `config/brand-logo.ts` |
| Interim logo treatment | 🔶 Partial | Text wordmark header + temporary SVG for evaluation only — never present as official |
| Real Marine hero photography | 🚫 Blocker | Replace `marketingPlaceholders.marineHero` silhouette |
| Aviation hero photography | 🚫 Blocker | Replace `marketingPlaceholders.aviationHero` silhouette |
| Marcelo portrait / workshop photo | 🚫 Blocker | About + homepage Meet Marcelo slots |
| Project / process photography | ⏳ Pending | DAM intake; honest empty Projects until approved |
| Manufacturer spelling verification | ✅ Verified | Owner-confirmed: **Shaefer** (not Sheaffer / Schaefer) |

---

## Legal & trust

| Area | Status | Notes |
|------|--------|-------|
| Privacy Policy | 🚫 Blocker | Provisional copy + review badge; owner + legal review required — do not invent |
| Terms of Service | 🚫 Blocker | Provisional copy + review badge; owner + legal review required |
| Employer / manufacturer disclaimer | ✅ Verified | Includes authorization; rendered on About |
| Aviation scope exclusions | ✅ Verified | Cosmetic-only; no FAA/airworthiness claims |
| No invented reviews / partnerships | ✅ Verified | Empty-safe testimonials; claim discipline tests |

---

## Product & conversion

| Area | Status | Notes |
|------|--------|-------|
| Contact form UX / validation | ✅ Verified | Phase 4 e2e coverage |
| Estimate form UX / validation | ✅ Verified | Phase 4 e2e coverage |
| Production form delivery | 🔶 Partial | Thank-you copy still references demonstration mode on brand-main; confirm delivery wiring on ops/form branch before go-live |
| CTA hierarchy | ✅ Verified | Estimate default; Contact on Aviation + About (header + page) |
| EN/ES lexicon | ✅ Verified | Phase 5G.5 normalization (`refinación`, `igualación de color`) |
| About craftsman narrative | ✅ Verified | Phase 5G approved |
| Marine / Aviation division pages | ✅ Verified | Phases 5E / 5F approved |

---

## Engineering quality

| Area | Status | Notes |
|------|--------|-------|
| Typecheck / unit suite | ✅ Verified | `pnpm typecheck` · `pnpm test` (266+) |
| Marketing e2e smoke | ✅ Verified | Phase 3 / 4 / 5 suites on flagship routes |
| Accessibility (engineering) | 🔶 Partial | Semantic tokens, AA resting/hover primary, reduced-motion, skip link; full axe/manual SR pass still recommended |
| Lighthouse / CWV lab | 🔶 Partial | Prior Phase 5D lab unstable; re-run on production preview before launch (targets in `PERFORMANCE_BUDGET.md`) |
| Responsive QA | 🔶 Partial | Breakpoint screenshots through 5G.5; full device matrix pending owner devices |
| Cross-browser | ⏳ Pending | Chromium covered in CI e2e; Safari/Firefox/manual pending |
| robots.txt / sitemap | ✅ Verified | Implemented; thank-you & drafts excluded |
| Security headers / deploy config | 🔶 Partial | See `DEPLOYMENT.md`; confirm production env vars |

---

## Documentation

| Area | Status | Notes |
|------|--------|-------|
| Brand Standards Guide | ✅ Verified | `BRAND_STANDARDS.md` (Phase 6) |
| Transformation archive (Phases 1–5G.5) | ✅ Verified | `docs/brand-transformation/` |
| Working prompt addendum | ✅ Verified | Living constraints |
| This matrix | ✅ Verified | Update at every launch gate |

---

## Go / No-Go

**Public launch is No-Go until all 🚫 Blocker rows are cleared.**

Minimum clear list:

1. Official logo file in repo  
2. Real Marine + Aviation hero photography (or consciously approved interim policy)  
3. Marcelo workshop/portrait photography  
4. Privacy + Terms legal-reviewed content  
5. Production form delivery confirmed (not demonstration mode)  
6. Lighthouse / CWV recorded on production preview meeting budget or explicitly accepted  

When blockers clear → complete [`LAUNCH_ACCEPTANCE_REVIEW.md`](./LAUNCH_ACCEPTANCE_REVIEW.md) → tag **`v1.0.0`**, archive Phases 1–6 docs as baseline, run post-deploy smoke → then Phase 7 Growth & Optimization.
