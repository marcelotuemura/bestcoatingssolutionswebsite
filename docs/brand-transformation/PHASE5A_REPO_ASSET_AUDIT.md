# Phase 5A — Repository and Asset Re-Audit

**Status:** Awaiting owner approval  
**Branch:** `cursor/phase-5a-repo-asset-audit-5ec4`  
**Base:** Phase 4 Trust Experience tip (`cursor/phase-4-trust-experience-5ec4`)  
**Date:** 2026-07-26  
**Scope:** Audit + documentation only. **No visual redesign.**

Companion inventory: [`PHASE5A_ASSET_INVENTORY.md`](./PHASE5A_ASSET_INVENTORY.md)

---

## Phase completed

Phase 5A only:

1. Read approved brand-transformation docs (Phases 1–4 + working addendum).  
2. Audited routes, components, divisions, tokens, fonts, i18n, project schema, tests.  
3. Inspected logo implementation vs described official mark.  
4. Inventoried all repository images / placeholders / fixture media.  
5. Captured current-state desktop (1440) and mobile (390) screenshots for Home, About, Marine, Aviation, Projects, Contact.  
6. Produced gap analysis vs the new Master Development Prompt and a phased implementation plan for 5B–5J.  
7. **Did not** redesign UI, change nav, rewrite pages, or invent assets.

---

## Strategic sources reviewed

| Document | Role |
|----------|------|
| `PHASE1_WEBSITE_AUDIT.md` | Baseline engineering vs brand gap |
| `PHASE2_BRAND_STRATEGY.md` / `PHASE2_BRAND_VOICE_GUIDE.md` | Positioning + voice |
| `PHASE3_COPYWRITING_REPORT.md` | Craftsman copy |
| `PHASE4_TRUST_EXPERIENCE_REPORT.md` | Trust architecture on Home + About |
| `WORKING_PROMPT_ADDENDUM.md` | Locked decisions |
| Root: `DESIGN_SYSTEM.md`, `BRAND_GUIDE.md`, `PHOTOGRAPHY_GUIDE.md`, `docs/assets/PLACEHOLDER_INVENTORY.md`, `docs/branding/README.md` | Tokens, photo policy, branding gaps |

---

## Current-state summary (after Phase 4)

**Strengths**

- Solid Next.js App Router + EN/ES i18n architecture.  
- Peer division routes exist: `/marine`, `/aviation`.  
- Trust copy and About story (Meet Marcelo, principles, journey, disclaimer) are in place.  
- Honest empty states for projects and photography (no fake portfolio).  
- Dark navy / electric accent token system exists and is restrained.

**Weaknesses vs Master Prompt**

- **Aviation is under-represented** on the homepage (section unmounted) and absent from primary nav.  
- **Division choice is buried** — Marine appears late; Aviation only via footer / dedicated page.  
- **No official logo** in repo; header uses a text monogram; hero uses a temporary SVG without boat/jet.  
- **No authentic photography** — silhouettes and empty photo slots only.  
- **Typography is Inter-only** — still reads SaaS-adjacent vs premium editorial.  
- **Projects:** 0 published; no Marine/Aviation filters.  
- **Aviation status** remains `coming-soon` with strong “not offered” framing — conflicts with “legitimate subdivision” positioning (must be resolved carefully, without inventing operational claims).

---

## Route map

### Marketing (`app/[locale]/…`)

| Path | Composition | Status |
|------|-------------|--------|
| `/` | `HomePage` | Live — trust-first order |
| `/about` | `AboutPage` | Live — Meet Marcelo |
| `/marine` | `MarineDivisionPage` | Live — active |
| `/aviation` | `AviationDivisionPage` | Live — Coming Soon preview |
| `/services`, `/services/[slug]` | Marine services only | Live (8 slugs) |
| `/projects`, `/projects/[slug]` | Portfolio | Live — empty published set |
| `/before-after` | Placeholder slider | Live — demo |
| `/contact`, `/estimate-request`, `/schedule-visit`, `/thank-you` | Conversion | Live |
| `/service-area`, `/faq`, `/resources`, `/workmanship` | Trust/SEO | Live |
| `/privacy`, `/terms` | Legal | Live |
| `/accessibility` | Placeholder | Incomplete |

### Primary nav today (`config/routes.ts`)

`Marine · Services · Projects · Resources · About · Contact`

**Target (Master Prompt):** `Home · About · Marine · Aviation · Projects · Contact`

### Division config (`config/divisions.ts`)

| Division | Status | Listed |
|----------|--------|--------|
| marine | `active` | yes |
| aviation | `coming-soon` | yes |

Architecture **supports** separate division landings. Prominence and status messaging do **not** yet match “one brand, two specialized divisions.”

---

## Component map (homepage)

Current `HomePage.tsx` order:

1. Hero  
2. Meet Marcelo (`WhoWeAreSection`)  
3. Philosophy  
4. Craft (`WhyBcsSection`)  
5. Craftsmanship principles  
6. What You Can Expect  
7. Featured Work  
8. Marine services teaser  
9. Service Area  
10. Estimate CTA  

**Present but not mounted:** `AviationSection`.  
**Removed from home in Phase 4:** Before/After demo (lives on `/before-after`).

**Target Master Prompt order:** Hero → **Marine + Aviation divisions** → Meet Marcelo → Philosophy → Craft → Standards → Journey → Featured → Marine services → Aviation services → Service Area → Estimate.

---

## Logo findings

| Surface | Implementation |
|---------|----------------|
| Header / footer brand link | `Logo.tsx` — CSS monogram “BCS” + text name; optional tagline (currently empty) |
| Homepage hero | Temporary SVG `/brand/bcs-logo-temporary.svg` |
| Official mark described by owner | Powerboat + business jet + metallic BCS + wordmark — **not in repository** |
| `docs/branding/` | README only — masters outstanding |

**Decision required before Phase 5C:** Supply official logo files (SVG). Until then, document temporary mark limitations (see asset inventory) and do **not** invent alternate logos.

---

## Design tokens & typography

| Concern | Current | Gap |
|---------|---------|-----|
| Colors | Tailwind v4 `@theme` in `app/globals.css` — navy / electric / silver | Align naming/docs with Master Prompt (graphite, brushed silver); keep electric spare |
| Fonts | **Inter only** (`next/font/google`) | Needs premium display + body pairing (Phase 5B) with licensing notes |
| Spacing / containers | `Section` / `Container` (`max-w-6xl`) | Refine editorial widths in 5B |
| Motion | Framer Motion reveals + reduced-motion | Keep spare; avoid tech/gaming motion |
| Cards / chrome | Some bordered cards remain | Prefer photography + typography over card grids in redesign |

---

## Internationalization

- UI locales: **en**, **es** with shape-locked dictionaries.  
- Business spoken languages listed: English, Spanish, Portuguese, Japanese (not all UI locales).  
- Marine + aviation page copy exists in both languages; aviation homepage keys exist but unused while section unmounted.  
- Site meta remains marine-weighted (`Marine Refinishing` in default title).

---

## Project schema

- Published projects: **0**.  
- Schema supports images, repair stages, before/after pairs, owner approval.  
- **No All / Marine / Aviation filter UI** yet.  
- Fixture catalog (240 synthetic marine assets) must never be published as real work.

---

## Aviation content gaps & legal caution

Catalogue slugs in `config/services.ts` (not public detail pages) include items that need owner verification before any public aviation service pages:

- Aircraft Refinishing  
- Composite Repair  
- Spot Paint Repair  
- Metallic Refinishing  
- Ceramic Protection  
- Interior Component Refinishing  
- Mobile or Partner-Facility Service  

**Must not imply** without documentation: FAA repair-station status, airworthiness approval, structural maintenance, avionics, manufacturer authorization.

Master Prompt wants Aviation visible as a legitimate division while Marine stays primary. That likely means:

- Elevate Aviation in nav + homepage division strip.  
- Soften “not offered today” toward **specialized division / select projects / carefully scoped cosmetics** — only with owner-approved operational wording.  
- Keep estimate/booking guardrails until status changes from `coming-soon`.

---

## Background / manufacturer naming gaps

Master Prompt expands verified names beyond Phase 4 About copy.

| Group | Master Prompt | In About today |
|-------|---------------|----------------|
| Employers / associated | Aisin Sin Ei, Toyota, Honda, Mitsubishi, MarineMax, Nautical Ventures, HCB, Bombardier, military helicopters | Partial (Aisin, MarineMax, Nautical Ventures, HCB, Bombardier) |
| Vessel manufacturers | Azimut, Viking, Riva, Ferretti, De Antonio, Beneteau, Axopar, Shaefer, HCB | Listed on About (owner-confirmed spelling: Shaefer) |
| Disclaimer | Employer **and manufacturer** names; no endorsement / affiliation / **authorization** / partnership | Present; should be aligned to Master Prompt wording in 5G |

Phase 5G should add factual background language only — never logos, never “trusted by.”

---

## Legal-risk wording (current)

- About uses factual “while employed by…” / “contributed to…” and an explicit non-endorsement disclaimer.  
- Unit tests ban endorsement-style phrases.  
- Aviation page correctly denies authorized-facility status.  
- Residual risk: aviation catalogue names and any future “active division” copy must stay scoped to cosmetic refinishing.

---

## Tests relevant to later phases

| Suite | Note |
|-------|------|
| `tests/e2e/home.spec.ts` | Currently asserts `#aviation` **absent** from homepage — must update when 5D remounts divisions |
| `tests/e2e/phase3*.spec.ts` | Aviation Coming Soon + contact-only CTA |
| `tests/e2e/phase5.spec.ts` | About trust blocks |
| `tests/unit/phase4-trust.test.ts` | Nav About, short hero, disclaimer |
| `tests/unit/config.test.ts` | Aviation non-active status |

---

## Screenshots (current state)

Captured 2026-07-26 against the Phase 4 build (no redesign):

| Page | Desktop 1440 | Mobile 390 |
|------|--------------|------------|
| Home | `/opt/cursor/artifacts/phase5a-screenshots/home-desktop-1440.png` | `…/home-mobile-390.png` |
| About | `…/about-desktop-1440.png` | `…/about-mobile-390.png` |
| Marine | `…/marine-desktop-1440.png` | `…/marine-mobile-390.png` |
| Aviation | `…/aviation-desktop-1440.png` | `…/aviation-mobile-390.png` |
| Projects | `…/projects-desktop-1440.png` | `…/projects-mobile-390.png` |
| Contact | `…/contact-desktop-1440.png` | `…/contact-mobile-390.png` |

Script used: `scripts/capture-phase5a-screenshots.mjs`.

---

## Gaps vs Master Prompt (priority)

| # | Gap | Severity | Target phase |
|---|-----|----------|--------------|
| 1 | Official logo missing; dual header/hero marks | P0 | Owner supply → 5C |
| 2 | No authentic Marine/Aviation photography | P0 | Owner supply → 5D+ |
| 3 | Homepage lacks division strip after hero; Aviation unmounted | P0 | 5D |
| 4 | Primary nav ≠ Home/About/Marine/Aviation/Projects/Contact | P0 | 5C |
| 5 | Aviation framed only as Coming Soon footnote | P0/P1 | Owner decision → 5F |
| 6 | Inter-only type system | P1 | 5B |
| 7 | Manufacturer/employer list incomplete vs verified list | P1 | 5G |
| 8 | Projects empty; no division filters | P1 | 5H (+ owner photos) |
| 9 | Aviation service catalogue not owner-verified for public pages | P1 | 5F |
| 10 | Hero support copy slight revision vs Master Prompt | P2 | 5D |
| 11 | Favicon / OG missing | P2 | 5B/5C |
| 12 | Accessibility route still placeholder | P3 | Later |

---

## Proposed implementation plan (after approval)

Do **not** start these until Phase 5A is approved. Each sub-phase stops for approval.

| Phase | Focus | Depends on |
|-------|-------|------------|
| **5B** | Visual identity system (tokens, type, spacing, buttons, motion, logo usage rules). Preview route or controlled surfaces only. | 5A approval; logo file if available |
| **5C** | Header, footer, nav (Home/About/Marine/Aviation/Projects/Contact), mobile nav, division route chrome | 5B |
| **5D** | Homepage premium redesign with division strip immediately under hero; trust sections; authentic imagery | 5B–5C + photos |
| **5E** | Marine division landing + services | 5B–5D |
| **5F** | Aviation division (visible, carefully scoped; flag every claim) | Owner aviation ops wording + imagery |
| **5G** | About / trust experience under new system; full verified background list + disclaimer | 5B + Marcelo photo |
| **5H** | Projects stories + All/Marine/Aviation filters | Approved project data |
| **5I** | Contact / estimate (division selector) | 5C |
| **5J** | QA: a11y, SEO, performance, EN/ES, reduced motion | All above |

### Recommended owner decisions before 5B

1. **Upload official logo** SVG(s) to the repo (or attach for commit).  
2. Confirm **Aviation public posture:** keep `coming-soon` booking lock, but present as a real division — approve exact status language.  
3. Confirm which **aviation service names** may appear publicly.  
4. Supply or schedule **P0 photography** (marine hero, aviation still, Marcelo, one B/D/A set).  
5. Confirm Phase 4 Trust Experience PR can merge (or rebase 5B onto approved tip).  
6. Confirm expanded **manufacturer list** may appear with the factual disclaimer.

---

## Decisions made in Phase 5A

- Branched from Phase 4 tip so the audit reflects the latest trust architecture.  
- Treated fixture media catalog and gallery upload tiles as **non-marketing**.  
- Recorded official logo as **missing** rather than approximating it.  
- Kept Aviation booking guardrails in the plan until owner changes `divisions.aviation.status`.  
- Mapped Master Prompt IA over Phase 4 trust order: **divisions rise above Meet Marcelo**; trust blocks remain, not discarded.

---

## Deferred (intentionally not done)

- Any visual redesign or token change  
- Nav / homepage reorder  
- Copy rewrites for Aviation elevation  
- Adding manufacturer names to About  
- Font pairing implementation  
- Publishing projects or filters  
- Stock photography  
- Alternate logo creation  

---

## Risks / questions for owner

1. Is Aviation booking still **off** while the division becomes visually peer to Marine? (Recommended: yes — visible + carefully scoped + no fake booking.)  
2. Where is the **official logo file** for commit?  
3. Which manufacturer names are confirmed for public About copy (especially vessel OEMs and automotive brands)?  
4. Should Portuguese/Japanese become UI locales later, or remain “languages spoken” only?  
5. Merge strategy: approve/merge Phase 4 before 5B, or stack 5B on this branch?

---

## Tests run this phase

Phase 5A is documentation-only. Verification performed:

| Command | Result |
|---------|--------|
| Repository / asset file scan | Completed — inventory written |
| Screenshot capture (`scripts/capture-phase5a-screenshots.mjs`) | 12 PNGs written |
| Code/config reads for routes, divisions, logo, tokens | Completed |

Full typecheck/lint/test/build gates apply to implementation phases (5B+). Baseline from Phase 4 tip: typecheck + 244 unit tests were green on that branch before this audit branch was cut.

---

## Files changed (this phase)

- `docs/brand-transformation/PHASE5A_REPO_ASSET_AUDIT.md` *(this file)*  
- `docs/brand-transformation/PHASE5A_ASSET_INVENTORY.md`  
- `docs/brand-transformation/README.md`  
- `docs/brand-transformation/WORKING_PROMPT_ADDENDUM.md`  
- `scripts/capture-phase5a-screenshots.mjs`

---

## Approval request

**Please approve Phase 5A** (audit + plan) before any Phase 5B visual identity work.

Stop gate active — no redesign until you confirm.
